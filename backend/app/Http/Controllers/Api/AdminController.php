<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\FinancialGoal;
use App\Models\Income;
use App\Models\User;
use App\Services\ApiResponse;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function overview(): JsonResponse
    {
        $totalIncome = (float) Income::query()->sum('amount');
        $totalExpense = (float) Expense::query()->sum('amount');

        return ApiResponse::success([
            'overview' => [
                'usuarios' => [
                    'total' => User::query()->count(),
                    'administradores' => User::query()->where('role', User::ROLE_ADMIN)->count(),
                    'comuns' => User::query()->where('role', User::ROLE_USER)->count(),
                ],
                'financeiro' => [
                    'receitas_total' => round($totalIncome, 2),
                    'despesas_total' => round($totalExpense, 2),
                    'saldo_total' => round($totalIncome - $totalExpense, 2),
                    'metas_total' => FinancialGoal::query()->count(),
                ],
            ],
        ]);
    }
}
