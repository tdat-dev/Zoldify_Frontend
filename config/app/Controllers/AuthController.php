<?php
namespace App\Controllers;

use App\Services\AuthService;
use App\Validators\AuthValidator;

class AuthController extends BaseController
{
    // --- LOGIN (HIỂN THỊ FORM) ---
    public function login()
    {
        if (isset($_SESSION['user'])) {
            header('Location: /');
            exit;
        }

        // Kiểm tra lỗi từ Session (ví dụ từ Google Auth redirect về)
        $data = [];
        if (isset($_SESSION['error'])) {
            $data['errors']['login'] = $_SESSION['error'];
            unset($_SESSION['error']);
        }

        $this->view('auth/login', $data);
    }

    // --- XỬ LÝ ĐĂNG NHẬP ---
    public function processLogin()
    {
        // 1. Validate dữ liệu đầu vào
        $validator = new AuthValidator();
        $errors = $validator->validateLogin($_POST);

        if (!empty($errors)) {
            $this->view('auth/login', ['errors' => $errors]);
            return;
        }

        // 2. Gọi Service để kiểm tra đăng nhập
        $authService = new AuthService();
        $email = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        $result = $authService->loginUser($email, $password);

        if ($result['success']) {
            // Đăng nhập thành công
            if (isset($_SESSION['redirect_after_login'])) {
                $redirectUrl = $_SESSION['redirect_after_login'];
                unset($_SESSION['redirect_after_login']);
                header("Location: $redirectUrl");
            } else {
                header('Location: /');
            }
            exit;
        } elseif ($result['reason'] === 'unverified') {
            // Email chưa xác minh -> chuyển đến trang verify
            $_SESSION['pending_verification_email'] = $result['email'];
            header('Location: /verify-email');
            exit;
        } else {
            $this->view('auth/login', [
                'errors' => ['login' => 'Email hoặc mật khẩu không chính xác'],
                'old' => ['username' => $email]
            ]);
        }
    }

    // --- REGISTER (HIỂN THỊ FORM) ---
    public function register()
    {
        if (isset($_SESSION['user'])) {
            header('Location: /');
            exit;
        }
        $this->view('auth/register');
    }

    // --- XỬ LÝ ĐĂNG KÝ (Chuyển đến trang verify) ---
    public function processRegister()
    {
        // 1. Validate dữ liệu
        $validator = new AuthValidator();
        $errors = $validator->validateRegister($_POST);

        if (!empty($errors)) {
            $this->view('auth/register', ['errors' => $errors]);
            return;
        }

        // 2. Gọi Service xử lý đăng ký
        $authService = new AuthService();
        $result = $authService->registerUser($_POST);

        if ($result['success']) {
            // Lưu email để hiển thị ở trang verify
            $_SESSION['pending_verification_email'] = $result['email'];

            // Chuyển đến trang xác minh email
            header('Location: /verify-email');
            exit;
        } else {
            $this->view('auth/register', [
                'errors' => ['email' => $result['message']]
            ]);
        }
    }

    // --- ĐĂNG XUẤT ---
    public function logout()
    {
        // Khởi động session nếu chưa có để còn destroy nó
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        session_destroy(); // Xóa sạch dữ liệu đăng nhập

        // SỬA DÒNG NÀY: Chuyển về /login thay vì /
        header('Location: /login');
        exit;
    }
}