<?php

namespace App\Controllers;

use App\Services\GoogleOAuthService;
use App\Models\User;

/**
 * Google Authentication Controller
 * 
 * Xử lý đăng nhập/đăng ký bằng Google OAuth
 */
class GoogleAuthController extends BaseController
{
    private $googleService;
    private $userModel;

    public function __construct()
    {
        parent::__construct();
        $this->googleService = new GoogleOAuthService();
        $this->userModel = new User();
    }

    /**
     * Redirect user đến trang đăng nhập Google
     */
    public function redirectToGoogle()
    {
        // Kiểm tra cấu hình
        if (!$this->googleService->isConfigured()) {
            $_SESSION['error'] = 'Google OAuth chưa được cấu hình. Vui lòng liên hệ admin.';
            header('Location: /login');
            exit;
        }

        // Lấy URL và redirect
        $authUrl = $this->googleService->getAuthUrl();
        header('Location: ' . $authUrl);
        exit;
    }

    /**
     * Xử lý callback từ Google sau khi user đồng ý
     */
    public function handleGoogleCallback()
    {
        // Kiểm tra có code không
        if (!isset($_GET['code'])) {
            $_SESSION['error'] = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
            header('Location: /login');
            exit;
        }

        // Lấy thông tin user từ Google
        $googleUser = $this->googleService->getUserInfo($_GET['code']);

        if (!$googleUser) {
            $_SESSION['error'] = 'Không thể lấy thông tin từ Google. Vui lòng thử lại.';
            header('Location: /login');
            exit;
        }

        // Kiểm tra email đã tồn tại chưa
        $existingUser = $this->userModel->findByEmail($googleUser['email']);

        if ($existingUser) {

            $this->userModel->markAsVerified($existingUser['id']);
            // User đã tồn tại -> Đăng nhập
            $_SESSION['user'] = [
                'id' => $existingUser['id'],
                'full_name' => $existingUser['full_name'],
                'email' => $existingUser['email'],
                'role' => $existingUser['role'],
                'email_verified' => true // Google đã xác minh email rồi!
            ];
            $_SESSION['success'] = 'Đăng nhập thành công!';
            session_regenerate_id(true);
            session_write_close();
            header('Location: /');
            exit;
        } else {
            // User chưa tồn tại -> Tạo tài khoản mới
            $newUserId = $this->registerGoogleUser($googleUser);

            if ($newUserId) {
                // Lấy thông tin user vừa tạo và đăng nhập
                $newUser = $this->userModel->find($newUserId);
                $_SESSION['user'] = [
                    'id' => $newUser['id'],
                    'full_name' => $newUser['full_name'],
                    'email' => $newUser['email'],
                    'role' => $newUser['role'],
                    'email_verified' => true // Google đã xác minh email rồi!
                ];
                $_SESSION['success'] = 'Đăng ký thành công! Chào mừng bạn đến với Zoldify.';

                // Regenerate & Save session
                session_regenerate_id(true);
                session_write_close();

                header('Location: /');
                exit;
            } else {
                $_SESSION['error'] = 'Đăng ký thất bại. Vui lòng thử lại.';
                session_write_close();
                header('Location: /register');
                exit;
            }
        }
    }

    /**
     * Đăng ký user mới từ Google
     * 
     * @param array $googleUser Thông tin user từ Google
     * @return int|false ID của user mới hoặc false nếu lỗi
     */
    private function registerGoogleUser($googleUser)
    {
        // Tạo password ngẫu nhiên (user không cần biết vì đăng nhập bằng Google)
        $randomPassword = bin2hex(random_bytes(16));

        $userData = [
            'full_name' => $googleUser['full_name'],
            'email' => $googleUser['email'],
            'password' => $randomPassword,
            'phone_number' => null,
            'address' => null,
            'role' => 'buyer', // Mặc định là buyer, có thể upgrade sau
            'email_verified' => 1
        ];

        try {
            return $this->userModel->register($userData);
        } catch (\Exception $e) {
            error_log("Register Google User Error: " . $e->getMessage());
            return false;
        }
    }
}
