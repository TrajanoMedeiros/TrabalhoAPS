<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use App\Services\ApiResponse;
use App\Services\TransactionPresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function incomes(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'incomes' => $this->list(Income::query(), $request, 'income'),
        ]);
    }

    public function expenses(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'expenses' => $this->list(Expense::query(), $request, 'expense'),
        ]);
    }

    public function showIncome(Request $request, Income $income): JsonResponse
    {
        $this->authorizeOwner($request, $income);

        return ApiResponse::success(['income' => TransactionPresenter::present($income->load('category'), 'income')]);
    }

    public function showExpense(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeOwner($request, $expense);

        return ApiResponse::success(['expense' => TransactionPresenter::present($expense->load('category'), 'expense')]);
    }

    public function storeIncome(Request $request): JsonResponse
    {
        $data = $this->payload($request, 'income');
        $income = Income::query()->create($data + ['user_id' => $request->user()->id]);

        return ApiResponse::success(['income' => TransactionPresenter::present($income->load('category'), 'income')], 'Receita criada com sucesso.', 201);
    }

    public function storeExpense(Request $request): JsonResponse
    {
        $data = $this->payload($request, 'expense');
        $expense = Expense::query()->create($data + ['user_id' => $request->user()->id]);

        return ApiResponse::success(['expense' => TransactionPresenter::present($expense->load('category'), 'expense')], 'Despesa criada com sucesso.', 201);
    }

    public function updateIncome(Request $request, Income $income): JsonResponse
    {
        $this->authorizeOwner($request, $income);
        $income->update($this->payload($request, 'income'));

        return ApiResponse::success(['income' => TransactionPresenter::present($income->refresh()->load('category'), 'income')], 'Receita atualizada com sucesso.');
    }

    public function updateExpense(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeOwner($request, $expense);
        $expense->update($this->payload($request, 'expense'));

        return ApiResponse::success(['expense' => TransactionPresenter::present($expense->refresh()->load('category'), 'expense')], 'Despesa atualizada com sucesso.');
    }

    public function destroyIncome(Request $request, Income $income): JsonResponse
    {
        $this->authorizeOwner($request, $income);
        $income->delete();

        return ApiResponse::success([], 'Receita removida com sucesso.');
    }

    public function destroyExpense(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeOwner($request, $expense);
        $expense->delete();

        return ApiResponse::success([], 'Despesa removida com sucesso.');
    }

    private function list(Builder $query, Request $request, string $type): array
    {
        $filters = $this->periodFilters($request);
        $query->with('category')->whereBelongsTo($request->user());

        if (isset($filters['mes'])) {
            $query->whereMonth('occurred_on', $filters['mes']);
        }

        if (isset($filters['ano'])) {
            $query->whereYear('occurred_on', $filters['ano']);
        }

        return $query->latest('occurred_on')
            ->latest()
            ->get()
            ->map(fn (Income|Expense $transaction): array => TransactionPresenter::present($transaction, $type))
            ->values()
            ->all();
    }

    private function payload(Request $request, string $usage): array
    {
        $data = $request->validate([
            'valor' => ['required', 'numeric', 'gt:0'],
            'data' => ['required', 'date_format:Y-m-d'],
            'descricao' => ['nullable', 'string', 'max:500'],
            'id_categoria' => ['required', 'integer', 'exists:categories,id'],
        ]);

        $category = Category::query()
            ->where('id', $data['id_categoria'])
            ->where(fn (Builder $query): Builder => $query
                ->whereNull('user_id')
                ->orWhere('user_id', $request->user()->id)
            )
            ->first();

        if (! $category || ! $category->isAvailableFor($usage)) {
            throw ValidationException::withMessages([
                'id_categoria' => 'Escolha uma categoria disponivel para o tipo informado.',
            ]);
        }

        return [
            'amount' => round((float) $data['valor'], 2),
            'occurred_on' => $data['data'],
            'description' => $data['descricao'] ?? null,
            'category_id' => $category->id,
        ];
    }

    private function periodFilters(Request $request): array
    {
        return $request->validate([
            'mes' => ['nullable', 'integer', 'between:1,12'],
            'ano' => ['nullable', 'integer', 'between:2000,2100'],
        ]);
    }

    private function authorizeOwner(Request $request, Model $model): void
    {
        abort_unless($model->user_id === $request->user()->id, 404, 'Transacao nao encontrada.');
    }
}
