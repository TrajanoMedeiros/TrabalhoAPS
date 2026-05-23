<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\JsonResponse;
use App\Http\Request;
use App\Services\ScoreService;
use App\Support\Auth;

final class ScoreController
{
    private ScoreService $score;

    public function __construct()
    {
        $this->score = new ScoreService();
    }

    public function getScore(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        return JsonResponse::success([
            'score' => $this->score->calculate($userId),
        ]);
    }
}
