<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiResponse;
use App\Services\ChatAdvisorService;
use App\Services\FinancialSummaryService;
use App\Services\ScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatAdvisorService $advisor,
        private readonly FinancialSummaryService $summary,
        private readonly ScoreService $score,
    ) {}

    public function ask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mensagem' => ['required', 'string', 'min:3', 'max:600'],
        ]);

        $dashboard = [];
        $score = [];

        try {
            $dashboard = $this->summary->summary($request->user());
            $score = $this->score->calculate($request->user());
        } catch (Throwable $exception) {
            report($exception);
        }

        $chat = $this->advisor->fallback($dashboard, $score);

        try {
            $chat = $this->advisor->answer($data['mensagem'], $dashboard, $score);
        } catch (Throwable $exception) {
            report($exception);
        }

        return ApiResponse::success([
            'chat' => $chat,
        ]);
    }
}
