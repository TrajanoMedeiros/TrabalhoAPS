<?php

namespace App\Http\Controllers\Api;

use App\Actions\Goals\StoreGoalAction;
use App\Actions\Goals\UpdateGoalAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\GoalRequest;
use App\Http\Resources\GoalResource;
use App\Models\FinancialGoal;
use App\Services\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(
        private readonly StoreGoalAction $storeGoal,
        private readonly UpdateGoalAction $updateGoal,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $goals = FinancialGoal::query()
            ->with('category')
            ->where('user_id', $this->authenticatedUserId($request))
            ->orderBy('due_on')
            ->latest()
            ->get()
            ->map(fn (FinancialGoal $goal): array => GoalResource::make($goal))
            ->values()
            ->all();

        return ApiResponse::success(['goals' => $goals]);
    }

    public function store(GoalRequest $request): JsonResponse
    {
        $goal = $this->storeGoal->execute($this->authenticatedUser($request), $request->toDto());

        return ApiResponse::success(['goal' => GoalResource::make($goal->load('category'))], 'Meta criada com sucesso.', 201);
    }

    public function show(Request $request, FinancialGoal $goal): JsonResponse
    {
        $this->authorizeOwner($request, $goal);

        return ApiResponse::success(['goal' => GoalResource::make($goal->load('category'))]);
    }

    public function update(GoalRequest $request, FinancialGoal $goal): JsonResponse
    {
        $this->authorizeOwner($request, $goal);
        $goal = $this->updateGoal->execute($this->authenticatedUser($request), $goal, $request->toDto());

        return ApiResponse::success(['goal' => GoalResource::make($goal->load('category'))], 'Meta atualizada com sucesso.');
    }

    public function destroy(Request $request, FinancialGoal $goal): JsonResponse
    {
        $this->authorizeOwner($request, $goal);
        $goal->delete();

        return ApiResponse::success([], 'Meta removida com sucesso.');
    }

    private function authorizeOwner(Request $request, FinancialGoal $goal): void
    {
        abort_unless((int) $goal->user_id === $this->authenticatedUserId($request), 404, 'Meta nao encontrada.');
    }
}
