<?php

namespace App\DTOs;

final readonly class TransactionData
{
    public function __construct(
        public float $amount,
        public string $occurredOn,
        public ?string $description,
        public int $categoryId,
    ) {}

    public function toModelPayload(): array
    {
        return [
            'amount' => round($this->amount, 2),
            'occurred_on' => $this->occurredOn,
            'description' => $this->description,
            'category_id' => $this->categoryId,
        ];
    }
}
