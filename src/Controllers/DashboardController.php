<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\JsonResponse;
use App\Http\Request;
use App\Http\ValidationException;
use App\Services\DashboardService;
use App\Support\Auth;
use App\Support\Validator;

final class DashboardController
{
    private DashboardService $dashboard;

    public function __construct()
    {
        $this->dashboard = new DashboardService();
    }

    public function getDashboard(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        return JsonResponse::success([
            'dashboard' => $this->dashboard->summary($userId, Validator::periodFilters($request)),
        ]);
    }

    public function getMonthlyHistory(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $months = $request->query('meses', 6);
        $months = filter_var($months, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 24]]);
        if ($months === false) {
            throw new ValidationException('Filtro invalido.', ['meses' => 'Informe um valor entre 1 e 24.']);
        }

        return JsonResponse::success([
            'history' => $this->dashboard->monthlyHistory($userId, $months),
        ]);
    }
}
