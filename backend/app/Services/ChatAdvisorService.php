<?php

namespace App\Services;

class ChatAdvisorService
{
    public function answer(string $question, array $dashboard, array $score): array
    {
        $context = $this->buildContext($dashboard, $score);
        $normalized = $this->normalize($question);

        return [
            'resposta' => $this->buildAnswer($normalized, $context),
            'contexto' => $context,
        ];
    }

    public function fallback(array $dashboard, array $score): array
    {
        $context = $this->buildContext($dashboard, $score);

        return [
            'resposta' => 'Estou com uma instabilidade temporaria no assistente, mas ja validei seus numeros principais: '
                .'saldo '.$this->currency($context['saldo_atual']).', '
                .'despesas '.$this->currency($context['total_despesas']).', '
                .'receitas '.$this->currency($context['total_receitas']).'. '
                .'Se quiser, me pergunte sobre gastos, metas, score ou categorias que eu detalho passo a passo.',
            'contexto' => $context,
        ];
    }

    private function buildAnswer(string $question, array $context): string
    {
        if ($this->containsAny($question, ['categoria', 'categorias']) && $this->containsAny($question, ['mais', 'maior', 'top'])) {
            if ($this->containsAny($question, ['receita', 'receitas', 'ganho', 'ganhos'])) {
                if ($context['top_categoria_receita'] === null) {
                    return 'Ainda nao encontrei receitas por categoria neste periodo. Registre novas receitas para identificar a principal fonte.';
                }

                return sprintf(
                    'Sua categoria de maior receita no periodo e "%s", com %s. Use essa base para planejar metas e manter previsibilidade do caixa.',
                    $context['top_categoria_receita']['categoria'],
                    $this->currency($context['top_categoria_receita']['total']),
                );
            }

            if ($context['top_categoria_despesa'] === null) {
                return 'Ainda nao encontrei despesas por categoria neste periodo. Registre gastos para eu te mostrar onde o orcamento esta mais concentrado.';
            }

            return sprintf(
                'A categoria que mais consumiu seu orcamento foi "%s", com %s. Priorize revisar essa categoria primeiro para ganhar eficiencia rapida.',
                $context['top_categoria_despesa']['categoria'],
                $this->currency($context['top_categoria_despesa']['total']),
            );
        }

        if ($this->containsAny($question, ['quanto gastei', 'gastei', 'despesa', 'despesas'])) {
            return 'No periodo selecionado, suas despesas somam '.$this->currency($context['total_despesas']).'. '
                .'Compare com receitas de '.$this->currency($context['total_receitas']).' para decidir o proximo ajuste.';
        }

        if ($this->containsAny($question, ['quanto recebi', 'recebi', 'receita', 'receitas', 'faturei'])) {
            return 'No periodo selecionado, suas receitas somam '.$this->currency($context['total_receitas']).'. '
                .'Com isso, seu saldo atual ficou em '.$this->currency($context['saldo_atual']).'.';
        }

        if ($this->containsAny($question, ['meta', 'metas', 'objetivo', 'objetivos'])) {
            $goals = $context['metas'];

            if ((int) $goals['total'] === 0) {
                return 'Voce ainda nao possui metas ativas. Crie uma meta com prazo para acompanhar progresso de forma objetiva.';
            }

            return 'Voce tem '.$goals['total'].' metas ativas, com progresso geral de '
                .$this->percent($goals['progresso_percentual']).'. '
                .'Valor atual acumulado: '.$this->currency($goals['valor_atual_total']).' de '
                .$this->currency($goals['valor_alvo_total']).'.';
        }

        if ($this->containsAny($question, ['score', 'pontuacao'])) {
            $recommendation = $context['recomendacoes'][0] ?? 'Mantenha despesas abaixo da renda e acompanhe suas metas mensalmente.';

            return sprintf(
                'Seu score financeiro atual e %d (%s). Principal recomendacao agora: %s',
                $context['score'],
                $context['nivel'],
                $recommendation,
            );
        }

        if ($this->containsAny($question, ['saldo', 'caixa', 'sobrou'])) {
            return 'Seu saldo atual no periodo e '.$this->currency($context['saldo_atual']).'. '
                .$this->trendMessage($context['tendencia']);
        }

        if ($this->containsAny($question, ['econom', 'guardar', 'reserva'])) {
            if ($context['saldo_atual'] > 0) {
                return 'Voce esta com saldo positivo de '.$this->currency($context['saldo_atual']).'. '
                    .'Direcione uma parte fixa desse valor para reserva antes dos gastos variaveis.';
            }

            return 'No momento o saldo esta em '.$this->currency($context['saldo_atual']).'. '
                .'Comece reduzindo a categoria de maior gasto para liberar caixa e iniciar uma reserva.';
        }

        return 'Resumo rapido do seu periodo: saldo '.$this->currency($context['saldo_atual'])
            .', receitas '.$this->currency($context['total_receitas'])
            .', despesas '.$this->currency($context['total_despesas'])
            .', score '.$context['score'].' ('.$context['nivel'].'). '
            .'Posso detalhar categoria que mais gastou, status das metas ou plano para melhorar score.';
    }

    private function buildContext(array $dashboard, array $score): array
    {
        $topExpense = $this->topCategory($dashboard['distribuicao_gastos'] ?? []);
        $topIncome = $this->topCategory($dashboard['distribuicao_receitas'] ?? []);

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
            'top_categoria_despesa' => $topExpense,
            'top_categoria_receita' => $topIncome,
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

    private function trendMessage(string $trend): string
    {
        return match ($trend) {
            'Pressao de gastos nos lancamentos mais recentes.' => 'Nos registros mais recentes existe pressao de gastos; vale revisar recorrencias.',
            'Movimento recente favoravel para manter saldo positivo.' => 'Nos registros mais recentes o ritmo esta favoravel para manter saldo positivo.',
            default => 'Ainda faltam dados recentes para leitura de tendencia com seguranca.',
        };
    }

    private function currency(float $value): string
    {
        return 'R$ '.number_format($value, 2, ',', '.');
    }

    private function percent(float $value): string
    {
        return number_format($value, 1, ',', '.').'%';
    }

    private function containsAny(string $text, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function normalize(string $value): string
    {
        $value = mb_strtolower($value);

        return strtr($value, [
            'á' => 'a',
            'à' => 'a',
            'â' => 'a',
            'ã' => 'a',
            'é' => 'e',
            'ê' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ô' => 'o',
            'õ' => 'o',
            'ú' => 'u',
            'ç' => 'c',
        ]);
    }
}
