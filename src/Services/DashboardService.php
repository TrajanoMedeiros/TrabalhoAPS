<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\GoalRepository;
use App\Repositories\TransactionRepository;

final class DashboardService
{
    public function __construct(
        private readonly TransactionRepository $transactions = new TransactionRepository(),
        private readonly GoalRepository $goals = new GoalRepository()
    ) {
    }

    public function summary(int $userId, array $filters = []): array
    {
        $income = $this->transactions->total('income', $userId, $filters);
        $expense = $this->transactions->total('expense', $userId, $filters);
        $goals = $this->goals->findAllByUser($userId);
        $goalTarget = array_sum(array_column($goals, 'valor_alvo'));
        $goalCurrent = array_sum(array_column($goals, 'valor_atual'));

        return [
            'saldo_atual' => round($income - $expense, 2),
            'total_receitas' => round($income, 2),
            'total_despesas' => round($expense, 2),
            'taxa_economia' => $income > 0 ? round((($income - $expense) / $income) * 100, 1) : 0,
            'distribuicao_gastos' => $this->transactions->categoryDistribution('expense', $userId, $filters),
            'distribuicao_receitas' => $this->transactions->categoryDistribution('income', $userId, $filters),
            'metas' => [
                'total' => count($goals),
                'valor_alvo_total' => round((float) $goalTarget, 2),
                'valor_atual_total' => round((float) $goalCurrent, 2),
                'progresso_percentual' => $goalTarget > 0 ? round(($goalCurrent / $goalTarget) * 100, 1) : 0,
            ],
            'transacoes_recentes' => $this->transactions->recentCombined($userId, 10),
        ];
    }

    public function monthlyHistory(int $userId, int $months): array
    {
        return $this->transactions->monthlyHistory($userId, max(1, min(24, $months)));
    }
}
