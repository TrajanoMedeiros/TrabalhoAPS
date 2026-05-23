<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Income;

class TransactionPresenter
{
    public static function present(Income|Expense $transaction, string $type): array
    {
        return [
            'id' => $transaction->id,
            'tipo' => $type === 'income' ? 'receita' : 'despesa',
            'valor' => (float) $transaction->amount,
            'data' => $transaction->occurred_on->format('Y-m-d'),
            'descricao' => $transaction->description,
            'id_usuario' => $transaction->user_id,
            'id_categoria' => $transaction->category_id,
            'categoria_nome' => $transaction->category?->name,
            'categoria_tipo' => $transaction->category?->type,
            'created_at' => $transaction->created_at?->toISOString(),
        ];
    }
}
