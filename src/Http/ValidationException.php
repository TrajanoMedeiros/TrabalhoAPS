<?php

declare(strict_types=1);

namespace App\Http;

final class ValidationException extends HttpException
{
    public function __construct(string $message = 'Dados invalidos.', array $details = [])
    {
        parent::__construct(422, $message, $details);
    }
}
