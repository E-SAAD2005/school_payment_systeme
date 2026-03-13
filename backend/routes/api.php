<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return response()->json(
            $request->user()->load('roles', 'permissions')
        );
    });

    Route::get('/students', [StudentController::class, 'index'])
        ->middleware('permission:view students');
    Route::post('/students', [StudentController::class, 'store'])
        ->middleware('permission:create students');
    Route::put('/students/{student}', [StudentController::class, 'update'])
        ->middleware('permission:edit students');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])
        ->middleware('permission:delete students');

    Route::get('/payments', [PaymentController::class, 'index'])
        ->middleware('permission:view payments');
    Route::post('/payments', [PaymentController::class, 'store'])
        ->middleware('permission:create payments');
    Route::put('/payments/{payment}', [PaymentController::class, 'update'])
        ->middleware('permission:edit payments');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])
        ->middleware('permission:delete payments');

    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:view users');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:create users');
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:edit users');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:delete users');


});

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
