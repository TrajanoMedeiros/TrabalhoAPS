<?php

declare(strict_types=1);

namespace App\Http;

final class Request
{
    private ?array $json = null;

    public function __construct(
        private readonly string $method,
        private readonly string $uri,
        private readonly array $query,
        private readonly array $server,
        private readonly string $body
    ) {
    }

    public static function capture(): self
    {
        return new self(
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            $_SERVER['REQUEST_URI'] ?? '/',
            $_GET,
            $_SERVER,
            file_get_contents('php://input') ?: ''
        );
    }

    public function method(): string
    {
        return strtoupper($this->method);
    }

    public function path(): string
    {
        $path = parse_url($this->uri, PHP_URL_PATH) ?: '/';
        if ($path !== '/' && str_ends_with($path, '/')) {
            return rtrim($path, '/');
        }

        return $path;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function json(): array
    {
        if ($this->json !== null) {
            return $this->json;
        }

        if (trim($this->body) === '') {
            $this->json = [];
            return $this->json;
        }

        $decoded = json_decode($this->body, true);
        if (!is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
            throw new ValidationException('JSON invalido.', ['body' => 'Envie um objeto JSON valido.']);
        }

        $this->json = $decoded;
        return $this->json;
    }

    public function bearerToken(): ?string
    {
        $header = $this->header('authorization');
        if ($header === null || !preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return null;
        }

        return trim($matches[1]);
    }

    private function header(string $name): ?string
    {
        $normalized = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        if (isset($this->server[$normalized])) {
            return (string) $this->server[$normalized];
        }

        if ($name === 'authorization' && isset($this->server['REDIRECT_HTTP_AUTHORIZATION'])) {
            return (string) $this->server['REDIRECT_HTTP_AUTHORIZATION'];
        }

        return null;
    }
}
