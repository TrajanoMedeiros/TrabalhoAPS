<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\AuthenticationException;
use DateTimeImmutable;
use DateTimeInterface;

final class Jwt
{
    public static function issue(int $userId, string $email): array
    {
        $now = time();
        $ttl = max(300, (int) Env::get('JWT_TTL_SECONDS', '86400'));
        $payload = [
            'sub' => $userId,
            'email' => $email,
            'iat' => $now,
            'exp' => $now + $ttl,
        ];

        return [
            'token' => self::encode($payload),
            'expires_at' => (new DateTimeImmutable('@' . $payload['exp']))->format(DateTimeInterface::ATOM),
        ];
    }

    public static function verify(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new AuthenticationException('Token invalido.');
        }

        [$header, $payload, $signature] = $parts;
        $expected = self::sign($header . '.' . $payload);
        if (!hash_equals($expected, $signature)) {
            throw new AuthenticationException('Assinatura do token invalida.');
        }

        $decoded = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($decoded) || !isset($decoded['sub'], $decoded['exp'])) {
            throw new AuthenticationException('Conteudo do token invalido.');
        }

        if ((int) $decoded['exp'] < time()) {
            throw new AuthenticationException('Token expirado.');
        }

        return $decoded;
    }

    private static function encode(array $payload): string
    {
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $body = self::base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));

        return $header . '.' . $body . '.' . self::sign($header . '.' . $body);
    }

    private static function sign(string $value): string
    {
        $secret = Env::get('JWT_SECRET', 'dev-only-change-this-secret');
        return self::base64UrlEncode(hash_hmac('sha256', $value, $secret, true));
    }

    private static function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) {
            throw new AuthenticationException('Token malformado.');
        }

        return $decoded;
    }
}
