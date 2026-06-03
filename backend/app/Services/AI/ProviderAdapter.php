<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class ProviderAdapter
{
    public function isAvailable(): bool
    {
        $endpoint = $this->endpoint();

        if ($endpoint === '') {
            return false;
        }

        if ($this->requiresAuthentication() && $this->token() === '') {
            return false;
        }

        return true;
    }

    public function generate(string $prompt, array $context = []): string
    {
        if (! $this->isAvailable()) {
            throw new RuntimeException('Provider de IA nao configurado.');
        }

        $request = Http::timeout($this->timeout())->acceptJson();

        if ($this->token() !== '') {
            $request = $request->withToken($this->token());
        }

        $response = $request->post($this->endpoint(), [
            'provider' => $this->providerName(),
            'model' => $this->model(),
            'prompt' => $prompt,
            'contexto' => $context,
        ]);

        $response->throw();

        $payload = $response->json();
        if (is_string($payload)) {
            $answer = trim($payload);

            if ($answer !== '') {
                return $answer;
            }
        }

        if (! is_array($payload)) {
            throw new RuntimeException('Resposta invalida do provider de IA.');
        }

        $answer = data_get($payload, 'answer')
            ?? data_get($payload, 'resposta')
            ?? data_get($payload, 'message')
            ?? data_get($payload, 'choices.0.message.content')
            ?? data_get($payload, 'choices.0.text');

        if (! is_string($answer) || trim($answer) === '') {
            throw new RuntimeException('Provider de IA retornou uma resposta vazia.');
        }

        return trim($answer);
    }

    private function providerName(): string
    {
        return (string) config('services.ai.provider', '');
    }

    private function endpoint(): string
    {
        return (string) config('services.ai.endpoint', '');
    }

    private function token(): string
    {
        return trim((string) config('services.ai.token', ''));
    }

    private function model(): string
    {
        return (string) config('services.ai.model', '');
    }

    private function timeout(): int
    {
        return max(3, (int) config('services.ai.timeout', 8));
    }

    private function requiresAuthentication(): bool
    {
        return (bool) config('services.ai.requires_auth', true);
    }
}
