<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AI\AIService;
use App\Services\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function __construct(private readonly AIService $ai) {}

    public function ask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mensagem' => ['required', 'string', 'min:3', 'max:600'],
        ]);

        $user = $this->authenticatedUser($request);

        return ApiResponse::success([
            'chat' => $this->ai->ask($user, $data['mensagem']),
        ]);
    }
}
