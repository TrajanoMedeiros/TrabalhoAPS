<?php

declare(strict_types=1);

namespace App\Http;

use RuntimeException;

class HttpException extends RuntimeException
{
    public function __construct(
        private readonly int $status,
        string $message,
        private readonly array $details = []
    ) {
        parent::__construct($message);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function details(): array
    {
        return $this->details;
    }
}
