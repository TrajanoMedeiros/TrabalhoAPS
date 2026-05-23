<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'category_id', 'title', 'target_amount', 'current_amount', 'due_on'])]
class FinancialGoal extends Model
{
    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'due_on' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    protected function targetAmount(): Attribute
    {
        return Attribute::make(get: fn (string $value): float => (float) $value);
    }

    protected function currentAmount(): Attribute
    {
        return Attribute::make(get: fn (string $value): float => (float) $value);
    }
}
