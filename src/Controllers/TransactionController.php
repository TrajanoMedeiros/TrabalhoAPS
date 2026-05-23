<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\HttpException;
use App\Http\JsonResponse;
use App\Http\Request;
use App\Http\ValidationException;
use App\Repositories\CategoryRepository;
use App\Repositories\TransactionRepository;
use App\Support\Auth;
use App\Support\Validator;

final class TransactionController
{
    private TransactionRepository $transactions;
    private CategoryRepository $categories;

    public function __construct()
    {
        $this->transactions = new TransactionRepository();
        $this->categories = new CategoryRepository();
    }

    public function indexIncome(Request $request, array $params): JsonResponse
    {
        return $this->index($request, 'income', 'incomes');
    }

    public function indexExpense(Request $request, array $params): JsonResponse
    {
        return $this->index($request, 'expense', 'expenses');
    }

    public function showIncome(Request $request, array $params): JsonResponse
    {
        return $this->show($request, $params, 'income', 'income');
    }

    public function showExpense(Request $request, array $params): JsonResponse
    {
        return $this->show($request, $params, 'expense', 'expense');
    }

    public function storeIncome(Request $request, array $params): JsonResponse
    {
        return $this->store($request, 'income', 'income', 'Receita criada com sucesso.');
    }

    public function storeExpense(Request $request, array $params): JsonResponse
    {
        return $this->store($request, 'expense', 'expense', 'Despesa criada com sucesso.');
    }

    public function updateIncome(Request $request, array $params): JsonResponse
    {
        return $this->update($request, $params, 'income', 'income', 'Receita atualizada com sucesso.');
    }

    public function updateExpense(Request $request, array $params): JsonResponse
    {
        return $this->update($request, $params, 'expense', 'expense', 'Despesa atualizada com sucesso.');
    }

    public function destroyIncome(Request $request, array $params): JsonResponse
    {
        return $this->destroy($request, $params, 'income', 'Receita removida com sucesso.');
    }

    public function destroyExpense(Request $request, array $params): JsonResponse
    {
        return $this->destroy($request, $params, 'expense', 'Despesa removida com sucesso.');
    }

    private function index(Request $request, string $type, string $key): JsonResponse
    {
        $userId = Auth::userId($request);
        $filters = Validator::periodFilters($request);

        return JsonResponse::success([
            $key => $this->transactions->findAll($type, $userId, $filters),
        ]);
    }

    private function show(Request $request, array $params, string $type, string $key): JsonResponse
    {
        $userId = Auth::userId($request);
        $item = $this->transactions->findById($type, $this->id($params), $userId);
        if ($item === null) {
            throw new HttpException(404, 'Transacao nao encontrada.');
        }

        return JsonResponse::success([$key => $item]);
    }

    private function store(Request $request, string $type, string $usage, string $message): JsonResponse
    {
        $userId = Auth::userId($request);
        $data = $this->payload($request, $userId, $usage);
        $data['id_usuario'] = $userId;

        return JsonResponse::success([
            $type => $this->transactions->create($type, $data),
        ], $message, 201);
    }

    private function update(Request $request, array $params, string $type, string $usage, string $message): JsonResponse
    {
        $userId = Auth::userId($request);
        $transaction = $this->transactions->update($type, $this->id($params), $userId, $this->payload($request, $userId, $usage));
        if ($transaction === null) {
            throw new HttpException(404, 'Transacao nao encontrada.');
        }

        return JsonResponse::success([$type => $transaction], $message);
    }

    private function destroy(Request $request, array $params, string $type, string $message): JsonResponse
    {
        $userId = Auth::userId($request);
        if (!$this->transactions->delete($type, $this->id($params), $userId)) {
            throw new HttpException(404, 'Transacao nao encontrada.');
        }

        return JsonResponse::success([], $message);
    }

    private function payload(Request $request, int $userId, string $usage): array
    {
        $data = Validator::make($request->json())
            ->requiredMoney('valor', 'Valor')
            ->requiredDate('data', 'Data')
            ->optionalString('descricao', 'Descricao', 500)
            ->requiredInt('id_categoria', 'Categoria')
            ->validate();

        if (!$this->categories->existsForUse($data['id_categoria'], $userId, $usage)) {
            throw new ValidationException('Categoria invalida para esta transacao.', [
                'id_categoria' => 'Escolha uma categoria disponivel para o tipo informado.',
            ]);
        }

        return $data;
    }

    private function id(array $params): int
    {
        if (!isset($params['id']) || !ctype_digit((string) $params['id'])) {
            throw new HttpException(404, 'Transacao nao encontrada.');
        }

        return (int) $params['id'];
    }
}
