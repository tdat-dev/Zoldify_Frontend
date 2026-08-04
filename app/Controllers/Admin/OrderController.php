<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Order;

class OrderController extends AdminBaseController
{
    private $orderModel;

    public function __construct()
    {
        parent::__construct();
        $this->orderModel = new Order();
    }

    /**
     * Danh sách đơn hàng
     */
    public function index()
    {
        $orders = $this->orderModel->getAllForAdmin();
        $totalOrders = $this->orderModel->count();
        $statusCounts = $this->orderModel->countByStatus();

        $this->view('orders/index', [
            'title' => 'Quản lý Đơn hàng',
            'orders' => $orders,
            'totalOrders' => $totalOrders,
            'statusCounts' => $statusCounts
        ]);
    }

    /**
     * Xem chi tiết đơn hàng
     */
    public function show()
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'ID không hợp lệ';
            header('Location: /admin/orders');
            exit;
        }

        $order = $this->orderModel->find($id);
        $orderDetails = $this->orderModel->getOrderDetails($id);

        if (!$order) {
            $_SESSION['error'] = 'Đơn hàng không tồn tại';
            header('Location: /admin/orders');
            exit;
        }

        $this->view('orders/show', [
            'title' => 'Chi tiết đơn hàng #' . $id,
            'order' => $order,
            'orderDetails' => $orderDetails
        ]);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateStatus()
    {
        $id = $_POST['id'] ?? null;
        $status = $_POST['status'] ?? null;

        if (!$id || !$status) {
            $_SESSION['error'] = 'Dữ liệu không hợp lệ';
            header('Location: /admin/orders');
            exit;
        }

        $result = $this->orderModel->updateStatus((int)$id, $status);

        if ($result) {
            $_SESSION['success'] = 'Cập nhật trạng thái thành công!';
        } else {
            $_SESSION['error'] = 'Cập nhật thất bại';
        }

        header('Location: /admin/orders');
        exit;
    }
}