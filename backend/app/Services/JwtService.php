<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Carbon;

class JwtService
{
    public function issue(User $user): array
    {
        $issuedAt = now()->timestamp;
        $expiresAt = $issuedAt + max(300, (int) config('services.jwt.ttl', 86400));
        $payload = [
            'sub' => $user->id,
            'email' => $user->email,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
        ];

        return [
            'token' => $this->encode($payload),
            'expires_at' => Carbon::createFromTimestamp($expiresAt)->toISOString(),
        ];
    }

    public function verify(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new AuthenticationException('Token invalido.');
        }

        [$header, $payload, $signature] = $parts;
        if (! hash_equals($this->sign($header.'.'.$payload), $signature)) {
            throw new AuthenticationException('Assinatura do token invalida.');
        }

        $decoded = json_decode($this->base64UrlDecode($payload), true);
        if (! is_array($decoded) || ! isset($decoded['sub'], $decoded['exp'])) {
            throw new AuthenticationException('Conteudo do token invalido.');
        }

        if ((int) $decoded['exp'] < now()->timestamp) {
            throw new AuthenticationException('Token expirado.');
        }

        return $decoded;
    }

    private function encode(array $payload): string
    {
        $header = $this->base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $body = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        return $header.'.'.$body.'.'.$this->sign($header.'.'.$body);
    }

    private function sign(string $value): string
    {
        return $this->base64UrlEncode(hash_hmac('sha256', $value, $this->secret(), true));
    }

    private function secret(): string
    {
        return (string) config('services.jwt.secret', config('app.key'));
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        $value = str_pad($value, strlen($value) + ((4 - strlen($value) % 4) % 4), '=');
        $decoded = base64_decode(strtr($value, '-_', '+/'), true);

        if ($decoded === false || ! json_validate($decoded)) {
            throw new AuthenticationException('Token malformado.');
        }

        return $decoded;
    }
}
