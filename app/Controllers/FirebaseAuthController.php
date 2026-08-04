<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\FirebaseAuthService;
use App\Models\User;

/**
 * Firebase Auth Controller
 * 
 * Xử lý đăng nhập/đăng ký bằng Firebase Authentication (Google).
 * 
 * Flow:
 * 1. Frontend gọi Firebase signInWithPopup()
 * 2. Frontend gửi ID token về endpoint này
 * 3. Verify token → Login/Register user
 * 
 * @package App\Controllers
 */
class FirebaseAuthController extends BaseController
{
    private FirebaseAuthService $firebaseService;
    private User $userModel;

    public function __construct()
    {
        parent::__construct();
        $this->firebaseService = new FirebaseAuthService();
        $this->userModel = new User();
    }

    /**
     * Xử lý đăng nhập từ Firebase
     * 
     * Nhận POST request với ID token từ frontend,
     * verify và đăng nhập/đăng ký user.
     * 
     * @return void JSON response
     */
    public function handleFirebaseLogin(): void
    {
        // Xóa mọi output trước đó và tắt hiển thị lỗi PHP
        ob_clean();
        @ini_set('display_errors', '0');
        header('Content-Type: application/json');
        
        // Đảm bảo luôn trả về JSON
        try {
            // Chỉ chấp nhận POST request
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                $this->jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
                return;
            }

            // Lấy ID token từ request body
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            $idToken = $input['idToken'] ?? null;

            if (empty($idToken)) {
                $this->jsonResponse(['success' => false, 'message' => 'ID Token không được cung cấp'], 400);
                return;
            }

            // Verify token với Firebase
            $firebaseUser = $this->firebaseService->verifyIdToken($idToken);

            if ($firebaseUser === null) {
                $errorMessage = $this->firebaseService->getLastError() ?? 'Token không hợp lệ hoặc đã hết hạn';
                $this->jsonResponse(['success' => false, 'message' => $errorMessage], 401);
                return;
            }

        // Kiểm tra email có tồn tại không
        if (empty($firebaseUser['email'])) {
            $this->jsonResponse(['success' => false, 'message' => 'Không thể lấy email từ tài khoản Google'], 400);
            return;
        }

        // Tìm user trong database
        $existingUser = $this->userModel->findByEmail($firebaseUser['email']);

        if ($existingUser !== null) {
            // User đã tồn tại → đăng nhập
            $this->loginExistingUser($existingUser);
        } else {
            // User mới → đăng ký rồi đăng nhập
            $this->registerAndLoginNewUser($firebaseUser);
        }
        
        } catch (\Throwable $e) {
            // Log lỗi và trả về JSON
            error_log('Firebase Login Error: ' . $e->getMessage());
            $this->jsonResponse([
                'success' => false, 
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy Firebase config cho frontend
     * 
     * Endpoint để frontend lấy config mà không cần hardcode
     */
    public function getConfig(): void
    {
        if (!$this->firebaseService->isConfigured()) {
            $this->jsonResponse(['success' => false, 'message' => 'Firebase chưa được cấu hình'], 500);
            return;
        }

        $this->jsonResponse([
            'success' => true,
            'config' => $this->firebaseService->getClientConfig()
        ]);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Đăng nhập user đã tồn tại
     */
    private function loginExistingUser(array $user): void
    {
        // Đánh dấu email đã xác minh (Google/Firebase đã verify)
        $this->userModel->markAsVerified((int) $user['id']);

        $_SESSION['user'] = [
            'id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'email_verified' => true,
        ];

        session_regenerate_id(true);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'redirect' => '/'
        ]);
    }

    /**
     * Đăng ký user mới từ Firebase và đăng nhập
     */
    private function registerAndLoginNewUser(array $firebaseUser): void
    {
        $newUserId = $this->registerFirebaseUser($firebaseUser);

        if ($newUserId === 0) {
            $this->jsonResponse(['success' => false, 'message' => 'Đăng ký thất bại'], 500);
            return;
        }

        $newUser = $this->userModel->find($newUserId);

        if ($newUser === null) {
            $this->jsonResponse(['success' => false, 'message' => 'Đăng ký thất bại'], 500);
            return;
        }

        $_SESSION['user'] = [
            'id' => $newUser['id'],
            'full_name' => $newUser['full_name'],
            'email' => $newUser['email'],
            'role' => $newUser['role'],
            'email_verified' => true,
        ];

        session_regenerate_id(true);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Đăng ký thành công! Chào mừng bạn đến với Zoldify.',
            'redirect' => '/'
        ]);
    }

    /**
     * Đăng ký user mới từ data Firebase
     * 
     * @return int User ID hoặc 0 nếu lỗi
     */
    private function registerFirebaseUser(array $firebaseUser): int
    {
        // Tạo password ngẫu nhiên (user sẽ không dùng, chỉ đăng nhập qua Google)
        $randomPassword = bin2hex(random_bytes(16));

        $userData = [
            'full_name' => $firebaseUser['full_name'],
            'email' => $firebaseUser['email'],
            'password' => $randomPassword,
            'phone_number' => null,
            'address' => null,
            'email_verified' => 1,
        ];

        try {
            return $this->userModel->register($userData);
        } catch (\Exception $e) {
            error_log("Register Firebase User Error: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Helper để trả về JSON response
     */
    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
