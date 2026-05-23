<?php

declare(strict_types=1);

namespace App\Http;

final class AuthenticationException extends HttpException
{
    public function __construct(string $message = 'Autenticacao necessaria.')
    {
        parent::__construct(401, $message);
    }
}
