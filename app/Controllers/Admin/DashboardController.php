<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;

class DashboardController extends AdminBaseController
{
    public function index()
    {
        $userModel = new User();
        $productModel = new Product();
        $orderModel = new Order();

        $stats = [
            'total_users' => $userModel->count(),
            'total_products' => $productModel->count(),
            'total_orders' => $orderModel->count(),
            'total_revenue' => $orderModel->getTotalRevenue(),
        ];

        $this->view('dashboard/index', [
            'title' => 'Dashboard',
            'stats' => $stats
        ]);
    }
}