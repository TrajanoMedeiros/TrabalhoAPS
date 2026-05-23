<?php

namespace App\Services;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(array $data = [], string $message = '', int $status = 200): JsonResponse
    {
        $payload = ['data' => $data];

        if ($message !== '') {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }
}
