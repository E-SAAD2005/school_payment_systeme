<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/payments', [PaymentController::class, 'index']);
Route::get('/payments/{id}', [PaymentController::class, 'show']);
Route::post('/payments', [PaymentController::class, 'store']);
Route::get('/payments/{id}/receipt/download', [PaymentController::class, 'downloadReceipt']);

Route::get('/receipts/{receiptNumber}', function ($receiptNumber) {
    $receipt = \App\Models\Receipt::where('receipt_number', $receiptNumber)->firstOrFail();

    return response()->json([
        'receipt_number' => $receipt->receipt_number,
        'pdf_url' => asset('storage/' . $receipt->pdf_path),
        'receipt_type' => $receipt->receipt_type,
    ]);
});