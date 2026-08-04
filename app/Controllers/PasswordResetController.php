<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\User;
use App\Services\EmailService;

/**
 * Password Reset Controller
 * 
 * Xử lý quên mật khẩu và reset password.
 * 
 * @package App\Controllers
 */
class PasswordResetController extends BaseController
{
    private User $userModel;
    private EmailService $emailService;

    public function __construct()
    {
        parent::__construct();
        $this->userModel = new User();
        $this->emailService = new EmailService();
    }

    /**
     * Hiển thị form quên mật khẩu
     */
    public function showForgotForm(): void
    {
        if ($this->isAuthenticated()) {
            $this->redirect('/');
        }

        $step = $_SESSION['reset_step'] ?? 'email';
        require __DIR__ . '/../../resources/views/auth/forgot-password.php';
    }

    /**
     * Gửi OTP reset password
     */
    public function sendResetOtp(): void
    {
        $email = trim($this->input('email', ''));

        if (empty($email)) {
            $_SESSION['error'] = 'Vui lòng nhập email';
            $this->redirect('/forgot-password');
        }

        $user = $this->userModel->findByEmailFull($email);

        if ($user === null) {
            $_SESSION['error'] = 'Email không tồn tại trong hệ thống';
            $this->redirect('/forgot-password');
        }

        // Check if locked
        if ($this->isResetLocked($user)) {
            $minutesLeft = $this->getLockedMinutesLeft($user);
            $_SESSION['error'] = "Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau {$minutesLeft} phút.";
            $this->redirect('/forgot-password');
        }

        // Generate and save OTP
        $otp = (string) rand(100000, 999999);
        $this->userModel->savePasswordResetToken((int) $user['id'], $otp);

        // Send email
        $sent = $this->emailService->sendPasswordResetEmail($user['email'], $user['full_name'], $otp);

        if ($sent) {
            $_SESSION['reset_email'] = $email;
            $_SESSION['reset_step'] = 'verify';
            $_SESSION['success'] = 'Mã xác nhận đã được gửi đến email của bạn';
        } else {
            $_SESSION['error'] = 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.';
        }

        $this->redirect('/forgot-password');
    }

    /**
     * Xác minh OTP
     */
    public function verifyOtp(): void
    {
        $otp = trim($this->input('otp', ''));
        $email = $_SESSION['reset_email'] ?? '';

        if (empty($email)) {
            $this->redirect('/forgot-password');
        }

        $user = $this->userModel->findByEmailFull($email);

        if ($user === null) {
            $this->redirect('/forgot-password');
        }

        // Check lock
        if ($this->isResetLocked($user)) {
            $minutesLeft = $this->getLockedMinutesLeft($user);
            $_SESSION['error'] = "Tài khoản đang bị khóa. Thử lại sau {$minutesLeft} phút.";
            $this->redirect('/forgot-password');
        }

        // Verify OTP
        $isValid = $user['password_reset_token'] === $otp
            && strtotime($user['password_reset_expires_at']) > time();

        if ($isValid) {
            $_SESSION['reset_verified'] = true;
            unset($_SESSION['reset_step']);
            $this->redirect('/reset-password');
        }

        // Invalid OTP - increment attempts
        $isLocked = $this->userModel->incrementResetAttempts((int) $user['id']);
        $_SESSION['error'] = $isLocked
            ? 'Bạn đã nhập sai quá 5 lần. Vui lòng chờ 5 phút.'
            : 'Mã xác nhận không đúng hoặc đã hết hạn.';

        $this->redirect('/forgot-password');
    }

    /**
     * Hiển thị form đặt mật khẩu mới
     */
    public function showResetForm(): void
    {
        if (!$this->isResetVerified()) {
            $this->redirect('/forgot-password');
        }

        require __DIR__ . '/../../resources/views/auth/reset-password.php';
    }

    /**
     * Đặt mật khẩu mới
     */
    public function resetPassword(): void
    {
        if (!$this->isResetVerified()) {
            $this->redirect('/forgot-password');
        }

        $password = $this->input('password', '');
        $confirm = $this->input('password_confirm', '');

        // Validate
        if (strlen($password) < 6) {
            $_SESSION['error'] = 'Mật khẩu phải có ít nhất 6 ký tự';
            $this->redirect('/reset-password');
        }

        if ($password !== $confirm) {
            $_SESSION['error'] = 'Mật khẩu xác nhận không khớp';
            $this->redirect('/reset-password');
        }

        $user = $this->userModel->findByEmailFull($_SESSION['reset_email']);

        if ($user !== null) {
            $this->userModel->updatePassword((int) $user['id'], $password);
            $this->userModel->clearPasswordResetToken((int) $user['id']);
        }

        // Clean session
        $this->clearResetSession();

        $_SESSION['success'] = 'Đổi mật khẩu thành công. Vui lòng đăng nhập.';
        $this->redirect('/login');
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private function isResetLocked(array $user): bool
    {
        return !empty($user['password_reset_locked_until'])
            && strtotime($user['password_reset_locked_until']) > time();
    }

    private function getLockedMinutesLeft(array $user): int
    {
        return (int) ceil((strtotime($user['password_reset_locked_until']) - time()) / 60);
    }

    private function isResetVerified(): bool
    {
        return !empty($_SESSION['reset_verified']) && !empty($_SESSION['reset_email']);
    }

    private function clearResetSession(): void
    {
        unset($_SESSION['reset_email']);
        unset($_SESSION['reset_verified']);
        unset($_SESSION['reset_step']);
    }
}
