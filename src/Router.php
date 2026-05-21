<?php

class Router {
    private $routes = [];

    public function get($uri, $action) {
        $this->addRoute('GET', $uri, $action);
    }

    public function post($uri, $action) {
        $this->addRoute('POST', $uri, $action);
    }

    public function put($uri, $action) {
        $this->addRoute('PUT', $uri, $action);
    }

    public function delete($uri, $action) {
        $this->addRoute('DELETE', $uri, $action);
    }

    private function addRoute($method, $uri, $action) {

        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $uri);
        $pattern = '#^' . $pattern . '$#';

        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'pattern' => $pattern,
            'action' => $action
        ];
    }

    public function dispatch($uri, $method) {
        $parsedUri = parse_url($uri, PHP_URL_PATH);

        if ($parsedUri !== '/' && substr($parsedUri, -1) === '/') {
            $parsedUri = rtrim($parsedUri, '/');
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $parsedUri, $matches)) {
                list($controller, $action) = explode('@', $route['action']);
                $controllerInstance = new $controller();

                $params = array_filter($matches, function($key) {
                    return !is_numeric($key);
                }, ARRAY_FILTER_USE_KEY);

                if (!empty($params)) {
                    call_user_func_array([$controllerInstance, $action], array_values($params));
                } else {
                    $controllerInstance->$action();
                }
                return;
            }
        }

        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Route not found"]);
    }
}
