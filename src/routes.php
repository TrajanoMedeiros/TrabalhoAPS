<?php

declare(strict_types=1);

use App\Controllers\HealthController;
use App\Http\Router;

$router = new Router();

$router->get('/api/health', [HealthController::class, 'show']);

return $router;
