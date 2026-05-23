<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\HttpException;
use App\Http\JsonResponse;
use App\Http\Request;
use App\Repositories\CategoryRepository;
use App\Support\Auth;
use App\Support\Validator;

final class CategoryController
{
    private CategoryRepository $categories;

    public function __construct()
    {
        $this->categories = new CategoryRepository();
    }

    public function index(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        return JsonResponse::success(['categories' => $this->categories->findAllForUser($userId)]);
    }

    public function show(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $category = $this->categories->findByIdForUser($this->id($params), $userId);
        if ($category === null) {
            throw new HttpException(404, 'Categoria nao encontrada.');
        }

        return JsonResponse::success(['category' => $category]);
    }

    public function store(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $data = Validator::make($request->json())
            ->requiredString('nome', 'Nome', 80, 2)
            ->enum('tipo', ['income', 'expense', 'both'], 'both')
            ->validate();

        return JsonResponse::success([
            'category' => $this->categories->createForUser($userId, $data),
        ], 'Categoria criada com sucesso.', 201);
    }

    public function update(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        $data = Validator::make($request->json())
            ->requiredString('nome', 'Nome', 80, 2)
            ->enum('tipo', ['income', 'expense', 'both'], 'both')
            ->validate();

        $category = $this->categories->updateForUser($this->id($params), $userId, $data);
        if ($category === null) {
            throw new HttpException(404, 'Categoria propria nao encontrada.');
        }

        return JsonResponse::success(['category' => $category], 'Categoria atualizada com sucesso.');
    }

    public function destroy(Request $request, array $params): JsonResponse
    {
        $userId = Auth::userId($request);
        if (!$this->categories->deleteForUser($this->id($params), $userId)) {
            throw new HttpException(404, 'Categoria propria nao encontrada.');
        }

        return JsonResponse::success([], 'Categoria removida com sucesso.');
    }

    private function id(array $params): int
    {
        if (!isset($params['id']) || !ctype_digit((string) $params['id'])) {
            throw new HttpException(404, 'Categoria nao encontrada.');
        }

        return (int) $params['id'];
    }
}
