<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Alert;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $monthlyPayments = Payment::whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount_paid');

        $totalStudents = Student::count();
        $delaysCount = Alert::where('status', 'en_retard')->count();
        $risksCount = Alert::where('status', 'a_risque')->count();

        // Calcul des impayés (Total dû - Total payé)
        $totalFeesAmount = \App\Models\Fee::sum(\Illuminate\Support\Facades\DB::raw('amount_total * (SELECT COUNT(*) FROM students WHERE students.program_id = fees.program_id)'));
        $totalPaidAmount = Payment::sum('amount_paid');
        $unpaidTotal = max(0, $totalFeesAmount - $totalPaidAmount);

        $recentPayments = Payment::with('student')
            ->orderByDesc('payment_date')
            ->limit(5)
            ->get();

        $alerts = Alert::with('student')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'monthly_payments' => $monthlyPayments,
                'total_students' => $totalStudents,
                'delays_count' => $delaysCount,
                'risks_count' => $risksCount,
                'unpaid_total' => $unpaidTotal,
            ],
            'recent_payments' => $recentPayments,
            'recent_alerts' => $alerts,
        ]);
    }
}
