<?php

use App\Core\App;

// Session 15 ngày (nửa tháng): 15 * 24 * 60 * 60 = 1296000 giây
ini_set('session.gc_maxlifetime', 1296000);
ini_set('session.cookie_lifetime', 1296000);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../vendor/autoload.php';

// Load biến môi trường từ file .env
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

// Set timezone mặc định (UTC để tính toán, hiển thị sẽ convert sang VN)
date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'UTC');

$app = new App();
$app->run();