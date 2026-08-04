<?php

namespace App\Core;

/**
 * Router Class
 * Handles HTTP routing with support for dynamic parameters and middleware
 * 
 * @package App\Core
 */
class Router
{
    /** @var array<string, array<string, array{callback: callable|array, middleware: array}>> */
    private array $routes = [];

    /** @var array<string, callable> */
    private array $middleware = [];

    /**
     * Register a GET route
     */
    public function get(string $path, callable|array $callback, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $callback, $middleware);
    }

    /**
     * Register a POST route
     */
    public function post(string $path, callable|array $callback, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $callback, $middleware);
    }

    /**
     * Register a PUT route
     */
    public function put(string $path, callable|array $callback, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $callback, $middleware);
    }

    /**
     * Register a PATCH route
     */
    public function patch(string $path, callable|array $callback, array $middleware = []): self
    {
        return $this->addRoute('PATCH', $path, $callback, $middleware);
    }

    /**
     * Register a DELETE route
     */
    public function delete(string $path, callable|array $callback, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $callback, $middleware);
    }

    /**
     * Add a route to the routing table
     */
    private function addRoute(string $method, string $path, callable|array $callback, array $middleware = []): self
    {
        $this->routes[$method][$path] = [
            'callback' => $callback,
            'middleware' => $middleware
        ];
        return $this;
    }

    /**
     * Register a middleware
     */
    public function registerMiddleware(string $name, callable $handler): self
    {
        $this->middleware[$name] = $handler;
        return $this;
    }

    /**
     * Dispatch the request to the appropriate controller
     */
    public function dispatch(): void
    {
        $url = $this->getRequestUrl();
        $method = $this->getRequestMethod();

        // 1. Check EXACT match first (fastest)
        if (isset($this->routes[$method][$url])) {
            $route = $this->routes[$method][$url];
            $this->runMiddleware($route['middleware']);
            $this->executeRoute($route['callback']);
            return;
        }

        // 2. Check DYNAMIC routes with parameters
        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $routePath => $route) {
                if (strpos($routePath, '{') !== false) {
                    $params = $this->matchDynamicRoute($routePath, $url);
                    if ($params !== null) {
                        $this->runMiddleware($route['middleware']);
                        $this->executeRoute($route['callback'], $params);
                        return;
                    }
                }
            }
        }

        // 3. Not found
        $this->handleNotFound();
    }

    /**
     * Get the request URL, normalized
     */
    private function getRequestUrl(): string
    {
        if (isset($_GET['url'])) {
            $url = $_GET['url'];
        } else {
            $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $scriptName = dirname($_SERVER['SCRIPT_NAME']);

            if ($scriptName !== '/' && strpos($requestUri, $scriptName) === 0) {
                $url = substr($requestUri, strlen($scriptName));
            } else {
                $url = $requestUri;
            }
        }

        $url = trim($url, '/');
        return $url === '' ? '/' : $url;
    }

    /**
     * Get the HTTP request method, handling method spoofing
     */
    private function getRequestMethod(): string
    {
        $method = $_SERVER['REQUEST_METHOD'];

        // Support method spoofing via _method field or header
        if ($method === 'POST') {
            if (isset($_POST['_method'])) {
                $method = strtoupper($_POST['_method']);
            } elseif (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
                $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
            }
        }

        return $method;
    }

    /**
     * Match a dynamic route and extract parameters
     * 
     * @return array<string, string>|null Parameters or null if no match
     */
    private function matchDynamicRoute(string $routePath, string $url): ?array
    {
        // Extract parameter names
        preg_match_all('/\{([a-zA-Z0-9_]+)\}/', $routePath, $paramNames);

        // Convert route to regex
        $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_-]+)', $routePath);
        $pattern = "~^{$pattern}$~";

        if (preg_match($pattern, $url, $matches)) {
            array_shift($matches); // Remove full match

            // Create named parameters array
            $params = [];
            foreach ($paramNames[1] as $index => $name) {
                $params[$name] = $matches[$index] ?? null;
            }

            return array_values($matches); // Return indexed array for call_user_func_array
        }

        return null;
    }

    /**
     * Run middleware stack
     * 
     * @param array<string> $middlewareList
     */
    private function runMiddleware(array $middlewareList): void
    {
        foreach ($middlewareList as $name) {
            if (isset($this->middleware[$name])) {
                $result = call_user_func($this->middleware[$name]);
                if ($result === false) {
                    exit; // Middleware blocked the request
                }
            }
        }
    }

    /**
     * Execute a route callback
     * 
     * @param callable|array $callback
     * @param array $params
     */
    private function executeRoute(callable|array $callback, array $params = []): void
    {
        if (is_array($callback)) {
            $controllerName = $callback[0];
            $action = $callback[1];

            $controller = new $controllerName();
            call_user_func_array([$controller, $action], $params);
        } else {
            call_user_func_array($callback, $params);
        }
    }

    /**
     * Handle 404 Not Found
     */
    private function handleNotFound(): void
    {
        http_response_code(404);

        $viewPath = __DIR__ . '/../../resources/views/errors/404.php';
        if (file_exists($viewPath)) {
            include $viewPath;
        } else {
            echo "404 Not Found";
        }
    }
}