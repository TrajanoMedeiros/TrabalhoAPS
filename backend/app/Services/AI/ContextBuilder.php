<?php

namespace App\Services\AI;

use App\Models\User;
use App\Services\FinancialSummaryService;
use App\Services\ScoreService;
use Throwable;

class ContextBuilder
{
    public function __construct(
        private readonly FinancialSummaryService $summary,
        private readonly ScoreService $score,
    ) {}

    public function build(User $user): array
    {
        $dashboard = [];
        $score = [];

        try {
            $dashboard = $this->summary->summary($user);
        } catch (Throwable $exception) {
            report($exception);
        }

        try {
            $score = $this->score->calculate($user);
        } catch (Throwable $exception) {
            report($exception);
        }

        return [
            'saldo_atual' => (float) ($dashboard['saldo_atual'] ?? 0),
            'total_receitas' => (float) ($dashboard['total_receitas'] ?? 0),
            'total_despesas' => (float) ($dashboard['total_despesas'] ?? 0),
            'taxa_economia' => (float) ($dashboard['taxa_economia'] ?? 0),
            'score' => (int) ($score['score'] ?? 0),
            'nivel' => (string) ($score['nivel'] ?? 'Sem classificacao'),
            'metas' => [
                'total' => (int) ($dashboard['metas']['total'] ?? 0),
                'valor_alvo_total' => (float) ($dashboard['metas']['valor_alvo_total'] ?? 0),
                'valor_atual_total' => (float) ($dashboard['metas']['valor_atual_total'] ?? 0),
                'progresso_percentual' => (float) ($dashboard['metas']['progresso_percentual'] ?? 0),
            ],
            'top_categoria_despesa' => $this->topCategory($dashboard['distribuicao_gastos'] ?? []),
            'top_categoria_receita' => $this->topCategory($dashboard['distribuicao_receitas'] ?? []),
            'tendencia' => $this->inferTrend($dashboard['transacoes_recentes'] ?? []),
            'recomendacoes' => array_values(array_slice((array) ($score['recomendacoes'] ?? []), 0, 3)),
        ];
    }

    private function topCategory(array $distribution): ?array
    {
        $first = $distribution[0] ?? null;

        if (! is_array($first)) {
            return null;
        }

        $category = (string) ($first['categoria'] ?? '');
        $total = (float) ($first['total'] ?? 0);

        if ($category === '' || $total <= 0) {
            return null;
        }

        return [
            'categoria' => $category,
            'total' => $total,
        ];
    }

    private function inferTrend(array $recentTransactions): string
    {
        if ($recentTransactions === []) {
            return 'Sem historico recente suficiente.';
        }

        $income = 0.0;
        $expense = 0.0;

        foreach (array_slice($recentTransactions, 0, 10) as $transaction) {
            if (! is_array($transaction)) {
                continue;
            }

            $value = (float) ($transaction['valor'] ?? 0);
            $type = (string) ($transaction['tipo'] ?? '');

            if ($type === 'receita') {
                $income += $value;
            } elseif ($type === 'despesa') {
                $expense += $value;
            }
        }

        if ($income <= 0 && $expense <= 0) {
            return 'Sem historico recente suficiente.';
        }

        if ($expense > $income) {
            return 'Pressao de gastos nos lancamentos mais recentes.';
        }

        return 'Movimento recente favoravel para manter saldo positivo.';
    }
}
