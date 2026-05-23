<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\AuthenticationException;
use App\Http\Request;

final class Auth
{
    public static function userId(Request $request): int
    {
        $token = $request->bearerToken();
        if ($token === null) {
            throw new AuthenticationException('Token de autenticacao ausente.');
        }

        $payload = Jwt::verify($token);
        return (int) $payload['sub'];
    }
}
