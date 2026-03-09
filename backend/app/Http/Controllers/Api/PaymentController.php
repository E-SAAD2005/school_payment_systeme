<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Fee;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        // 1️⃣ Validation (نتأكدو من الداتا)
        $data = $request->validate([
            'student_id' => ['required','exists:students,id'],
            'fee_id' => ['required','exists:fees,id'],
            'amount_paid' => ['required','numeric','min:0.01'],
            'payment_method' => ['required','in:especes,virement,cheque'],
            'reference' => ['nullable','string'],
            'payment_date' => ['required','date'],
        ]);

        // 2️⃣ Transaction (باش إلا وقع مشكل يرجع كلشي)
        return DB::transaction(function () use ($data) {

            $student = Student::findOrFail($data['student_id']);
            $fee = Fee::findOrFail($data['fee_id']);

            // 3️⃣ نسجلو الأداء
            $payment = Payment::create($data);

            // 4️⃣ نحسبو مجموع الأداءات لنفس الطالب ونفس الترانش
            $totalPaid = Payment::where('student_id', $student->id)
                ->where('fee_id', $fee->id)
                ->sum('amount_paid');

            // 5️⃣ نحسبو الباقي
            $amountTotal = $fee->amount_total;
            $reste = $amountTotal - $totalPaid;

            // 6️⃣ نصايبو رقم التوصل
            $year = date('Y');
            $receiptNumber = 'REC-'.$year.'-'.str_pad($payment->id, 6, '0', STR_PAD_LEFT);

            // 7️⃣ نولدو PDF
            $pdf = Pdf::loadView('receipts.receipt', [
                'receiptNumber' => $receiptNumber,
                'student' => $student,
                'fee' => $fee,
                'payment' => $payment,
                'totalPaid' => $totalPaid,
                'amountTotal' => $amountTotal,
                'reste' => $reste,
            ]);

            $fileName = $receiptNumber.'.pdf';
            $path = 'receipts/'.$fileName;

            $path = 'receipts/'.$fileName;
Storage::disk('public')->put($path, $pdf->output());

            // 8️⃣ نسجلو receipt فـ DB
            $receipt = Receipt::create([
                'receipt_number' => $receiptNumber,
                'payment_id' => $payment->id,
                'issue_date' => $payment->payment_date,
                'pdf_path' => $path,
            ]);

            return response()->json([
                'message' => 'Payment + Receipt created successfully',
                'payment' => $payment,
                'receipt_number' => $receiptNumber,
                'reste' => $reste,
            ]);
        });
    }
}