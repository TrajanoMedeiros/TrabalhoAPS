<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    public function __construct(private readonly JwtService $jwt) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token === null) {
            throw new AuthenticationException('Token de autenticacao ausente.');
        }

        $payload = $this->jwt->verify($token);
        $user = User::query()->find($payload['sub']);

        if (! $user) {
            throw new AuthenticationException('Usuario autenticado nao encontrado.');
        }

        $request->setUserResolver(fn (): User => $user);

        return $next($request);
    }
}
