<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;

class StudentController extends Controller
{
    public function index()
    {
        return Student::with(['program', 'group'])->get();
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
