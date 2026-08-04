<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class EmailVerificationService
{
    private User $userModel;
    private EmailService $emailService;
    private int $tokenExpiry;

    public function __construct()
    {
        $this->userModel = new User();
        $this->emailService = new EmailService();

        $config = require __DIR__ . '/../../config/mail.php';
        $this->tokenExpiry = $config['verification_token_expiry'];
    }

    /**
     * Tạo token + OTP và gửi email xác minh
     */
    public function sendVerification(int $userId, string $email, string $fullName): bool
    {
        // 1. Tạo token ngẫu nhiên (64 ký tự hex = 32 bytes)
        $token = bin2hex(random_bytes(32));

        // 2. Tạo OTP 6 số
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // 3. Tính thời gian hết hạn
        $expiresAt = date('Y-m-d H:i:s', time() + $this->tokenExpiry);

        // 4. Lưu vào database (token = hash của token thật + OTP)
        // Lưu cả token và OTP cùng chỗ, phân cách bằng "|"
        $combinedToken = $token . '|' . $otp;
        $this->userModel->saveVerificationToken($userId, $combinedToken, $expiresAt);

        // 5. Gửi email
        return $this->emailService->sendVerificationEmail($email, $fullName, $token, $otp);
    }

    /**
     * Xác minh bằng token (từ link)
     */
    public function verifyByToken(string $token): array
    {
        $user = $this->userModel->findByVerificationToken($token);

        if (!$user) {
            return ['success' => false, 'message' => 'Token không hợp lệ'];
        }

        if (strtotime($user['email_verification_expires_at']) < time()) {
            return ['success' => false, 'message' => 'Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác minh.'];
        }

        // Cập nhật trạng thái verified
        $this->userModel->markAsVerified($user['id']);

        return ['success' => true, 'user_id' => $user['id']];
    }

    /**
     * Xác minh bằng OTP
     */
    public function verifyByOtp(string $email, string $otp): array
    {
        $email = strtolower(trim($email)); // Normalize
        $user = $this->userModel->findByEmailForVerification($email);

        if (!$user) {
            return ['success' => false, 'message' => 'Email không tồn tại'];
        }

        if ($user['email_verified']) {
            return ['success' => false, 'message' => 'Email đã được xác minh'];
        }

        // Lấy OTP từ token đã lưu (format: token|otp)
        $parts = explode('|', $user['email_verification_token'] ?? '');
        $savedOtp = $parts[1] ?? '';

        if ($otp !== $savedOtp) {
            return ['success' => false, 'message' => 'Mã OTP không chính xác'];
        }

        if (strtotime($user['email_verification_expires_at']) < time()) {
            return ['success' => false, 'message' => 'Mã OTP đã hết hạn'];
        }

        $this->userModel->markAsVerified($user['id']);

        return ['success' => true, 'user_id' => $user['id']];
    }

    /**
     * Gửi lại email xác minh
     */
    public function resendVerification(string $email): array
    {
        $email = strtolower(trim($email)); // Normalize
        $user = $this->userModel->findByEmailForVerification($email);

        if (!$user) {
            return ['success' => false, 'message' => 'Email không tồn tại'];
        }

        if ($user['email_verified']) {
            return ['success' => false, 'message' => 'Email đã được xác minh'];
        }

        $sent = $this->sendVerification($user['id'], $email, $user['full_name']);

        if ($sent) {
            return ['success' => true, 'message' => 'Đã gửi lại email xác minh'];
        }

        return ['success' => false, 'message' => 'Không thể gửi email. Vui lòng thử lại sau.'];
    }
}