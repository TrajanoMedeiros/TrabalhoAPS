<?php

namespace App\Services\AI;

use App\Models\User;
use Throwable;

class AIService
{
    public function __construct(
        private readonly ContextBuilder $contextBuilder,
        private readonly PromptBuilder $promptBuilder,
        private readonly ProviderAdapter $providerAdapter,
        private readonly FallbackProvider $fallbackProvider,
    ) {}

    public function ask(User $user, string $question): array
    {
        $context = $this->contextBuilder->build($user);

        if (! $this->providerAdapter->isAvailable()) {
            return $this->fallbackProvider->response($context);
        }

        $prompt = $this->promptBuilder->build($question, $context);

        try {
            $answer = trim($this->providerAdapter->generate($prompt, $context));

            if ($answer !== '') {
                return [
                    'resposta' => $answer,
                    'contexto' => $context,
                ];
            }
        } catch (Throwable $exception) {
            report($exception);
        }

        return $this->fallbackProvider->response($context);
    }
}
