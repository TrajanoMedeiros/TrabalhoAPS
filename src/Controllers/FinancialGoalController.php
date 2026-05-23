<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\HttpException;
use App\Http\JsonResponse;
use App\Http\Request;
use App\Http\ValidationException;
use App\Repositories\CategoryRepository;
use App\Repositories\GoalRepository;
use App\Support\Auth;
use App\Support\Validator;

final class FinancialGoalController
{
    private GoalRepository $goals;
    private CategoryRepository $categories;

    public function __construct()
    {
        $this->goals = new GoalRepository();
        $this->categories = new CategoryRepository();
    }

    public function index(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        return JsonResponse::success(['goals' => $this->goals->findAllByUser($userId)]);
    }

    public function show(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $goal = $this->goals->findById($this->id($params), $userId);
        if ($goal === null) {
            throw new HttpException(404, 'Meta nao encontrada.');
        }

        return JsonResponse::success(['goal' => $goal]);
    }

    public function store(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $data = $this->payload($request, $userId);
        $data['id_usuario'] = $userId;

        return JsonResponse::success([
            'goal' => $this->goals->create($data),
        ], 'Meta criada com sucesso.', 201);
    }

    public function update(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $goal = $this->goals->update($this->id($params), $userId, $this->payload($request, $userId));
        if ($goal === null) {
            throw new HttpException(404, 'Meta nao encontrada.');
        }

        return JsonResponse::success(['goal' => $goal], 'Meta atualizada com sucesso.');
    }

    public function destroy(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        if (!$this->goals->delete($this->id($params), $userId)) {
            throw new HttpException(404, 'Meta nao encontrada.');
        }

        return JsonResponse::success([], 'Meta removida com sucesso.');
    }

    private function payload(Request $request, int $userId): array
    {
        $data = Validator::make($request->json())
            ->requiredString('titulo', 'Titulo', 120, 2)
            ->requiredMoney('valor_alvo', 'Valor alvo')
            ->optionalMoney('valor_atual', 'Valor atual')
            ->optionalDate('data_limite', 'Data limite')
            ->optionalInt('id_categoria', 'Categoria')
            ->validate();

        if ($data['valor_atual'] === null) {
            $data['valor_atual'] = 0;
        }

        if ($data['id_categoria'] !== null && $this->categories->findByIdForUser($data['id_categoria'], $userId) === null) {
            throw new ValidationException('Categoria invalida para a meta.', [
                'id_categoria' => 'Escolha uma categoria disponivel.',
            ]);
        }

        return $data;
    }

    private function id(array $params): int
    {
        if (!isset($params['id']) || !ctype_digit((string) $params['id'])) {
            throw new HttpException(404, 'Meta nao encontrada.');
        }

        return (int) $params['id'];
    }
}
