<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\ScoreController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'data' => [
        'status' => 'ok',
        'service' => 'saldoo-api',
    ],
]));

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth.jwt')->group(function (): void {
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/users/me', [UserController::class, 'show']);
    Route::put('/users/me', [UserController::class, 'update']);
    Route::put('/users/password', [UserController::class, 'changePassword']);
    Route::delete('/users/me', [UserController::class, 'destroy']);

    Route::apiResource('categories', CategoryController::class)->except(['create', 'edit']);

    Route::get('/incomes', [TransactionController::class, 'incomes']);
    Route::post('/incomes', [TransactionController::class, 'storeIncome']);
    Route::get('/incomes/{income}', [TransactionController::class, 'showIncome']);
    Route::put('/incomes/{income}', [TransactionController::class, 'updateIncome']);
    Route::delete('/incomes/{income}', [TransactionController::class, 'destroyIncome']);

    Route::get('/expenses', [TransactionController::class, 'expenses']);
    Route::post('/expenses', [TransactionController::class, 'storeExpense']);
    Route::get('/expenses/{expense}', [TransactionController::class, 'showExpense']);
    Route::put('/expenses/{expense}', [TransactionController::class, 'updateExpense']);
    Route::delete('/expenses/{expense}', [TransactionController::class, 'destroyExpense']);

    Route::apiResource('goals', GoalController::class)->except(['create', 'edit']);

    Route::get('/dashboard', [DashboardController::class, 'summary']);
    Route::get('/dashboard/history', [DashboardController::class, 'history']);
    Route::get('/score', [ScoreController::class, 'show']);
    Route::post('/chat', [AIController::class, 'ask']);

    Route::middleware('admin')->prefix('admin')->group(function (): void {
        Route::get('/overview', [AdminController::class, 'overview']);
    });
});
