<?php

$host = 'db';
$port = '5432';
$dbname = 'laravel';
$user = 'laravel';
$password = 'secret';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "Conexão com PostgreSQL (database: $dbname) realizada com sucesso!";
} catch (PDOException $e) {
    die("Erro na conexão com o banco de dados: " . $e->getMessage());
}
