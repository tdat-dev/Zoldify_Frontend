<?php
/**
 * Cron Job: Auto-release escrow funds after trial period
 * 
 * Chạy mỗi ngày để:
 * 1. Tìm các escrow đã đến hạn giải ngân (release_scheduled_at <= NOW())
 * 2. Chuyển tiền từ pending vào balance của seller
 * 3. Đánh dấu đơn hàng là completed
 * 
 * Crontab example: "0 0 * * *" (mỗi ngày 0h) -> php /path/to/cron/release_escrow.php
 * 
 * @package Zoldify
 */

declare(strict_types=1);

// Bootstrap
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'UTC');

use App\Services\EscrowService;
use App\Models\Order;

// Run
try {
    $escrowService = new EscrowService();
    $orderModel = new Order();

    // Lấy tất cả escrow đã đến hạn
    $releasable = $escrowService->getReleasableEscrows();

    $released = 0;
    $failed = 0;
    $errors = [];

    foreach ($releasable as $escrow) {
        try {
            $orderId = (int) $escrow['order_id'];

            // 1. Release funds to seller wallet
            $success = $escrowService->releaseFunds($orderId, 'Auto-release after trial period');

            if ($success) {
                // 2. Mark order as completed
                $orderModel->markAsCompleted($orderId);
                $released++;
            } else {
                $failed++;
                $errors[] = "Order #{$orderId}: Release failed - invalid escrow state";
            }
        } catch (\Exception $e) {
            $failed++;
            $errors[] = "Order #{$orderId}: " . $e->getMessage();
        }
    }

    // Log
    $timestamp = date('Y-m-d H:i:s');
    $log = "[{$timestamp}] Released: {$released}, Failed: {$failed}, Total: " . count($releasable) . "\n";

    if (!empty($errors)) {
        $log .= "Errors:\n" . implode("\n", $errors) . "\n";
    }

    $logFile = __DIR__ . '/../storage/logs/cron_release_escrow.log';
    file_put_contents($logFile, $log, FILE_APPEND | LOCK_EX);

    echo $log;

} catch (Exception $e) {
    $timestamp = date('Y-m-d H:i:s');
    $errorLog = "[{$timestamp}] ERROR: {$e->getMessage()}\n";

    $logFile = __DIR__ . '/../storage/logs/cron_release_escrow.log';
    file_put_contents($logFile, $errorLog, FILE_APPEND | LOCK_EX);

    echo $errorLog;
    exit(1);
}
