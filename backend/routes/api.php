<?php


use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;



use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\FeeController;

use App\Http\Controllers\Api\DashboardController;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return response()->json(
            $request->user()->load('roles', 'permissions')
        );
    });

    Route::get('/programs', [ProgramController::class, 'index']);
    Route::post('/programs', [ProgramController::class, 'store']);
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::get('/fees', [FeeController::class, 'index']);
    Route::post('/fees', [FeeController::class, 'store']);

    Route::get('/students', [StudentController::class, 'index'])
        ->middleware('permission:view students');
    Route::post('/students', [StudentController::class, 'store'])
        ->middleware('permission:create students');
    Route::post('/students/import', [StudentController::class, 'import'])
        ->middleware('permission:create students');
    Route::put('/students/{student}', [StudentController::class, 'update'])
        ->middleware('permission:edit students');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])
        ->middleware('permission:delete students');

    Route::get('/payments', [PaymentController::class, 'getPayments'])->middleware('permission:view payments');
    Route::get('/payments/export-pdf', [PaymentController::class, 'exportPdf'])->middleware('permission:view payments');
    Route::post('/payments', [PaymentController::class, 'createPayment'])->middleware('permission:create payments');

    Route::put('/payments/{payment}', [PaymentController::class, 'update'])
        ->middleware('permission:edit payments');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])
        ->middleware('permission:delete payments');
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
});

Route::get('/payments/{id}/receipt/download', [PaymentController::class, 'downloadReceipt']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('permission:view users');
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('permission:create users');
    Route::put('/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:edit users');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:delete users');
    Route::get('/users/{user}', [UserController::class, 'show'])
        ->middleware('permission:view users');
    Route::get('/receipts/{receiptNumber}', function ($receiptNumber) {

    $receipt = \App\Models\Receipt::where('receipt_number', $receiptNumber)->firstOrFail();

    return response()->json([
        'receipt_number' => $receipt->receipt_number,
        'receipt_type' => $receipt->receipt_type,
        'pdf_url' => asset('storage/' . $receipt->pdf_path)
    ]);
});

});






Route::get('/alerts', [AlertController::class, 'index']);

Route::get('/alerts/{id}', [AlertController::class, 'show']);
Route::get('/alerts-generate', [AlertController::class, 'generate']);
