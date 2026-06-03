<?php

namespace App\Actions\Goals;

use App\DTOs\GoalData;
use App\Models\FinancialGoal;
use App\Models\User;
use App\Repositories\CategoryRepository;
use Illuminate\Validation\ValidationException;

class StoreGoalAction
{
    public function __construct(private readonly CategoryRepository $categories) {}

    public function execute(User $user, GoalData $data): FinancialGoal
    {
        $this->ensureCategoryIsValid($user, $data);

        return FinancialGoal::query()->create($data->toModelPayload() + [
            'user_id' => $user->id,
        ]);
    }

    private function ensureCategoryIsValid(User $user, GoalData $data): void
    {
        if ($data->categoryId !== null && ! $this->categories->accessible($user, $data->categoryId)) {
            throw ValidationException::withMessages([
                'id_categoria' => 'Escolha uma categoria disponivel.',
            ]);
        }
    }
}
