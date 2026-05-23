<?php

declare(strict_types=1);

namespace App\Services;

final class ChatAdvisorService
{
    public function answer(string $question, array $dashboard, array $score): array
    {
        $normalized = mb_strtolower($question);
        $balance = (float) ($dashboard['saldo_atual'] ?? 0);
        $income = (float) ($dashboard['total_receitas'] ?? 0);
        $expense = (float) ($dashboard['total_despesas'] ?? 0);

        if (str_contains($normalized, 'score')) {
            $message = sprintf(
                'Seu score financeiro estimado esta em %d (%s). O principal caminho e manter gastos abaixo da renda e registrar metas realistas.',
                $score['score'],
                $score['nivel']
            );
        } elseif (str_contains($normalized, 'divida') || str_contains($normalized, 'dívida')) {
            $message = 'Para sair de dividas, liste juros e vencimentos, negocie primeiro as mais caras e evite assumir parcelas que comprometam sua renda essencial.';
        } elseif (str_contains($normalized, 'econom') || str_contains($normalized, 'guardar')) {
            $message = $balance > 0
                ? 'Voce ja tem saldo positivo. Automatize uma transferencia para reserva assim que a renda cair.'
                : 'Comece com uma meta pequena: reduza uma categoria variavel e separe o valor economizado antes de gastar.';
        } elseif ($income > 0 && $expense > $income) {
            $message = 'Hoje suas despesas superam as receitas registradas. O foco deve ser cortar recorrencias, renegociar compromissos e revisar gastos essenciais.';
        } else {
            $message = 'Organize receitas, despesas e metas no Saldoo para transformar seus dados em decisoes simples: gastar menos do que entra, prever compromissos e acompanhar progresso.';
        }

        return [
            'resposta' => $message,
            'contexto' => [
                'saldo_atual' => $balance,
                'total_receitas' => $income,
                'total_despesas' => $expense,
                'score' => $score['score'],
                'nivel' => $score['nivel'],
            ],
        ];
    }
}
