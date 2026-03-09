<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Student;
use App\Models\Fee;
use App\Models\Payment;

class AlertController extends Controller
{
    public function index()
    {
        $alerts = Alert::with(['student','fee'])->get();
        return response()->json($alerts);
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

        foreach ($fees as $fee) {

            $students = Student::where('program_id', $fee->program_id)->get();

            foreach ($students as $student) {

                $totalPaid = Payment::where('student_id',$student->id)
                    ->where('fee_id',$fee->id)
                    ->sum('amount_paid');

                $remaining = $fee->amount_total - $totalPaid;

                if ($remaining > 0) {

                    $status = now()->gt($fee->due_date)
                        ? 'en_retard'
                        : 'a_risque';

                    Alert::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'fee_id' => $fee->id
                        ],
                        [
                            'status' => $status,
                            'message' => 'Remaining payment: '.$remaining
                        ]
                    );
                }
            }
        }

        return response()->json([
            'message' => 'Alerts generated successfully'
        ]);
    }
}