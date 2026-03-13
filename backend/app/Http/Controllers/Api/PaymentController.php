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
<<<<<<< HEAD
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
=======
    // عرض جميع payments
    public function index()
    {
        $payments = Payment::with(['student', 'fee', 'receipt'])
            ->orderByDesc('id')
            ->get();

        return response()->json($payments);
    }

    // عرض payment واحد
    public function show($id)
    {
        $payment = Payment::with(['student', 'fee', 'receipt'])->findOrFail($id);

        return response()->json($payment);
    }

    // إنشاء payment + receipt + pdf حسب type de reçu
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id'     => ['required', 'exists:students,id'],
            'fee_id'         => ['required', 'exists:fees,id'],
            'amount_paid'    => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:especes,virement,cheque'],
            'reference'      => ['nullable', 'string'],
            'payment_date'   => ['required', 'date'],
            'receipt_type'   => ['required', 'in:scolarite,assurance,inscription,formation'],
        ]);

        return DB::transaction(function () use ($data) {

            $student = Student::findOrFail($data['student_id']);
            $fee     = Fee::findOrFail($data['fee_id']);

            // شحال متخلّص دابا قبل هاد الأداء الجديد
            $currentPaid = Payment::where('student_id', $data['student_id'])
                ->where('fee_id', $data['fee_id'])
                ->sum('amount_paid');

            $newTotal = $currentPaid + $data['amount_paid'];

            // منع الزيادة على المبلغ المطلوب
            if ($newTotal > $fee->amount_total) {
                return response()->json([
                    'message'      => 'Le montant dépasse le total à payer',
                    'amount_total' => $fee->amount_total,
                    'already_paid' => $currentPaid,
                    'remaining'    => $fee->amount_total - $currentPaid,
                ], 422);
            }

            // إنشاء payment
            $payment = Payment::create([
                'student_id'     => $data['student_id'],
                'fee_id'         => $data['fee_id'],
                'amount_paid'    => $data['amount_paid'],
                'payment_method' => $data['payment_method'],
                'reference'      => $data['reference'] ?? null,
                'payment_date'   => $data['payment_date'],
            ]);

            // total paid بعد الإضافة
>>>>>>> origin/task3-payments
            $totalPaid = Payment::where('student_id', $student->id)
                ->where('fee_id', $fee->id)
                ->sum('amount_paid');

<<<<<<< HEAD
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
=======
            $amountTotal = $fee->amount_total;
            $reste = $amountTotal - $totalPaid;

            // رقم receipt
            $year = date('Y');
            $receiptNumber = 'REC-' . $year . '-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT);

            // اختيار template حسب type de reçu
            $view = match ($data['receipt_type']) {
                'scolarite'   => 'receipts.scolarite',
                'assurance'   => 'receipts.assurance',
                'inscription' => 'receipts.inscription',
                'formation'   => 'receipts.formation',
                default       => 'receipts.scolarite',
            };

            // توليد PDF
            $pdf = Pdf::loadView($view, [
                'receiptNumber' => $receiptNumber,
                'student'       => $student,
                'fee'           => $fee,
                'payment'       => $payment,
                'totalPaid'     => $totalPaid,
                'amountTotal'   => $amountTotal,
                'reste'         => $reste,
                'receiptType'   => $data['receipt_type'],
            ]);

            $fileName = $receiptNumber . '.pdf';
            $path = 'receipts/' . $fileName;

            Storage::disk('public')->put($path, $pdf->output());

            // إنشاء receipt
            $receipt = Receipt::create([
                'receipt_number' => $receiptNumber,
                'payment_id'     => $payment->id,
                'issue_date'     => $payment->payment_date,
                'pdf_path'       => $path,
                'receipt_type'   => $data['receipt_type'],
            ]);

            return response()->json([
                'message'      => 'Payment + Receipt created successfully',
                'payment'      => $payment,
                'receipt'      => $receipt,
                'total_paid'   => $totalPaid,
                'amount_total' => $amountTotal,
                'reste'        => $reste,
            ], 201);
        });
    }

    // تحميل receipt PDF
    public function downloadReceipt($id)
    {
        $payment = Payment::with('receipt')->findOrFail($id);

        if (!$payment->receipt) {
            return response()->json([
                'message' => 'Receipt not found'
            ], 404);
        }

        $filePath = $payment->receipt->pdf_path;

        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json([
                'message' => 'PDF file not found'
            ], 404);
        }

        return Storage::disk('public')->download($filePath);
    }
>>>>>>> origin/task3-payments
}