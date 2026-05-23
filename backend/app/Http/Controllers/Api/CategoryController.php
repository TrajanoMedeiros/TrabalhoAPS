<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $request->user()->id)
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
        $data = $request->validate([
            'nome' => ['required', 'string', 'min:2', 'max:80'],
            'tipo' => ['required', 'in:income,expense,both'],
        ]);

        $category = Category::query()->create([
            'user_id' => $request->user()->id,
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
        abort_unless($category->user_id === $request->user()->id, 404, 'Categoria propria nao encontrada.');

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
        abort_unless($category->user_id === $request->user()->id, 404, 'Categoria propria nao encontrada.');

        $category->delete();

        return ApiResponse::success([], 'Categoria removida com sucesso.');
    }

    private function authorizeCategory(Request $request, Category $category): void
    {
        abort_unless($category->user_id === null || $category->user_id === $request->user()->id, 404, 'Categoria nao encontrada.');
    }
}
