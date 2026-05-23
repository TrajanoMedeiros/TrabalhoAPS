<?php

namespace App\Services;

use App\Models\Category;

class CategoryPresenter
{
    public static function present(Category $category): array
    {
        return [
            'id_categoria' => $category->id,
            'nome' => $category->name,
            'tipo' => $category->type,
            'id_usuario' => $category->user_id,
            'created_at' => $category->created_at?->toISOString(),
        ];
    }
}
