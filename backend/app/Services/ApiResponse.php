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

    public static function error(string $message, int $status = 400, array $details = []): JsonResponse
    {
        $payload = [
            'error' => [
                'message' => $message,
            ],
        ];

        if ($details !== []) {
            $payload['error']['details'] = $details;
        }

        return response()->json($payload, $status);
    }
}
