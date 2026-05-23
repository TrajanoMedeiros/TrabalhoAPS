<?php

declare(strict_types=1);

namespace App\Http;

final class JsonResponse
{
    public function __construct(
        private readonly array $payload = [],
        private readonly int $status = 200
    ) {
    }

    public static function success(array $data = [], string $message = '', int $status = 200): self
    {
        $payload = ['data' => $data];
        if ($message !== '') {
            $payload['message'] = $message;
        }

        return new self($payload, $status);
    }

    public static function error(string $message, int $status, array $details = []): self
    {
        $payload = ['error' => ['message' => $message]];
        if ($details !== []) {
            $payload['error']['details'] = $details;
        }

        return new self($payload, $status);
    }

    public static function empty(int $status = 204): self
    {
        return new self([], $status);
    }

    public function send(): void
    {
        http_response_code($this->status);
        header('Content-Type: application/json; charset=UTF-8');

        if ($this->status === 204) {
            return;
        }

        echo json_encode($this->payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
