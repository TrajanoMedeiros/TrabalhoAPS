<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\JsonResponse;
use App\Http\Request;
use App\Services\ChatAdvisorService;
use App\Services\DashboardService;
use App\Services\ScoreService;
use App\Support\Auth;
use App\Support\Validator;

final class ChatController
{
    public function ask(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $data = Validator::make($request->json())
            ->requiredString('mensagem', 'Mensagem', 600, 3)
            ->validate();

        $dashboard = (new DashboardService())->summary($userId);
        $score = (new ScoreService())->calculate($userId);
        $answer = (new ChatAdvisorService())->answer($data['mensagem'], $dashboard, $score);

        return JsonResponse::success(['chat' => $answer]);
    }
}
