<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class CategoryRepository
{
    public function accessible(User $user, int $categoryId): ?Category
    {
        return Category::query()
            ->where('id', $categoryId)
            ->where(fn (Builder $query): Builder => $query
                ->whereNull('user_id')
                ->orWhere('user_id', $user->id)
            )
            ->first();
    }

    public function availableFor(User $user, int $categoryId, string $usage): ?Category
    {
        $category = $this->accessible($user, $categoryId);

        if (! $category || ! $category->isAvailableFor($usage)) {
            return null;
        }

        return $category;
    }
}
