<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Student;
use App\Models\Fee;
use App\Models\Payment;

class AlertController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $query = Alert::with(['student.program', 'student.group', 'fee']);

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        if ($request->has('group_id') && $request->group_id != '') {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('group_id', $request->group_id);
            });
        }

        if ($request->has('program_id') && $request->program_id != '') {
            $query->whereHas('student', function($q) use ($request) {
                $q->where('program_id', $request->program_id);
            });
        }

        return response()->json($query->latest()->get());
    }

    public function show($id)
    {
        $alert = Alert::with(['student','fee'])->findOrFail($id);
        return response()->json($alert);
    }

    // توليد alerts تلقائيا
    public function generate()
    {
        $fees = Fee::all();
        $generatedCount = 0;

        foreach ($fees as $fee) {
            $students = Student::where('program_id', $fee->program_id)->get();

            foreach ($students as $student) {
                $totalPaid = Payment::where('student_id', $student->id)
                    ->where('fee_id', $fee->id)
                    ->sum('amount_paid');

                $remaining = $fee->amount_total - $totalPaid;

                if ($remaining > 0) {
                    $dueDate = \Carbon\Carbon::parse($fee->due_date);
                    $today = now();
                    
                    if ($today->gt($dueDate)) {
                        $status = 'en_retard';
                        $message = "🔴 RETARD : Le paiement de la tranche {$fee->installment_number} est dépassé depuis le {$dueDate->format('d/m/Y')}. Action requise : Contactez l'étudiant et régularisez le solde de {$remaining} MAD immédiatement.";
                    } elseif ($today->diffInDays($dueDate) <= 7) {
                        $status = 'a_risque';
                        $message = "🟠 ÉCHÉANCE PROCHE : La tranche {$fee->installment_number} arrive à terme le {$dueDate->format('d/m/Y')}. Action conseillée : Envoyez un rappel préventif pour le solde de {$remaining} MAD.";
                    } else {
                        continue; // Pas d'alerte nécessaire pour l'instant
                    }

                    Alert::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'fee_id' => $fee->id
                        ],
                        [
                            'status' => $status,
                            'message' => $message
                        ]
                    );
                    $generatedCount++;
                } else {
                    // Si payé, on supprime l'alerte si elle existe
                    Alert::where('student_id', $student->id)
                        ->where('fee_id', $fee->id)
                        ->delete();
                }
            }
        }

        return response()->json([
            'message' => 'Alertes générées avec succès',
            'count' => $generatedCount
        ]);
    }
}