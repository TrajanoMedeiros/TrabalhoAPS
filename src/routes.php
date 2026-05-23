<?php

declare(strict_types=1);

use App\Controllers\HealthController;
use App\Controllers\AuthController;
use App\Controllers\CategoryController;
use App\Controllers\ChatController;
use App\Controllers\DashboardController;
use App\Controllers\FinancialGoalController;
use App\Controllers\ScoreController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Http\Router;

$router = new Router();

$router->get('/api/health', [HealthController::class, 'show']);

$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->get('/api/auth/me', [AuthController::class, 'me']);

$router->get('/api/users/me', [UserController::class, 'show']);
$router->put('/api/users/me', [UserController::class, 'update']);
$router->put('/api/users/password', [UserController::class, 'changePassword']);
$router->delete('/api/users/me', [UserController::class, 'destroy']);

$router->get('/api/categories', [CategoryController::class, 'index']);
$router->post('/api/categories', [CategoryController::class, 'store']);
$router->get('/api/categories/{id}', [CategoryController::class, 'show']);
$router->put('/api/categories/{id}', [CategoryController::class, 'update']);
$router->delete('/api/categories/{id}', [CategoryController::class, 'destroy']);

$router->get('/api/incomes', [TransactionController::class, 'indexIncome']);
$router->post('/api/incomes', [TransactionController::class, 'storeIncome']);
$router->get('/api/incomes/{id}', [TransactionController::class, 'showIncome']);
$router->put('/api/incomes/{id}', [TransactionController::class, 'updateIncome']);
$router->delete('/api/incomes/{id}', [TransactionController::class, 'destroyIncome']);

$router->get('/api/expenses', [TransactionController::class, 'indexExpense']);
$router->post('/api/expenses', [TransactionController::class, 'storeExpense']);
$router->get('/api/expenses/{id}', [TransactionController::class, 'showExpense']);
$router->put('/api/expenses/{id}', [TransactionController::class, 'updateExpense']);
$router->delete('/api/expenses/{id}', [TransactionController::class, 'destroyExpense']);

$router->get('/api/goals', [FinancialGoalController::class, 'index']);
$router->post('/api/goals', [FinancialGoalController::class, 'store']);
$router->get('/api/goals/{id}', [FinancialGoalController::class, 'show']);
$router->put('/api/goals/{id}', [FinancialGoalController::class, 'update']);
$router->delete('/api/goals/{id}', [FinancialGoalController::class, 'destroy']);

$router->get('/api/dashboard', [DashboardController::class, 'getDashboard']);
$router->get('/api/dashboard/history', [DashboardController::class, 'getMonthlyHistory']);
$router->get('/api/score', [ScoreController::class, 'getScore']);
$router->post('/api/chat', [ChatController::class, 'ask']);

return $router;
