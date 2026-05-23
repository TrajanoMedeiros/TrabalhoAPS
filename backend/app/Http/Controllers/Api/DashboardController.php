<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ApiResponse;
use App\Services\FinancialSummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly FinancialSummaryService $summary) {}

    public function summary(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'mes' => ['nullable', 'integer', 'between:1,12'],
            'ano' => ['nullable', 'integer', 'between:2000,2100'],
        ]);

        return ApiResponse::success([
            'dashboard' => $this->summary->summary($request->user(), $filters),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $data = $request->validate([
            'meses' => ['nullable', 'integer', 'between:1,24'],
        ]);

        return ApiResponse::success([
            'history' => $this->summary->monthlyHistory($request->user(), (int) ($data['meses'] ?? 6)),
        ]);
    }
}
