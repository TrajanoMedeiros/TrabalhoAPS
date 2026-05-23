<?php

namespace App\Http\Middleware;

use App\Services\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isAdmin()) {
            return ApiResponse::error('Acesso restrito a administradores.', 403);
        }

        return $next($request);
    }
}
