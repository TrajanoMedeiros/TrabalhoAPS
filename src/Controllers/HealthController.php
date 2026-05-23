<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\JsonResponse;
use App\Http\Request;

final class HealthController
{
    public function show(Request $request, array $params): JsonResponse
    {
        return JsonResponse::success([
            'status' => 'ok',
            'service' => 'saldoo-api',
        ]);
    }
}
