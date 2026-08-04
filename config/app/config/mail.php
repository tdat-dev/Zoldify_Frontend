<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad(); // Dùng safeLoad để không lỗi nếu đã load trước đó

return [
    'host' => $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com',
    'port' => (int) ($_ENV['MAIL_PORT'] ?? 587),
    'encryption' => 'tls',
    'username' => $_ENV['MAIL_USERNAME'] ?? '',
    'password' => $_ENV['MAIL_PASSWORD'] ?? '',
    'from_address' => $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@zoldify.com',
    'from_name' => $_ENV['MAIL_FROM_NAME'] ?? 'Zoldify',

    // Cấu hình token xác minh
    'verification_token_expiry' => 3600, // 1 giờ = 3600 giây
];