<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\Cart;
use App\Helpers\StringHelper;

/**
 * AuthService
 * 
 * Xử lý đăng ký, đăng nhập, đổi mật khẩu.
 * 
 * @package App\Services
 */
class AuthService
{
    private ?EmailVerificationService $emailVerificationService;

    public function __construct(?EmailVerificationService $emailVerificationService = null)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    /**
     * Đăng ký user mới
     * 
     * @param array<string, mixed> $data
     * @return array{success: bool, message?: string, user_id?: int, email?: string}
     */
    public function registerUser(array $data): array
    {
        $userModel = new User();

        // Chuẩn hóa dữ liệu đầu vào
        $fullName = StringHelper::formatName($data['username']);
        $email = StringHelper::formatEmail($data['email']);
        $phone = StringHelper::formatPhone($data['phone'] ?? '');
        if ($phone === '') {
            $phone = null;
        }

        // 1. Kiểm tra email trùng
        if ($userModel->emailExists($email)) {
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
        if ($userId > 0) {
            $verificationService = $this->emailVerificationService ?? new EmailVerificationService();
            $verificationService->sendVerification($userId, $email, $fullName);
        }

        return ['success' => true, 'user_id' => $userId, 'email' => $email];
    }

    /**
     * Đăng nhập user
     * 
     * @return array{success: bool, reason?: string, message?: string, email?: string}
     */
    public function loginUser(string $email, string $password): array
    {
        $userModel = new User();
        $user = $userModel->login($email, $password);

        if ($user === null) {
            return ['success' => false, 'reason' => 'invalid_credentials'];
        }

        // Kiểm tra locked
        if (!empty($user['is_locked'])) {
            return [
                'success' => false,
                'reason' => 'locked',
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.',
            ];
        }

        // Kiểm tra email verified
        if (empty($user['email_verified'])) {
            return [
                'success' => false,
                'reason' => 'unverified',
                'email' => $user['email'],
            ];
        }

        // Start session & save user
        $this->startSessionAndSaveUser($user);

        // Merge cart from session to DB
        $this->mergeSessionCart((int) $user['id']);

        return ['success' => true];
    }

    /**
     * Đổi mật khẩu
     * 
     * @return array{success: bool, message?: string}
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): array
    {
        $userModel = new User();

        if (!$userModel->verifyPassword($userId, $currentPassword)) {
            return ['success' => false, 'message' => 'Mật khẩu hiện tại không đúng.'];
        }

        $result = $userModel->updatePassword($userId, $newPassword);
        return ['success' => $result];
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Start session và lưu user data
     */
    private function startSessionAndSaveUser(array $user): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'email_verified' => !empty($user['email_verified']),
        ];
    }

    /**
     * Merge giỏ hàng từ session vào database
     */
    private function mergeSessionCart(int $userId): void
    {
        $sessionCart = $_SESSION['cart'] ?? [];

        if (!empty($sessionCart)) {
            $cartModel = new Cart();
            $cartModel->mergeFromSession($userId, $sessionCart);
            unset($_SESSION['cart']);
        }
    }
}