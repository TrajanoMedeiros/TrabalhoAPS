<?php

declare(strict_types=1);

namespace App;

use App\Support\Env;
use PDO;

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $dsn = Env::get('DB_DSN');
        if ($dsn === null || $dsn === '') {
            $host = Env::get('DB_HOST', 'db');
            $port = Env::get('DB_PORT', '5432');
            $name = Env::get('DB_NAME', 'finance_db');
            $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', $host, $port, $name);
        }

        self::$connection = new PDO($dsn, Env::get('DB_USER', 'finance_user'), Env::get('DB_PASS', 'finance_pass'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return self::$connection;
    }

    public static function reset(): void
    {
        self::$connection = null;
    }
}
