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
        $user = $this->authenticatedUser($request);

        return ApiResponse::success([
            'dashboard' => $this->summary->summary($user, $filters),
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $data = $request->validate([
            'meses' => ['nullable', 'integer', 'between:1,24'],
        ]);
        $user = $this->authenticatedUser($request);

        return ApiResponse::success([
            'history' => $this->summary->monthlyHistory($user, (int) ($data['meses'] ?? 6)),
        ]);
    }
}
