<?php

declare(strict_types=1);

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Firebase Auth Service
 * 
 * Service xử lý xác thực Firebase ID Token từ frontend.
 * 
 * Flow:
 * 1. Frontend gọi Firebase signInWithPopup() → nhận ID token
 * 2. Frontend gửi token về backend qua POST request
 * 3. Backend verify token với Google's tokeninfo endpoint
 * 4. Nếu valid → trả về user info
 * 
 * @package App\Services
 */
class FirebaseAuthService
{
    private Client $httpClient;
    private array $config;
    private ?string $lastError = null;

    /**
     * Firebase Identity Toolkit endpoint
     * Dùng để verify Firebase ID token
     */
    private const VERIFY_TOKEN_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/firebase.php';

        // Disable SSL verification for localhost (Windows/Laragon)
        $this->httpClient = new Client([
            'verify' => false,
            'timeout' => 10
        ]);
    }

    /**
     * Verify Firebase ID Token và lấy thông tin user
     * 
     * @param string $idToken ID Token từ Firebase frontend
     * @return array|null User info hoặc null nếu token không hợp lệ
     * 
     * Trả về array với các field:
     * - email: Email của user
     * - full_name: Tên đầy đủ
     * - avatar: URL ảnh đại diện
     * - email_verified: true/false
     */
    public function verifyIdToken(string $idToken): ?array
    {
        try {
            $apiKey = $this->config['api_key'] ?? '';
            
            if (empty($apiKey)) {
                $this->lastError = 'Firebase API Key chưa được cấu hình';
                return null;
            }

            // Gọi Firebase Identity Toolkit để verify token
            $response = $this->httpClient->post(self::VERIFY_TOKEN_URL . '?key=' . $apiKey, [
                'json' => ['idToken' => $idToken],
                'headers' => ['Content-Type' => 'application/json']
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            // Debug log
            $debugLog = date('Y-m-d H:i:s') . " - Token Info: " . json_encode($data) . "\n";
            file_put_contents(__DIR__ . '/../../storage/logs/firebase_debug.log', $debugLog, FILE_APPEND);

            // Kiểm tra response có chứa users không
            if (empty($data['users']) || !is_array($data['users'])) {
                $this->lastError = 'Token không hợp lệ hoặc đã hết hạn';
                return null;
            }

            $user = $data['users'][0];

            // Token hợp lệ, trả về user info
            return [
                'email' => $user['email'] ?? null,
                'full_name' => $user['displayName'] ?? $user['email'] ?? 'User',
                'avatar' => $user['photoUrl'] ?? null,
                'email_verified' => $user['emailVerified'] ?? false
            ];

        } catch (GuzzleException $e) {
            $this->lastError = 'Lỗi kết nối tới Google: ' . $e->getMessage();
            $errorLog = date('Y-m-d H:i:s') . " - Guzzle Error: " . $e->getMessage() . "\n";
            file_put_contents(__DIR__ . '/../../storage/logs/firebase_debug.log', $errorLog, FILE_APPEND);
            error_log("Firebase Auth Error: " . $e->getMessage());
            return null;
        } catch (\Exception $e) {
            $this->lastError = 'Lỗi xác thực: ' . $e->getMessage();
            $errorLog = date('Y-m-d H:i:s') . " - Exception: " . $e->getMessage() . "\n";
            file_put_contents(__DIR__ . '/../../storage/logs/firebase_debug.log', $errorLog, FILE_APPEND);
            error_log("Firebase Auth Exception: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Lấy thông báo lỗi cuối cùng
     */
    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    /**
     * Kiểm tra Firebase có được cấu hình chưa
     */
    public function isConfigured(): bool
    {
        return !empty($this->config['api_key'])
            && !empty($this->config['project_id']);
    }

    /**
     * Lấy Firebase config để truyền cho frontend
     * Chỉ trả về những field cần thiết cho JS SDK
     */
    public function getClientConfig(): array
    {
        return [
            'apiKey' => $this->config['api_key'],
            'authDomain' => $this->config['auth_domain'],
            'projectId' => $this->config['project_id'],
            'storageBucket' => $this->config['storage_bucket'],
            'messagingSenderId' => $this->config['messaging_sender_id'],
            'appId' => $this->config['app_id'],
            'measurementId' => $this->config['measurement_id'],
        ];
    }
}