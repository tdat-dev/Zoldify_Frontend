<?php
namespace App\Services;

use App\Models\User;
use App\Models\Cart;
use App\Services\EmailVerificationService;
use App\Helpers\StringHelper;

class AuthService
{
    public function registerUser($data)
    {
        $userModel = new User();

        // Chuẩn hóa dữ liệu đầu vào
        $fullName = StringHelper::formatName($data['username']);
        $email = StringHelper::formatEmail($data['email']);
        $phone = StringHelper::formatPhone($data['phone'] ?? '');

        // 1. Kiểm tra email trùng
        if ($userModel->checkEmailExists($email)) {
            return ['success' => false, 'message' => 'Email đã được sử dụng'];
        }

        // 2. Đăng ký
        $userId = $userModel->register([
            'full_name' => $fullName,
            'email' => $email,
            'password' => $data['password'],
            'phone_number' => $phone,
            'address' => $data['school'] ?? '',
        ]);

        // 3. Gửi email xác minh
        if ($userId) {
            $verificationService = new EmailVerificationService();
            $verificationService->sendVerification($userId, $email, $fullName);
        }

        return ['success' => true, 'user_id' => $userId, 'email' => $email];
    }

    public function loginUser($email, $password)
    {
        $userModel = new User();
        $user = $userModel->login($email, $password);

        if ($user) {

            // Lưu session
            if (session_status() === PHP_SESSION_NONE)
                session_start();

            // Lưu giỏ hàng từ session trước khi ghi đè
            $sessionCart = $_SESSION['cart'] ?? [];

            $_SESSION['user'] = [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'email_verified' => !empty($user['email_verified'])
            ];

            // Merge giỏ hàng từ Session vào Database
            if (!empty($sessionCart)) {
                $cartModel = new Cart();
                $cartModel->mergeFromSession($user['id'], $sessionCart);
                unset($_SESSION['cart']);
            }

            return ['success' => true];
        }
        return ['success' => false, 'reason' => 'invalid_credentials'];
    }
}