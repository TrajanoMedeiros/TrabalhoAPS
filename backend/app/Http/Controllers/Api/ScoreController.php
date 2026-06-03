<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiResponse;
use App\Services\ScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScoreController extends Controller
{
    public function __construct(private readonly ScoreService $score) {}

    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'score' => $this->score->calculate($this->authenticatedUser($request)),
        ]);
    }
}
