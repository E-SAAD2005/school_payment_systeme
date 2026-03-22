<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Program;
use App\Models\Group;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['program', 'group']);

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('cne', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function import(Request $request)
    {
        // Si c'est du JSON (depuis le frontend qui a déjà analysé l'Excel)
        if ($request->has('students')) {
            $studentsData = $request->input('students');
            $imported = 0;
            $errors = [];
            $rowNum = 1;

            DB::beginTransaction();
            try {
                foreach ($studentsData as $data) {
                    $cne = trim($data['cne'] ?? '');
                    $lastName = trim($data['last_name'] ?? '');
                    $firstName = trim($data['first_name'] ?? '');
                    $email = trim($data['email'] ?? '');
                    $phone = trim($data['phone'] ?? '');
                    $programName = trim($data['program'] ?? '');
                    $groupName = trim($data['group'] ?? '');

                    if (!$cne || !$lastName || !$firstName) {
                        $errors[] = "Ligne $rowNum: CNE, Nom et Prénom sont obligatoires.";
                        $rowNum++;
                        continue;
                    }

                    $program = Program::where('name', 'like', "%$programName%")->first();
                    if (!$program) {
                        $errors[] = "Ligne $rowNum: Programme '$programName' introuvable.";
                        $rowNum++;
                        continue;
                    }

                    $group = Group::where('program_id', $program->id)
                                 ->where('name', 'like', "%$groupName%")
                                 ->first();
                    if (!$group) {
                        $errors[] = "Ligne $rowNum: Groupe '$groupName' introuvable pour le programme '$programName'.";
                        $rowNum++;
                        continue;
                    }

                    $student = [
                        'cne' => $cne,
                        'last_name' => $lastName,
                        'first_name' => $firstName,
                        'email' => $email ?: null,
                        'phone' => $phone ?: null,
                        'program_id' => $program->id,
                        'group_id' => $group->id,
                        'status' => 'actif'
                    ];

                    $validator = Validator::make($student, [
                        'cne' => 'required|string|unique:students,cne',
                    ]);

                    if ($validator->fails()) {
                        $errors[] = "Ligne $rowNum: " . implode(', ', $validator->errors()->all());
                    } else {
                        Student::create($student);
                        $imported++;
                    }
                    $rowNum++;
                }

                if ($imported === 0 && !empty($errors)) {
                    DB::rollBack();
                    return response()->json(['message' => 'Importation échouée', 'errors' => $errors], 422);
                }

                DB::commit();
                return response()->json([
                    'message' => "$imported étudiants importés avec succès",
                    'errors' => $errors
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Erreur lors de l\'importation: ' . $e->getMessage()], 500);
            }
        }

        // Sinon c'est un fichier CSV classique (méthode de secours)
        $request->validate([
            'file' => 'required|file|max:10240'
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, ['csv', 'txt'])) {
            return response()->json(['message' => 'Le fichier doit être au format CSV.'], 422);
        }

        $path = $file->getRealPath();

        // Tentative de lecture du contenu pour détecter l'encodage
        $content = file_get_contents($path);
        if (!mb_check_encoding($content, 'UTF-8')) {
            $content = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-1, Windows-1252');
            file_put_contents($path, $content);
        }

        $handle = fopen($path, 'r');

        // Detect delimiter (comma or semicolon)
        $firstLine = fgets($handle);
        $delimiter = str_contains($firstLine, ';') ? ';' : ',';
        rewind($handle);

        // Skip header if exists (check if first row has "cne" or "CNE")
        $header = fgetcsv($handle, 0, $delimiter);
        $isHeader = false;
        if ($header) {
            foreach($header as $col) {
                if ($col && (stripos($col, 'cne') !== false || stripos($col, 'nom') !== false)) {
                    $isHeader = true;
                    break;
                }
            }
        }
        if (!$isHeader) rewind($handle);

        $imported = 0;
        $errors = [];
        $rowNum = $isHeader ? 2 : 1;

        DB::beginTransaction();
        try {
            while (($data = fgetcsv($handle, 0, $delimiter)) !== FALSE) {
                if (empty(array_filter($data))) continue;

                // Format: CNE, NOM, PRENOM, EMAIL, TELEPHONE, PROGRAMME (NOM), GROUPE (NOM)
                $cne = trim($data[0] ?? '');
                $lastName = trim($data[1] ?? '');
                $firstName = trim($data[2] ?? '');
                $email = trim($data[3] ?? '');
                $phone = trim($data[4] ?? '');
                $programName = trim($data[5] ?? '');
                $groupName = trim($data[6] ?? '');

                if (!$cne || !$lastName || !$firstName) {
                    $errors[] = "Ligne $rowNum: CNE, Nom et Prénom sont obligatoires.";
                    $rowNum++;
                    continue;
                }

                // Trouver le programme par nom
                $program = Program::where('name', 'like', "%$programName%")->first();
                if (!$program) {
                    $errors[] = "Ligne $rowNum: Programme '$programName' introuvable.";
                    $rowNum++;
                    continue;
                }

                // Trouver le groupe par nom dans ce programme
                $group = Group::where('program_id', $program->id)
                             ->where('name', 'like', "%$groupName%")
                             ->first();
                if (!$group) {
                    $errors[] = "Ligne $rowNum: Groupe '$groupName' introuvable pour le programme '$programName'.";
                    $rowNum++;
                    continue;
                }

                $studentData = [
                    'cne' => $cne,
                    'last_name' => $lastName,
                    'first_name' => $firstName,
                    'email' => $email ?: null,
                    'phone' => $phone ?: null,
                    'program_id' => $program->id,
                    'group_id' => $group->id,
                    'status' => 'actif'
                ];

                $validator = Validator::make($studentData, [
                    'cne' => 'required|string|unique:students,cne',
                ], [
                    'cne.unique' => "Le CNE '$cne' existe déjà.",
                ]);

                if ($validator->fails()) {
                    $errors[] = "Ligne $rowNum: " . implode(', ', $validator->errors()->all());
                } else {
                    Student::create($studentData);
                    $imported++;
                }
                $rowNum++;
            }

            if ($imported === 0 && !empty($errors)) {
                DB::rollBack();
                if (is_resource($handle)) fclose($handle);
                return response()->json(['message' => 'Importation échouée', 'errors' => $errors], 422);
            }

            DB::commit();
            if (is_resource($handle)) fclose($handle);

            return response()->json([
                'message' => "$imported étudiants importés avec succès",
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            if (is_resource($handle)) fclose($handle);
            return response()->json(['message' => 'Erreur lors de l\'importation: ' . $e->getMessage()], 500);
        }
    }

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());

        return response()->json([
            'message' => 'Étudiant ajouté avec succès',
            'data' => $student
        ], 201);
    }

    public function show(string $id)
    {
        return Student::with(['program', 'group'])->findOrFail($id);
    }

    public function update(UpdateStudentRequest $request, string $id)
    {
        $student = Student::findOrFail($id);

        $student->update($request->validated());

        return response()->json([
            'message' => 'Étudiant modifié avec succès',
            'data' => $student
        ]);
    }

    public function destroy(string $id)
    {
        Student::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Étudiant supprimé'
        ]);
    }
}
