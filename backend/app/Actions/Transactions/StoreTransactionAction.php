<?php

namespace App\Actions\Transactions;

use App\DTOs\TransactionData;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use App\Repositories\CategoryRepository;
use App\Repositories\TransactionRepository;
use Illuminate\Validation\ValidationException;

class StoreTransactionAction
{
    public function __construct(
        private readonly CategoryRepository $categories,
        private readonly TransactionRepository $transactions,
    ) {}

    public function execute(User $user, string $type, TransactionData $data): Income|Expense
    {
        $this->ensureCategoryIsValid($user, $type, $data);

        return $this->transactions->create($user, $type, $data);
    }

    private function ensureCategoryIsValid(User $user, string $type, TransactionData $data): void
    {
        if (! $this->categories->availableFor($user, $data->categoryId, $type)) {
            throw ValidationException::withMessages([
                'id_categoria' => 'Escolha uma categoria disponivel para o tipo informado.',
            ]);
        }
    }
}
