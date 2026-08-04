<?php
namespace App\Controllers;

use App\Services\EmailVerificationService;


class VerificationController extends BaseController
{
    /**
     * Hiển thị trang nhập OTP / chờ xác minh
     */
    public function showVerifyForm()
    {
        // Lấy email từ session
        $email = $_SESSION['pending_verification_email'] ?? null;
        if (!$email) {
            // Không có email pending -> về trang login
            header('Location: /login');
            exit;
        }

        $this->view('auth/verify-email', ['email' => $email]);
    }

    /**
     * Xử lý xác minh bằng token (từ link trong email)
     */
    public function verifyByToken()
    {
        $token = $_GET['token'] ?? '';

        if (empty($token)) {
            $_SESSION['error'] = 'Token không hợp lệ';
            header('Location: /login');
            exit;
        }

        $verificationService = new EmailVerificationService();
        $result = $verificationService->verifyByToken($token);

        if ($result['success']) {
            // Xóa session pending
            unset($_SESSION['pending_verification_email']);

            // CẬP NHẬT: Nếu user đã đăng nhập, cập nhật trạng thái verified trong session
            if (isset($_SESSION['user'])) {
                $_SESSION['user']['email_verified'] = true;

                $redirectUrl = $_SESSION['redirect_after_verification'] ?? '/';
                unset($_SESSION['redirect_after_verification']);

                $_SESSION['success'] = 'Email đã được xác minh thành công!';
                header("Location: $redirectUrl");
                exit;
            }

            $_SESSION['success'] = 'Email đã được xác minh thành công! Vui lòng đăng nhập.';
            header('Location: /login');
            exit;
        }
    }

    /**
     * Xử lý xác minh bằng OTP (từ form nhập mã)
     */
    public function verifyByOtp()
    {
        $email = $_SESSION['pending_verification_email'] ?? '';
        $otp = trim($_POST['otp'] ?? '');

        if (empty($email) || empty($otp)) {
            $this->view('auth/verify-email', [
                'email' => $email,
                'error' => 'Vui lòng nhập mã OTP'
            ]);
            return;
        }

        $verificationService = new EmailVerificationService();
        $result = $verificationService->verifyByOtp($email, $otp);

        if ($result['success']) {
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

            // Nếu chưa đăng nhập (trường hợp đăng ký mới), về trang login
            $_SESSION['success'] = 'Email đã được xác minh thành công! Vui lòng đăng nhập.';
            header('Location: /login');
            exit;
        }
    }

    /**
     * Gửi lại email xác minh
     */
    public function resendVerification()
    {
        $email = $_SESSION['pending_verification_email'] ?? '';

        if (empty($email)) {
            header('Location: /login');
            exit;
        }

        $verificationService = new EmailVerificationService();
        $result = $verificationService->resendVerification($email);

        $this->view('auth/verify-email', [
            'email' => $email,
            'success' => $result['success'] ? $result['message'] : null,
            'error' => !$result['success'] ? $result['message'] : null
        ]);
    }
}