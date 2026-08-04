<?php
/**
 * Cron Job: Auto-cancel expired pending orders
 * 
 * Chạy mỗi 5 phút để hủy các đơn hàng chưa thanh toán quá 15 phút.
 * Crontab example: "every 5 minutes" -> php /path/to/cron/cancel_expired_orders.php
 * 
 * @package Zoldify
 */

declare(strict_types=1);

// Bootstrap - Initialize like public/index.php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'UTC');

use App\Models\Order;

// Run
try {
    $orderModel = new Order();
    $result = $orderModel->cancelExpiredOrders();

    $timestamp = date('Y-m-d H:i:s');
    $log = "[{$timestamp}] Cancelled: {$result['cancelled']} orders, Restored: {$result['restored_items']} items\n";

    // Log to file
    $logFile = __DIR__ . '/../storage/logs/cron_cancel_orders.log';
    file_put_contents($logFile, $log, FILE_APPEND | LOCK_EX);

    // Output for cron email
    echo $log;

} catch (Exception $e) {
    $timestamp = date('Y-m-d H:i:s');
    $errorLog = "[{$timestamp}] ERROR: {$e->getMessage()}\n";

    $logFile = __DIR__ . '/../storage/logs/cron_cancel_orders.log';
    file_put_contents($logFile, $errorLog, FILE_APPEND | LOCK_EX);

    echo $errorLog;
    exit(1);
}
