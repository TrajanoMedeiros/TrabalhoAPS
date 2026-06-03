<?php

namespace App\Actions\Transactions;

use App\DTOs\TransactionData;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use App\Repositories\CategoryRepository;
use App\Repositories\TransactionRepository;
use Illuminate\Validation\ValidationException;

class UpdateTransactionAction
{
    public function __construct(
        private readonly CategoryRepository $categories,
        private readonly TransactionRepository $transactions,
    ) {}

    public function execute(User $user, Income|Expense $transaction, string $type, TransactionData $data): Income|Expense
    {
        if (! $this->categories->availableFor($user, $data->categoryId, $type)) {
            throw ValidationException::withMessages([
                'id_categoria' => 'Escolha uma categoria disponivel para o tipo informado.',
            ]);
        }

        return $this->transactions->update($transaction, $data);
    }
}
