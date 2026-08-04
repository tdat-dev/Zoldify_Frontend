<?php

namespace App\Services;

use Google_Client;
use Google_Service_Oauth2;
use GuzzleHttp\Client;

/**
 * Google OAuth Service
 * 
 * Service xử lý tương tác với Google OAuth API
 */
class GoogleOAuthService
{
    private $client;
    private $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/google.php';
        $this->initializeClient();
    }

    /**
     * Khởi tạo Google Client
     */
    private function initializeClient()
    {
        $this->client = new Google_Client();
        $this->client->setClientId($this->config['client_id']);
        $this->client->setClientSecret($this->config['client_secret']);
        $this->client->setRedirectUri($this->config['redirect_uri']);

        // FIX: Disable SSL Verification for Localhost (Windows/Laragon)
        // Helps avoid "cURL error 60: SSL certificate problem"
        $httpClient = new Client(['verify' => false]);
        $this->client->setHttpClient($httpClient);

        // Yêu cầu quyền truy cập email và profile
        $this->client->addScope("email");
        $this->client->addScope("profile");
    }

    /**
     * Lấy URL để redirect user đến Google
     * 
     * @return string
     */
    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }

    /**
     * Xử lý callback từ Google và lấy thông tin user
     * 
     * @param string $code Authorization code từ Google
     * @return array|null Thông tin user hoặc null nếu lỗi
     */
    public function getUserInfo($code)
    {
        try {
            // Đổi code lấy access token
            $token = $this->client->fetchAccessTokenWithAuthCode($code);

            // DEBUG: Hiển thị lỗi nếu có
            if (isset($token['error'])) {
                error_log("Google OAuth Error: " . $token['error']);
                error_log("Google OAuth Error Description: " . ($token['error_description'] ?? 'N/A'));
                // TẠM THỜI: Hiển thị lỗi ra màn hình để debug
                die("Google OAuth Error: " . $token['error'] . " - " . ($token['error_description'] ?? ''));
            }

            // Set access token
            $this->client->setAccessToken($token);

            // Lấy thông tin user
            $oauth2 = new Google_Service_Oauth2($this->client);
            $userInfo = $oauth2->userinfo->get();

            return [
                'google_id' => $userInfo->id,
                'email' => $userInfo->email,
                'full_name' => $userInfo->name,
                'avatar' => $userInfo->picture,
                'email_verified' => $userInfo->verifiedEmail
            ];
        } catch (\Exception $e) {
            error_log("Google OAuth Exception: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Kiểm tra cấu hình có hợp lệ không
     * 
     * @return bool
     */
    public function isConfigured()
    {
        return !empty($this->config['client_id'])
            && !empty($this->config['client_secret'])
            && !empty($this->config['redirect_uri']);
    }
}
