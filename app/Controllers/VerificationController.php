<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\EmailVerificationService;

/**
 * Verification Controller
 * 
 * Xử lý xác minh email qua OTP hoặc link.
 * 
 * @package App\Controllers
 */
class VerificationController extends BaseController
{
    /**
     * Hiển thị form nhập OTP
     */
    public function showVerifyForm(): void
    {
        $email = $_SESSION['pending_verification_email'] ?? null;

        if ($email === null) {
            $this->redirect('/login');
        }

        $this->view('auth/verify-email', ['email' => $email]);
    }

    /**
     * Xác minh bằng token (link trong email)
     */
    public function verifyByToken(): void
    {
        $token = $this->query('token', '');

        if (empty($token)) {
            $_SESSION['error'] = 'Token không hợp lệ';
            $this->redirect('/login');
            return;
        }

        $verificationService = new EmailVerificationService();
        $result = $verificationService->verifyByToken($token);

        if ($result['success']) {
            $this->handleVerificationSuccess();
        } else {
            // Token không hợp lệ hoặc hết hạn - hiển thị lỗi
            $_SESSION['error'] = $result['message'] ?? 'Xác minh thất bại';
            $this->redirect('/login');
        }
    }

    /**
     * Xác minh bằng OTP (form nhập mã)
     */
    public function verifyByOtp(): void
    {
        $email = $_SESSION['pending_verification_email'] ?? '';
        $otp = trim($this->input('otp', ''));

        if (empty($email) || empty($otp)) {
            $this->view('auth/verify-email', [
                'email' => $email,
                'error' => 'Vui lòng nhập mã OTP',
            ]);
            return;
        }

        $verificationService = new EmailVerificationService();
        $result = $verificationService->verifyByOtp($email, $otp);

        if ($result['success']) {
            $this->handleVerificationSuccess();
            // Xóa session pending
            unset($_SESSION['pending_verification_email']);

            // CẬP NHẬT: Nếu user đã đăng nhập, cập nhật trạng thái verified trong session
            if (isset($_SESSION['user'])) {
                $_SESSION['user']['email_verified'] = true;

                // Redirect về trang user muốn truy cập trước đó
                $redirectUrl = $_SESSION['redirect_after_verification'] ?? '/';
                unset($_SESSION['redirect_after_verification']);

                $_SESSION['success'] = 'Email đã được xác minh thành công!';
                header("Location: $redirectUrl");
                exit;
            }

            // Nếu chưa đăng nhập (trường hợp đăng ký mvcới), về trang login
            $_SESSION['success'] = 'Email đã được xác minh thành công! Vui lòng đăng nhập.';
            header('Location: /login');
            exit;
        }
    }

    /**
     * Gửi lại email xác minh
     */
    public function resendVerification(): void
    {
        $email = $_SESSION['pending_verification_email'] ?? '';

        if (empty($email)) {
            $this->redirect('/login');
        }

        $verificationService = new EmailVerificationService();
        $result = $verificationService->resendVerification($email);

        $this->view('auth/verify-email', [
            'email' => $email,
            'success' => $result['success'] ? $result['message'] : null,
            'error' => !$result['success'] ? $result['message'] : null,
        ]);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Xử lý sau khi xác minh thành công
     */
    private function handleVerificationSuccess(): never
    {
        unset($_SESSION['pending_verification_email']);

        // Nếu đã đăng nhập, cập nhật session
        if (isset($_SESSION['user'])) {
            $_SESSION['user']['email_verified'] = true;

            $redirectUrl = $_SESSION['redirect_after_verification'] ?? '/';
            unset($_SESSION['redirect_after_verification']);

            $_SESSION['success'] = 'Email đã được xác minh thành công!';
            $this->redirect($redirectUrl);
        }

        // Chưa đăng nhập - về login
        $_SESSION['success'] = 'Email đã được xác minh thành công! Vui lòng đăng nhập.';
        $this->redirect('/login');
    }
}