<?php

declare(strict_types=1);

use App\Http\JsonResponse;
use App\Http\Request;
use App\Support\Env;

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
        $file = $root . '/src/' . $relative . '.php';
        if (is_file($file)) {
            require_once $file;
        }
    });
}

Env::load($root . '/.env');

$request = Request::capture();
$path = $request->path();
$publicFile = __DIR__ . $path;

if (PHP_SAPI === 'cli-server' && $path !== '/' && is_file($publicFile)) {
    return false;
}

$origin = Env::get('APP_CORS_ORIGIN', '*');
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Vary: Origin');

if ($request->method() === 'OPTIONS') {
    JsonResponse::empty(204)->send();
    return;
}

if (str_starts_with($path, '/api')) {
    $router = require $root . '/src/routes.php';
    $router->dispatch($request);
    return;
}

header('Content-Type: text/html; charset=UTF-8');
readfile(__DIR__ . '/app.html');
