<?php
namespace App\Controllers\Admin;

use App\Models\User;
use App\Models\Product;
// use App\Models\Order; // Thêm sau khi tạo

class DashboardController extends AdminBaseController
{
    public function index()
    {
        // Thống kê cơ bản
        $userModel = new User();
        $productModel = new Product();

        $stats = [
            'total_users' => $userModel->count(),
            'total_products' => $productModel->count(),
            'total_orders' => 0, // Thêm sau
            'total_revenue' => 0, // Thêm sau
        ];

        $this->view('dashboard/index', [
            'title' => 'Dashboard',
            'stats' => $stats
        ]);
    }
}