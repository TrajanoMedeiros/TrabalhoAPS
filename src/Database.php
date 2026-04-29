<?php

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $host = getenv('DB_HOST') ?: 'db';
        $port = getenv('DB_PORT') ?: '5432';
        $db   = getenv('DB_NAME') ?: 'finance_db';
        $user = getenv('DB_USER') ?: 'finance_user';
        $pass = getenv('DB_PASS') ?: 'finance_pass';

        $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
        try {
            $this->pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (\PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
            exit;
        }
    }

    public static function getConnection() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance->pdo;
    }
}
