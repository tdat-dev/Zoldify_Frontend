<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\AuthService;
use App\Validators\AuthValidator;

/**
 * Auth Controller
 * 
 * Xử lý đăng nhập, đăng ký, đăng xuất.
 * 
 * @package App\Controllers
 */
class AuthController extends BaseController
{
    /**
     * Hiển thị form đăng nhập
     */
    public function login(): void
    {
        if ($this->isAuthenticated()) {
            $this->redirect('/');
        }

        $data = [];

        // Check for error from Google Auth redirect
        if (isset($_SESSION['error'])) {
            $data['errors']['login'] = $_SESSION['error'];
            unset($_SESSION['error']);
        }

        $this->view('auth/login', $data);
    }

    /**
     * Xử lý đăng nhập
     */
    public function processLogin(): void
    {
        $validator = new AuthValidator();
        $errors = $validator->validateLogin($_POST);

        if (!empty($errors)) {
            $this->view('auth/login', [
                'errors' => ['login' => reset($errors)],
                'old' => $_POST,
            ]);
            return;
        }

        $authService = new AuthService();
        $email = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        $result = $authService->loginUser($email, $password);

        if ($result['success']) {
            $redirectUrl = $_SESSION['redirect_after_login'] ?? '/';
            unset($_SESSION['redirect_after_login']);
            $this->redirect($redirectUrl);
        }

        // Handle specific failure reasons
        $this->handleLoginFailure($result, $email);
    }

    /**
     * Hiển thị form đăng ký
     */
    public function register(): void
    {
        if ($this->isAuthenticated()) {
            $this->redirect('/');
        }

        $this->view('auth/register');
    }

    /**
     * Xử lý đăng ký
     */
    public function processRegister(): void
    {
        $validator = new AuthValidator();
        $errors = $validator->validateRegister($_POST);

        if (!empty($errors)) {
            $this->view('auth/register', ['errors' => $errors]);
            return;
        }

        $authService = new AuthService();
        $result = $authService->registerUser($_POST);

        if ($result['success']) {
            $_SESSION['pending_verification_email'] = $result['email'];
            $this->redirect('/verify-email');
        }

        $this->view('auth/register', [
            'errors' => ['email' => $result['message']],
        ]);
    }

    /**
     * Đăng xuất
     */
    public function logout(): never
    {
        $this->ensureSession();
        session_destroy();

        $this->redirect('/login');
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Xử lý các trường hợp đăng nhập thất bại
     */
    private function handleLoginFailure(array $result, string $email): void
    {
        $reason = $result['reason'] ?? 'invalid';

        switch ($reason) {
            case 'unverified':
                $_SESSION['pending_verification_email'] = $result['email'];
                $this->redirect('/verify-email');
                break;

            case 'locked':
                $this->view('auth/login', [
                    'errors' => ['login' => $result['message']],
                    'old' => ['username' => $email],
                ]);
                break;

            default:
                $this->view('auth/login', [
                    'errors' => ['login' => 'Email hoặc mật khẩu không đúng'],
                    'old' => ['username' => $email],
                ]);
        }
    }
}