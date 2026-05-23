<?php

declare(strict_types=1);

namespace App\Http;

use App\Support\Env;
use PDOException;
use Throwable;

final class Router
{
    private array $routes = [];

    public function get(string $path, array $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, array $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, array $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, array $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    public function dispatch(Request $request): void
    {
        try {
            foreach ($this->routes as $route) {
                if ($route['method'] !== $request->method()) {
                    continue;
                }

                if (!preg_match($route['pattern'], $request->path(), $matches)) {
                    continue;
                }

                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                [$class, $method] = $route['handler'];
                $response = (new $class())->{$method}($request, $params);

                if (!$response instanceof JsonResponse) {
                    $response = JsonResponse::success((array) $response);
                }

                $response->send();
                return;
            }

            throw new HttpException(404, 'Rota nao encontrada.');
        } catch (HttpException $exception) {
            JsonResponse::error($exception->getMessage(), $exception->status(), $exception->details())->send();
        } catch (PDOException $exception) {
            $details = Env::isDebug() ? ['exception' => $exception->getMessage()] : [];
            JsonResponse::error('Erro ao acessar o banco de dados.', 500, $details)->send();
        } catch (Throwable $exception) {
            $details = Env::isDebug() ? ['exception' => $exception->getMessage()] : [];
            JsonResponse::error('Erro interno inesperado.', 500, $details)->send();
        }
    }

    private function add(string $method, string $path, array $handler): void
    {
        $pattern = preg_replace('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'pattern' => '#^' . $pattern . '$#',
            'handler' => $handler,
        ];
    }
}
