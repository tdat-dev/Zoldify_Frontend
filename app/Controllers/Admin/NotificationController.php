<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Notification;
use App\Models\User;

/**
 * NotificationController - Gửi thông báo hàng loạt cho Admin
 */
class NotificationController extends AdminBaseController
{
    private Notification $notifModel;
    private User $userModel;

    public function __construct()
    {
        parent::__construct();
        $this->notifModel = new Notification();
        $this->userModel = new User();
    }

    /**
     * Form gửi thông báo
     */
    public function broadcast()
    {
        // Lấy thống kê users
        $stats = [
            'total' => $this->userModel->count(),
            'buyers' => $this->userModel->countByRole('buyer'),
            'sellers' => $this->userModel->countByRole('seller'),
        ];

        $this->view('notifications/broadcast', [
            'title' => 'Gửi Thông báo',
            'stats' => $stats
        ]);
    }

    /**
     * Xử lý gửi thông báo
     */
    public function sendBroadcast()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /admin/notifications/broadcast');
            exit;
        }

        $content = trim($_POST['content'] ?? '');
        $target = $_POST['target'] ?? 'all'; // all, buyers, sellers
        $type = $_POST['type'] ?? 'system';

        if (empty($content)) {
            $_SESSION['error'] = 'Nội dung không được để trống';
            header('Location: /admin/notifications/broadcast');
            exit;
        }

        // Lấy danh sách user IDs theo target (không giới hạn)
        switch ($target) {
            case 'buyers':
                $userIds = $this->userModel->getUserIdsByRole('buyer');
                break;
            case 'sellers':
                $userIds = $this->userModel->getUserIdsByRole('seller');
                break;
            default:
                $userIds = $this->userModel->getAllUserIds();
        }

        // Sử dụng bulk insert để gửi thông báo hiệu quả
        $sent = $this->notifModel->createBulkNotifications($userIds, $content, $type);

        $_SESSION['success'] = "Đã gửi thông báo đến {$sent} người dùng!";
        header('Location: /admin/notifications/broadcast');
        exit;
    }
}
