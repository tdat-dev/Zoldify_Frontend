<?php

/**
 * Firebase Configuration
 * 
 * Cấu hình Firebase Authentication cho đăng nhập Google
 * Lấy từ: Firebase Console → Project Settings → General → Your apps
 */

return [
    'api_key' => $_ENV['FIREBASE_API_KEY'] ?? '',
    'auth_domain' => $_ENV['FIREBASE_AUTH_DOMAIN'] ?? '',
    'project_id' => $_ENV['FIREBASE_PROJECT_ID'] ?? '',
    'storage_bucket' => $_ENV['FIREBASE_STORAGE_BUCKET'] ?? '',
    'messaging_sender_id' => $_ENV['FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    'app_id' => $_ENV['FIREBASE_APP_ID'] ?? '',
    'measurement_id' => $_ENV['FIREBASE_MEASUREMENT_ID'] ?? '',
];
