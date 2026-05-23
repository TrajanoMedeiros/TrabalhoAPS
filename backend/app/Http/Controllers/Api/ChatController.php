<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiResponse;
use App\Services\ChatAdvisorService;
use App\Services\FinancialSummaryService;
use App\Services\ScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $dashboard = $this->summary->summary($request->user());
        $score = $this->score->calculate($request->user());

        return ApiResponse::success([
            'chat' => $this->advisor->answer($data['mensagem'], $dashboard, $score),
        ]);
    }
}
