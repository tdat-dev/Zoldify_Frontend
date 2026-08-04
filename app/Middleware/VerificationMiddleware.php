<?php
namespace App\Middleware;

class VerificationMiddleware
{
    /**
     * Kiểm tra user đã xác minh email chưa
     * CHỈ áp dụng khi user ĐÃ đăng nhập
     */
    public static function requireVerified(): bool
    {
        // Chưa đăng nhập -> CHO PHÉP (không yêu cầu gì)
        if (!isset($_SESSION['user'])) {
            return true;
        }

        // Đã đăng nhập nhưng chưa xác minh -> redirect verify
        if (empty($_SESSION['user']['email_verified'])) {
            $_SESSION['pending_verification_email'] = $_SESSION['user']['email'];
            $_SESSION['redirect_after_verification'] = $_SERVER['REQUEST_URI'];
            $_SESSION['verification_required_message'] = 'Vui lòng xác minh email để tiếp tục';
            header('Location: /verify-email');
            exit;
        }

        return true;
    }
}