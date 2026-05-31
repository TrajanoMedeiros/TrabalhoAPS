<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\User;
use App\Services\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $this->authenticatedUserId($request);

        $categories = Category::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $userId)
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category): array => CategoryResource::make($category))
            ->values()
            ->all();

        return ApiResponse::success(['categories' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $userId = $this->authenticatedUserId($request);

        $data = $request->validate([
            'nome' => ['required', 'string', 'min:2', 'max:80'],
            'tipo' => ['required', 'in:income,expense,both'],
        ]);

        $category = Category::query()->create([
            'user_id' => $userId,
            'name' => $data['nome'],
            'type' => $data['tipo'],
        ]);

        return ApiResponse::success(['category' => CategoryResource::make($category)], 'Categoria criada com sucesso.', 201);
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        $this->authorizeCategory($request, $category);

        return ApiResponse::success(['category' => CategoryResource::make($category)]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        abort_unless((int) $category->user_id === $this->authenticatedUserId($request), 404, 'Categoria propria nao encontrada.');

        $data = $request->validate([
            'nome' => ['required', 'string', 'min:2', 'max:80'],
            'tipo' => ['required', 'in:income,expense,both'],
        ]);

        $category->update([
            'name' => $data['nome'],
            'type' => $data['tipo'],
        ]);

        return ApiResponse::success(['category' => CategoryResource::make($category)], 'Categoria atualizada com sucesso.');
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        abort_unless((int) $category->user_id === $this->authenticatedUserId($request), 404, 'Categoria propria nao encontrada.');

        $category->delete();

        return ApiResponse::success([], 'Categoria removida com sucesso.');
    }

    private function authorizeCategory(Request $request, Category $category): void
    {
        $userId = $this->authenticatedUserId($request);
        abort_unless($category->user_id === null || (int) $category->user_id === $userId, 404, 'Categoria nao encontrada.');
    }

    private function authenticatedUserId(Request $request): int
    {
        $user = $request->user();

        if ($user instanceof User) {
            return (int) $user->id;
        }

        if (is_array($user)) {
            $id = (int) ($user['id'] ?? $user['id_usuario'] ?? 0);
            if ($id > 0) {
                return $id;
            }
        }

        throw new AuthenticationException('Usuario autenticado invalido.');
    }
}
