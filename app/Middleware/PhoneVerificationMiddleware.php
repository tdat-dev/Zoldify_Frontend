<?php

declare(strict_types=1);

namespace App\Middleware;

/**
 * Phone Verification Middleware
 * 
 * Kiểm tra user đã xác minh số điện thoại chưa.
 * Áp dụng cho các action yêu cầu SĐT thật:
 * - Đăng bán sản phẩm
 * - Thanh toán/checkout
 * 
 * @package App\Middleware
 */
class PhoneVerificationMiddleware
{
    /**
     * Yêu cầu user phải xác minh số điện thoại
     * CHỈ áp dụng khi user ĐÃ đăng nhập
     * 
     * @return bool
     */
    public static function requireVerified(): bool
    {
        // ============================================
        // TẠM TẮT CHỨC NĂNG XÁC MINH SĐT
        // Uncomment code bên dưới để bật lại
        // ============================================
        return true;
        
        /*
        // Chưa đăng nhập -> Cho phép (AuthMiddleware sẽ xử lý)
        if (!isset($_SESSION['user'])) {
            return true;
        }

        // Đã đăng nhập nhưng chưa xác minh phone -> redirect
        if (empty($_SESSION['user']['phone_verified'])) {
            // Lưu URL hiện tại để redirect về sau khi verify
            $_SESSION['redirect_after_phone_verification'] = $_SERVER['REQUEST_URI'];
            $_SESSION['phone_verification_message'] = 'Vui lòng xác minh số điện thoại để tiếp tục';

            header('Location: /verify-phone');
            exit;
        }

        return true;
        */
    }

    /**
     * Kiểm tra phone đã verified chưa (không redirect)
     * Dùng cho UI check hiển thị badge/warning
     * 
     * @return bool
     */
    public static function isVerified(): bool
    {
        return !empty($_SESSION['user']['phone_verified']);
    }
}