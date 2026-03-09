<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AlertController;




Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});




Route::post('/payments', [PaymentController::class, 'store']);



Route::get('/receipts/{receiptNumber}', function ($receiptNumber) {

    $receipt = \App\Models\Receipt::where('receipt_number', $receiptNumber)->firstOrFail();

    return response()->json([
        'receipt_number' => $receipt->receipt_number,
        'pdf_url' => asset('storage/' . $receipt->pdf_path)
    ]);
});





Route::get('/alerts', [AlertController::class, 'index']);

Route::get('/alerts/{id}', [AlertController::class, 'show']);
Route::get('/alerts-generate', [AlertController::class, 'generate']);