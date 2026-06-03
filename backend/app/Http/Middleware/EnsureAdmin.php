<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (is_array($user)) {
            $id = (int) ($user['id'] ?? $user['id_usuario'] ?? 0);
            $user = $id > 0 ? User::query()->find($id) : null;
        }

        if (! $user instanceof User || ! $user->isAdmin()) {
            return ApiResponse::error('Acesso restrito a administradores.', 403);
        }

        return $next($request);
    }
}
