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


    // قائمة Payments
    public function getPayments(Request $request)
    {
        $query = Payment::with(['student.program', 'student.group', 'receipt']);

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('cne', 'like', "%{$search}%");
            })->orWhereHas('receipt', function($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->query('start_date'));
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->query('end_date'));
        }

        return response()->json($query->latest()->get());
    }

    // عرض payment واحد
    public function show($id)
    {
        $payment = Payment::with(['student', 'fee', 'receipt'])->findOrFail($id);

        return response()->json($payment);
    }

    public function exportPdf(Request $request)
    {
        $query = Payment::with(['student.program', 'student.group', 'receipt']);

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $payments = $query->latest()->get();
        $total = $payments->sum('amount_paid');

        $logoBase64 = '';
        if (extension_loaded('gd')) {
            $logoPath = public_path('assets/logo1.png');
            if (file_exists($logoPath)) {
                $logoData = base64_encode(file_get_contents($logoPath));
                $logoBase64 = 'data:image/png;base64,' . $logoData;
            }
        }

        $pdf = Pdf::loadView('receipts.history_pdf', [
            'payments' => $payments,
            'total' => $total,
            'logo' => $logoBase64,
            'date' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('historique_paiements.pdf');
    }

    // تسجيل paiement جديد
    public function createPayment(Request $request)
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

        $response = DB::transaction(function () use ($data) {

            $student = Student::findOrFail($data['student_id']);
            $fee     = Fee::findOrFail($data['fee_id']);

            // شحال متخلّص دابا قبل هاد الأداء الجديد
            $currentPaid = Payment::where('student_id', $data['student_id'])
                ->where('fee_id', $data['fee_id'])
                ->sum('amount_paid');

            $newTotal = round($currentPaid + $data['amount_paid'], 2);

            // منع الزيادة على المبلغ المطلوب
            if ($newTotal > round($fee->amount_total, 2)) {
                return [
                    'error' => true,
                    'data' => [
                        'message'      => 'Le montant dépasse le total à payer',
                        'amount_total' => $fee->amount_total,
                        'already_paid' => $currentPaid,
                        'remaining'    => round($fee->amount_total - $currentPaid, 2),
                    ],
                    'status' => 422
                ];
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

            $totalPaid = Payment::where('student_id', $student->id)
                ->where('fee_id', $fee->id)
                ->sum('amount_paid');


            $amountTotal = $fee->amount_total;
            $reste = $amountTotal - $totalPaid;

            // Base64 logo for PDF (only if GD extension is loaded)
            $logoBase64 = '';
            if (extension_loaded('gd')) {
                $logoPath = public_path('assets/logo1.png');
                if (file_exists($logoPath)) {
                    $logoData = base64_encode(file_get_contents($logoPath));
                    $logoBase64 = 'data:image/png;base64,' . $logoData;
                }
            }

            // رقم receipt حسب نوعه كما في الصور
            $typeCode = match ($data['receipt_type']) {
                'scolarite'   => 'SC',
                'assurance'   => 'ASS',
                'inscription' => 'INS',
                'formation'   => 'FORM',
                default       => 'REC',
            };
            
            $yearRange = '25-26'; // كما في الصور
            $receiptNumber = $yearRange . '-' . $typeCode . '-' . str_pad($payment->id, 3, '0', STR_PAD_LEFT);

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
                'logo'          => $logoBase64,
            ])->setPaper('a4', 'portrait');

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

            return [
                'error' => false,
                'data' => [
                    'message'      => 'Payment + Receipt created successfully',
                    'payment'      => $payment,
                    'receipt'      => $receipt,
                    'total_paid'   => $totalPaid,
                    'amount_total' => $amountTotal,
                    'reste'        => $reste,
                ],
                'status' => 201
            ];
        });

        if ($response['error']) {
            return response()->json($response['data'], $response['status']);
        }

        return response()->json($response['data'], $response['status']);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        
        $data = $request->validate([
            'student_id'     => ['required', 'exists:students,id'],
            'fee_id'         => ['required', 'exists:fees,id'],
            'amount_paid'    => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:especes,virement,cheque'],
            'reference'      => ['nullable', 'string'],
            'payment_date'   => ['required', 'date'],
        ]);

        $payment->update($data);

        return response()->json([
            'message' => 'Payment updated successfully',
            'payment' => $payment
        ]);
    }

    public function destroy($id)
    {
        $payment = Payment::with('receipt')->findOrFail($id);
        
        if ($payment->receipt && $payment->receipt->pdf_path) {
            Storage::disk('public')->delete($payment->receipt->pdf_path);
        }

        $payment->delete();

        return response()->json([
            'message' => 'Payment deleted successfully'
        ]);
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

        return response()->download(storage_path('app/public/' . $filePath));
    }

}
