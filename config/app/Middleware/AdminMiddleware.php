<?php
namespace App\Middleware;

class AdminMiddleware
{
    /**
     * Kiểm tra user có phải admin không
     * Gọi ở đầu mỗi action trong Admin Controller
     */
    public static function handle(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Chưa đăng nhập
        if (!isset($_SESSION['user'])) {
            $_SESSION['error'] = 'Vui lòng đăng nhập';
            header('Location: /login');
            exit;
        }

        // Không phải admin
        if ($_SESSION['user']['role'] !== 'admin') {
            $_SESSION['error'] = 'Bạn không có quyền truy cập';
            header('Location: /');
            exit;
        }

        return true;
    }
}