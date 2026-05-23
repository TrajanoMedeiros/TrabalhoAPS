<?php

namespace App\DTOs;

final readonly class GoalData
{
    public function __construct(
        public string $title,
        public float $targetAmount,
        public float $currentAmount,
        public ?string $dueOn,
        public ?int $categoryId,
    ) {}

    public function toModelPayload(): array
    {
        return [
            'title' => $this->title,
            'target_amount' => round($this->targetAmount, 2),
            'current_amount' => round($this->currentAmount, 2),
            'due_on' => $this->dueOn,
            'category_id' => $this->categoryId,
        ];
    }
}
