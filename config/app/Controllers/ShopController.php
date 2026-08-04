<?php

namespace App\Controllers;

use App\Models\Product;
use App\Models\User;

class ShopController extends BaseController
{
    public function index()
    {
        $userId = $_GET['id'] ?? null;

        if (!$userId) {
            header('Location: /');
            exit;
        }

        $userModel = new User();
        $seller = $userModel->find($userId);

        if (!$seller) {
            echo "Không tìm thấy cửa hàng";
            exit;
        }

        $productModel = new Product();
        $products = $productModel->getByUserId($userId);

        $this->view('shop/index', [
            'seller' => $seller,
            'products' => $products
        ]);
    }
}
