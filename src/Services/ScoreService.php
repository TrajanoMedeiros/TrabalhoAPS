<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\GoalRepository;
use App\Repositories\TransactionRepository;

final class ScoreService
{
    public function __construct(
        private readonly TransactionRepository $transactions = new TransactionRepository(),
        private readonly GoalRepository $goals = new GoalRepository()
    ) {
    }

    public function calculate(int $userId): array
    {
        $income = $this->transactions->total('income', $userId);
        $expense = $this->transactions->total('expense', $userId);
        $balance = $income - $expense;
        $goals = $this->goals->findAllByUser($userId);

        $score = 500.0;
        $signals = [];

        if ($income <= 0 && $expense <= 0) {
            $score = 420;
            $signals[] = 'Registre receitas e despesas para melhorar a precisao da analise.';
        }

        if ($income > 0) {
            $savingRate = $balance / $income;
            if ($savingRate >= 0) {
                $score += min(280, $savingRate * 350);
                $signals[] = 'Saldo positivo fortalece sua saude financeira.';
            } else {
                $score -= min(380, abs($savingRate) * 420);
                $signals[] = 'Despesas acima da renda reduzem o score.';
            }

            $expenseRatio = $expense / $income;
            if ($expenseRatio <= 0.6) {
                $score += 80;
                $signals[] = 'Comprometimento de renda esta controlado.';
            } elseif ($expenseRatio >= 0.9) {
                $score -= 90;
                $signals[] = 'Comprometimento de renda esta alto.';
            }
        } elseif ($expense > 0) {
            $score -= 260;
            $signals[] = 'Ha despesas sem renda registrada.';
        }

        $completedGoals = 0;
        foreach ($goals as $goal) {
            if ($goal['valor_alvo'] > 0 && $goal['valor_atual'] >= $goal['valor_alvo']) {
                $completedGoals++;
            }
        }

        if (count($goals) > 0) {
            $score += 35 + min(90, $completedGoals * 30);
            $signals[] = 'Metas registradas aumentam previsibilidade financeira.';
        }

        $final = (int) max(0, min(1000, round($score)));

        return [
            'score' => $final,
            'nivel' => $this->level($final),
            'details' => [
                'total_receitas' => round($income, 2),
                'total_despesas' => round($expense, 2),
                'saldo' => round($balance, 2),
                'metas_concluidas' => $completedGoals,
                'metas_total' => count($goals),
            ],
            'recomendacoes' => $this->recommendations($income, $expense, $balance, count($goals)),
            'sinais' => $signals,
        ];
    }

    private function level(int $score): string
    {
        return match (true) {
            $score >= 800 => 'Excelente',
            $score >= 650 => 'Bom',
            $score >= 500 => 'Regular',
            $score >= 300 => 'Risco alto',
            default => 'Critico',
        };
    }

    private function recommendations(float $income, float $expense, float $balance, int $goalCount): array
    {
        $items = [];

        if ($income <= 0) {
            $items[] = 'Cadastre sua renda mensal para obter uma analise mais fiel.';
        }

        if ($income > 0 && ($expense / $income) > 0.85) {
            $items[] = 'Revise categorias de maior gasto e defina um teto para o proximo mes.';
        }

        if ($balance > 0) {
            $items[] = 'Direcione parte do saldo positivo para uma reserva de emergencia.';
        } elseif ($expense > 0) {
            $items[] = 'Priorize despesas essenciais e renegocie compromissos recorrentes.';
        }

        if ($goalCount === 0) {
            $items[] = 'Crie uma meta financeira para acompanhar progresso de forma objetiva.';
        }

        return $items;
    }
}
