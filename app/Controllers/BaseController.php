<?php

namespace App\Controllers;

use App\Models\Cart;
use App\Models\SearchKeyword;
use App\Core\RedisCache;
use App\Models\Setting;

/**
 * Base Controller Class
 * Provides common functionality for all controllers
 * 
 * @package App\Controllers
 */
class BaseController
{
    protected const CACHE_TTL = 300; // 5 minutes

    public function __construct()
    {
        $this->ensureSession();
        $this->checkUserLocked();
        $this->checkMaintenance();
    }

    // ==================== SESSION HELPERS ====================

    /**
     * Ensure session is started
     */
    protected function ensureSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Get the current authenticated user
     * 
     * @return array<string, mixed>|null
     */
    protected function getUser(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    /**
     * Get current user ID
     */
    protected function getUserId(): ?int
    {
        return isset($_SESSION['user']['id']) ? (int) $_SESSION['user']['id'] : null;
    }

    /**
     * Check if user is authenticated
     */
    protected function isAuthenticated(): bool
    {
        return isset($_SESSION['user']['id']);
    }

    /**
     * Check if user is admin
     */
    protected function isAdmin(): bool
    {
        return isset($_SESSION['user']['role']) && $_SESSION['user']['role'] === 'admin';
    }

    // ==================== AUTH HELPERS ====================

    /**
     * Require authentication - redirect to login if not authenticated
     * 
     * @return array<string, mixed> The authenticated user
     */
    protected function requireAuth(): array
    {
        if (!$this->isAuthenticated()) {
            $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
            $this->redirect('/login');
        }
        return $_SESSION['user'];
    }

    /**
     * Require admin role
     * 
     * @return array<string, mixed> The authenticated admin user
     */
    protected function requireAdmin(): array
    {
        $user = $this->requireAuth();
        if (!$this->isAdmin()) {
            $this->redirect('/');
        }
        return $user;
    }

    // ==================== RESPONSE HELPERS ====================

    /**
     * Send JSON response
     * 
     * @param array<string, mixed> $data
     * @param int $status HTTP status code
     */
    protected function json(array $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send success JSON response
     * 
     * @param string $message
     * @param array<string, mixed> $data Additional data
     */
    protected function jsonSuccess(string $message = 'Success', array $data = []): never
    {
        $this->json(array_merge(['success' => true, 'message' => $message], $data));
    }

    /**
     * Send error JSON response
     * 
     * @param string $message
     * @param int $status HTTP status code
     */
    protected function jsonError(string $message, int $status = 400): never
    {
        $this->json(['success' => false, 'message' => $message], $status);
    }

    /**
     * Redirect to URL
     * 
     * @param string $url
     * @param array<string, string> $flash Flash messages
     */
    protected function redirect(string $url, array $flash = []): never
    {
        foreach ($flash as $key => $value) {
            $_SESSION["flash_{$key}"] = $value;
        }
        header("Location: {$url}");
        exit;
    }

    /**
     * Redirect back to previous page
     * 
     * @param array<string, string> $flash Flash messages
     */
    protected function back(array $flash = []): never
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? '/';
        $this->redirect($referer, $flash);
    }

    // ==================== VIEW HELPERS ====================

    /**
     * Render a view with data
     * 
     * @param string $viewPath Path to view file (without .php)
     * @param array<string, mixed> $data Data to pass to view
     */
    protected function view(string $viewPath, array $data = []): void
    {
        // Add common data to all views
        $settingModel = new Setting();
        $data['siteSettings'] = $settingModel->getAllGrouped();
        $data['cartCount'] = $this->getCartCount();
        $data['topKeywords'] = $this->getTopKeywords();
        $data['currentUser'] = $this->getUser();

        extract($data);

        $viewFile = __DIR__ . '/../../resources/views/' . $viewPath . '.php';

        if (file_exists($viewFile)) {
            require_once $viewFile;
        } else {
            throw new \RuntimeException("View not found: {$viewPath}");
        }
    }

    // ==================== DATA HELPERS ====================

    /**
     * Get cart item count
     */
    protected function getCartCount(): int
    {
        $cartCount = 0;

        if ($this->isAuthenticated()) {
            $cartModel = new Cart();
            $cartCount = $cartModel->countItems($this->getUserId());
        } else {
            if (isset($_SESSION['cart'])) {
                foreach ($_SESSION['cart'] as $item) {
                    $qty = is_array($item) ? ($item['quantity'] ?? 1) : $item;
                    $cartCount += (int) $qty;
                }
            }
        }

        return $cartCount;
    }

    /**
     * Get top search keywords (cached)
     * 
     * @return array<int, array<string, mixed>>
     */
    protected function getTopKeywords(): array
    {
        $cacheKey = 'top_keywords';
        $redis = RedisCache::getInstance();

        if ($redis->isAvailable()) {
            $topKeywords = $redis->get($cacheKey);

            if ($topKeywords === null) {
                $keywordModel = new SearchKeyword();
                $topKeywords = $keywordModel->getTopKeywords(4);
                $redis->set($cacheKey, $topKeywords, self::CACHE_TTL);
            }

            return $topKeywords;
        }

        // Fallback to session cache
        if (
            !isset($_SESSION['cached_top_keywords']) ||
            !isset($_SESSION['keywords_cache_time']) ||
            (time() - $_SESSION['keywords_cache_time']) > self::CACHE_TTL
        ) {
            $keywordModel = new SearchKeyword();
            $topKeywords = $keywordModel->getTopKeywords(4);

            $_SESSION['cached_top_keywords'] = $topKeywords;
            $_SESSION['keywords_cache_time'] = time();
        } else {
            $topKeywords = $_SESSION['cached_top_keywords'];
        }

        return $topKeywords;
    }

    // ==================== SECURITY CHECKS ====================

    /**
     * Check if current user is locked
     */
    protected function checkUserLocked(): void
    {
        if ($this->isAuthenticated()) {
            $userModel = new \App\Models\User();
            $user = $userModel->find($this->getUserId());

            if (!$user || !empty($user['is_locked'])) {
                unset($_SESSION['user']);
                session_destroy();

                // Start new session for flash message
                session_start();
                $_SESSION['error'] = 'Tài khoản của bạn đã bị khóa.';
                header('Location: /login');
                exit;
            }
        }
    }

    /**
     * Check maintenance mode
     */
    protected function checkMaintenance(): void
    {
        if ($this->isAdmin()) {
            return;
        }

        $currentUri = $_SERVER['REQUEST_URI'] ?? '/';
        if (str_starts_with($currentUri, '/admin') || str_starts_with($currentUri, '/login')) {
            return;
        }

        $settingModel = new Setting();
        $maintenanceMode = $settingModel->get('maintenance_mode', '0');

        if ($maintenanceMode === '1') {
            http_response_code(503);
            include __DIR__ . '/../../resources/views/maintenance.php';
            exit;
        }
    }

    // ==================== INPUT HELPERS ====================

    /**
     * Get POST input with sanitization
     * 
     * @param string $key
     * @param mixed $default
     */
    protected function input(string $key, mixed $default = null): mixed
    {
        return isset($_POST[$key]) ? htmlspecialchars(trim($_POST[$key])) : $default;
    }

    /**
     * Get GET query parameter
     * 
     * @param string $key
     * @param mixed $default
     */
    protected function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * Get JSON body input
     * 
     * @return array<string, mixed>
     */
    protected function getJsonInput(): array
    {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
}
