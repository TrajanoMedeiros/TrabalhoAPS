<?php

namespace App\Http\Resources;

use App\Models\Category;

class CategoryResource
{
    public static function make(Category $category): array
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
