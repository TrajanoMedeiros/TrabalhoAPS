<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$autoload = $root . '/vendor/autoload.php';

if (is_file($autoload)) {
    require_once $autoload;
} else {
    spl_autoload_register(static function (string $class) use ($root): void {
        $prefix = 'App\\';
        if (!str_starts_with($class, $prefix)) {
            return;
        }

        $relative = str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen($prefix)));
        require_once $root . '/src/' . $relative . '.php';
    });
}

use App\Http\Request;
use App\Http\ValidationException;
use App\Support\Jwt;
use App\Support\Validator;

putenv('JWT_SECRET=test-secret-with-enough-length');
putenv('JWT_TTL_SECONDS=3600');

$tests = [
    'jwt round trip' => function (): void {
        $issued = Jwt::issue(42, 'user@example.com');
        $payload = Jwt::verify($issued['token']);

        assertSame(42, (int) $payload['sub']);
        assertSame('user@example.com', $payload['email']);
    },
    'jwt rejects tampering' => function (): void {
        $issued = Jwt::issue(42, 'user@example.com');
        $token = $issued['token'] . 'tampered';

        assertThrows(fn () => Jwt::verify($token));
    },
    'validator normalizes transaction payload' => function (): void {
        $data = Validator::make([
            'valor' => '123.456',
            'data' => '2026-05-23',
            'descricao' => '  Salario mensal  ',
            'id_categoria' => '7',
        ])
            ->requiredMoney('valor', 'Valor')
            ->requiredDate('data', 'Data')
            ->optionalString('descricao', 'Descricao')
            ->requiredInt('id_categoria', 'Categoria')
            ->validate();

        assertSame(123.46, $data['valor']);
        assertSame('Salario mensal', $data['descricao']);
        assertSame(7, $data['id_categoria']);
    },
    'validator rejects invalid period' => function (): void {
        $request = new Request('GET', '/api/dashboard?mes=13', ['mes' => '13'], [], '');
        assertThrows(fn () => Validator::periodFilters($request), ValidationException::class);
    },
];

$failures = 0;

foreach ($tests as $name => $test) {
    try {
        $test();
        echo "[ok] {$name}\n";
    } catch (Throwable $exception) {
        $failures++;
        echo "[fail] {$name}: {$exception->getMessage()}\n";
    }
}

exit($failures === 0 ? 0 : 1);

function assertSame(mixed $expected, mixed $actual): void
{
    if ($expected !== $actual) {
        throw new RuntimeException(sprintf('Expected %s, got %s.', var_export($expected, true), var_export($actual, true)));
    }
}

function assertThrows(callable $callback, string $class = Throwable::class): void
{
    try {
        $callback();
    } catch (Throwable $exception) {
        if ($exception instanceof $class) {
            return;
        }

        throw new RuntimeException('Unexpected exception class ' . $exception::class);
    }

    throw new RuntimeException('Expected exception was not thrown.');
}
