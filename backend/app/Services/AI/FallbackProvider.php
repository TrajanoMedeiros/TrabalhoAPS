<?php

namespace App\Services\AI;

class FallbackProvider
{
    public function response(array $context): array
    {
        return [
            'resposta' => 'Assistente temporariamente indisponível. Verifique a configuração da API.',
            'contexto' => $context,
        ];
    }
}
