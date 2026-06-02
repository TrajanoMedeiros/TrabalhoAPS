<?php

namespace App\Services\AI;

class PromptBuilder
{
    public function build(string $question, array $context): string
    {
        $encodedContext = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '{}';

        return implode("\n", [
            'Voce e o assistente financeiro do Saldoo.',
            'Responda em portugues do Brasil, com clareza, objetividade e foco acionavel.',
            'Use apenas o contexto financeiro fornecido e nao invente dados.',
            'Se algum dado estiver ausente, explique isso de forma transparente.',
            '',
            'Contexto financeiro:',
            $encodedContext,
            '',
            'Pergunta do usuario:',
            $question,
        ]);
    }
}
