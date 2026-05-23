<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\FinancialGoal;
use App\Models\Income;
use App\Models\User;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class FinancialSummaryService
{
    public function summary(User $user, array $filters = []): array
    {
        $totalIncome = $this->total(Income::query(), $user, $filters);
        $totalExpense = $this->total(Expense::query(), $user, $filters);
        $goals = FinancialGoal::query()
            ->with('category')
            ->whereBelongsTo($user)
            ->orderBy('due_on')
            ->get();

        $target = $goals->sum(fn (FinancialGoal $goal): float => (float) $goal->target_amount);
        $current = $goals->sum(fn (FinancialGoal $goal): float => (float) $goal->current_amount);

        return [
            'saldo_atual' => round($totalIncome - $totalExpense, 2),
            'total_receitas' => round($totalIncome, 2),
            'total_despesas' => round($totalExpense, 2),
            'taxa_economia' => $totalIncome > 0 ? round((($totalIncome - $totalExpense) / $totalIncome) * 100, 1) : 0,
            'distribuicao_gastos' => $this->distribution(Expense::query(), $user, $filters),
            'distribuicao_receitas' => $this->distribution(Income::query(), $user, $filters),
            'metas' => [
                'total' => $goals->count(),
                'valor_alvo_total' => round($target, 2),
                'valor_atual_total' => round($current, 2),
                'progresso_percentual' => $target > 0 ? round(($current / $target) * 100, 1) : 0,
            ],
            'transacoes_recentes' => $this->recentTransactions($user),
        ];
    }

    public function monthlyHistory(User $user, int $months): array
    {
        $months = max(1, min(24, $months));
        $start = now()->startOfMonth()->subMonths($months - 1);
        $period = CarbonPeriod::create($start, '1 month', now()->startOfMonth());

        return collect($period)->map(function (Carbon $month) use ($user): array {
            $filters = ['mes' => $month->month, 'ano' => $month->year];
            $income = $this->total(Income::query(), $user, $filters);
            $expense = $this->total(Expense::query(), $user, $filters);

            return [
                'mes' => $month->month,
                'ano' => $month->year,
                'total_receitas' => round($income, 2),
                'total_despesas' => round($expense, 2),
                'saldo' => round($income - $expense, 2),
            ];
        })->values()->all();
    }

    public function total(Builder $query, User $user, array $filters = []): float
    {
        return (float) $this->withPeriod($query->whereBelongsTo($user), $filters)->sum('amount');
    }

    private function distribution(Builder $query, User $user, array $filters): array
    {
        return $this->withPeriod($query->whereBelongsTo($user)->with('category'), $filters)
            ->get()
            ->groupBy(fn (Income|Expense $transaction): string => $transaction->category?->name ?? 'Sem categoria')
            ->map(fn ($items, string $category): array => [
                'categoria' => $category,
                'total' => round((float) $items->sum('amount'), 2),
            ])
            ->sortByDesc('total')
            ->values()
            ->all();
    }

    private function recentTransactions(User $user): array
    {
        $incomes = Income::query()
            ->with('category')
            ->whereBelongsTo($user)
            ->latest('occurred_on')
            ->limit(5)
            ->get()
            ->map(fn (Income $income): array => TransactionPresenter::present($income, 'income'));

        $expenses = Expense::query()
            ->with('category')
            ->whereBelongsTo($user)
            ->latest('occurred_on')
            ->limit(5)
            ->get()
            ->map(fn (Expense $expense): array => TransactionPresenter::present($expense, 'expense'));

        return $incomes
            ->merge($expenses)
            ->sortByDesc(fn (array $transaction): string => $transaction['data'].$transaction['created_at'])
            ->take(10)
            ->values()
            ->all();
    }

    private function withPeriod(Builder $query, array $filters): Builder
    {
        if (isset($filters['mes'])) {
            $query->whereMonth('occurred_on', (int) $filters['mes']);
        }

        if (isset($filters['ano'])) {
            $query->whereYear('occurred_on', (int) $filters['ano']);
        }

        return $query;
    }
}
