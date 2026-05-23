<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GoalResource;
use App\Models\Category;
use App\Models\FinancialGoal;
use App\Services\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = FinancialGoal::query()
            ->with('category')
            ->whereBelongsTo($request->user())
            ->orderBy('due_on')
            ->latest()
            ->get()
            ->map(fn (FinancialGoal $goal): array => GoalResource::make($goal))
            ->values()
            ->all();

        return ApiResponse::success(['goals' => $goals]);
    }

    public function store(Request $request): JsonResponse
    {
        $goal = FinancialGoal::query()->create($this->payload($request) + [
            'user_id' => $request->user()->id,
        ]);

        return ApiResponse::success(['goal' => GoalResource::make($goal->load('category'))], 'Meta criada com sucesso.', 201);
    }

    public function show(Request $request, FinancialGoal $goal): JsonResponse
    {
        $this->authorizeOwner($request, $goal);

        return ApiResponse::success(['goal' => GoalResource::make($goal->load('category'))]);
    }

    public function update(Request $request, FinancialGoal $goal): JsonResponse
    {
        $this->authorizeOwner($request, $goal);
        $goal->update($this->payload($request));

        return ApiResponse::success(['goal' => GoalResource::make($goal->refresh()->load('category'))], 'Meta atualizada com sucesso.');
    }

    public function destroy(Request $request, FinancialGoal $goal): JsonResponse
    {
        $this->authorizeOwner($request, $goal);
        $goal->delete();

        return ApiResponse::success([], 'Meta removida com sucesso.');
    }

    private function payload(Request $request): array
    {
        $data = $request->validate([
            'titulo' => ['required', 'string', 'min:2', 'max:120'],
            'valor_alvo' => ['required', 'numeric', 'gt:0'],
            'valor_atual' => ['nullable', 'numeric', 'gte:0'],
            'data_limite' => ['nullable', 'date_format:Y-m-d'],
            'id_categoria' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $categoryId = $data['id_categoria'] ?? null;
        if ($categoryId !== null) {
            $category = Category::query()
                ->where('id', $categoryId)
                ->where(fn (Builder $query): Builder => $query
                    ->whereNull('user_id')
                    ->orWhere('user_id', $request->user()->id)
                )
                ->first();

            if (! $category) {
                throw ValidationException::withMessages([
                    'id_categoria' => 'Escolha uma categoria disponivel.',
                ]);
            }
        }

        return [
            'title' => $data['titulo'],
            'target_amount' => round((float) $data['valor_alvo'], 2),
            'current_amount' => round((float) ($data['valor_atual'] ?? 0), 2),
            'due_on' => $data['data_limite'] ?? null,
            'category_id' => $categoryId,
        ];
    }

    private function authorizeOwner(Request $request, FinancialGoal $goal): void
    {
        abort_unless($goal->user_id === $request->user()->id, 404, 'Meta nao encontrada.');
    }
}
