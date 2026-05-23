<?php

namespace App\Actions\Goals;

use App\DTOs\GoalData;
use App\Models\FinancialGoal;
use App\Models\User;
use App\Repositories\CategoryRepository;
use Illuminate\Validation\ValidationException;

class UpdateGoalAction
{
    public function __construct(private readonly CategoryRepository $categories) {}

    public function execute(User $user, FinancialGoal $goal, GoalData $data): FinancialGoal
    {
        if ($data->categoryId !== null && ! $this->categories->accessible($user, $data->categoryId)) {
            throw ValidationException::withMessages([
                'id_categoria' => 'Escolha uma categoria disponivel.',
            ]);
        }

        $goal->update($data->toModelPayload());

        return $goal->refresh();
    }
}
