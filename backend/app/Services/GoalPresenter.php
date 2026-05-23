<?php

namespace App\Services;

use App\Models\FinancialGoal;

class GoalPresenter
{
    public static function present(FinancialGoal $goal): array
    {
        $target = (float) $goal->target_amount;
        $current = (float) $goal->current_amount;

        return [
            'id_meta' => $goal->id,
            'titulo' => $goal->title,
            'valor_alvo' => $target,
            'valor_atual' => $current,
            'progresso_percentual' => $target > 0 ? round(min(100, ($current / $target) * 100), 1) : 0,
            'data_limite' => $goal->due_on?->format('Y-m-d'),
            'id_usuario' => $goal->user_id,
            'id_categoria' => $goal->category_id,
            'categoria_nome' => $goal->category?->name,
            'created_at' => $goal->created_at?->toISOString(),
        ];
    }
}
