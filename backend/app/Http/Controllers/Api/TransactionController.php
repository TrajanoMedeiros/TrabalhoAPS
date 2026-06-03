<?php

namespace App\Http\Controllers\Api;

use App\Actions\Transactions\StoreTransactionAction;
use App\Actions\Transactions\UpdateTransactionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Expense;
use App\Models\Income;
use App\Services\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        private readonly StoreTransactionAction $storeTransaction,
        private readonly UpdateTransactionAction $updateTransaction,
    ) {}

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

        return ApiResponse::success(['income' => TransactionResource::make($income->load('category'), 'income')]);
    }

    public function showExpense(Request $request, Expense $expense): JsonResponse
    {
        $this->authorizeOwner($request, $expense);

        return ApiResponse::success(['expense' => TransactionResource::make($expense->load('category'), 'expense')]);
    }

    public function storeIncome(TransactionRequest $request): JsonResponse
    {
        $income = $this->storeTransaction->execute($this->authenticatedUser($request), 'income', $request->toDto());

        return ApiResponse::success(['income' => TransactionResource::make($income->load('category'), 'income')], 'Receita criada com sucesso.', 201);
    }

    public function storeExpense(TransactionRequest $request): JsonResponse
    {
        $expense = $this->storeTransaction->execute($this->authenticatedUser($request), 'expense', $request->toDto());

        return ApiResponse::success(['expense' => TransactionResource::make($expense->load('category'), 'expense')], 'Despesa criada com sucesso.', 201);
    }

    public function updateIncome(TransactionRequest $request, Income $income): JsonResponse
    {
        $this->authorizeOwner($request, $income);
        $income = $this->updateTransaction->execute($this->authenticatedUser($request), $income, 'income', $request->toDto());

        return ApiResponse::success(['income' => TransactionResource::make($income->load('category'), 'income')], 'Receita atualizada com sucesso.');
    }

    public function updateExpense(TransactionRequest $request, Expense $expense): JsonResponse
    {
        $this->authorizeOwner($request, $expense);
        $expense = $this->updateTransaction->execute($this->authenticatedUser($request), $expense, 'expense', $request->toDto());

        return ApiResponse::success(['expense' => TransactionResource::make($expense->load('category'), 'expense')], 'Despesa atualizada com sucesso.');
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
        $query->with('category')->where('user_id', $this->authenticatedUserId($request));

        if (isset($filters['mes'])) {
            $query->whereMonth('occurred_on', $filters['mes']);
        }

        if (isset($filters['ano'])) {
            $query->whereYear('occurred_on', $filters['ano']);
        }

        return $query->latest('occurred_on')
            ->latest()
            ->get()
            ->map(fn (Income|Expense $transaction): array => TransactionResource::make($transaction, $type))
            ->values()
            ->all();
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
        abort_unless((int) $model->user_id === $this->authenticatedUserId($request), 404, 'Transacao nao encontrada.');
    }
}
