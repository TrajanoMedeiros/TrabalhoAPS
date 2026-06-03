<?php

namespace App\Repositories;

use App\DTOs\TransactionData;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;

class TransactionRepository
{
    public function create(User $user, string $type, TransactionData $data): Income|Expense
    {
        $model = $type === 'income' ? Income::class : Expense::class;

        return $model::query()->create($data->toModelPayload() + [
            'user_id' => $user->id,
        ]);
    }

    public function update(Income|Expense $transaction, TransactionData $data): Income|Expense
    {
        $transaction->update($data->toModelPayload());

        return $transaction->refresh();
    }
}
