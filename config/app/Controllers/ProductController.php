<?php

namespace App\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Middleware\VerificationMiddleware;

class ProductController extends BaseController // Kế thừa BaseController để dùng hàm view()
{
    public function index()
    {
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = 22; // Số sản phẩm trên mỗi trang
        $offset = ($page - 1) * $limit;

        $productModel = new Product();
        $products = $productModel->getPaginated($limit, $offset);
        $totalProducts = $productModel->countAll();
        $totalPages = ceil($totalProducts / $limit);

        $this->view('products/index', [
            'products' => $products,
            'currentPage' => $page,
            'totalPages' => $totalPages
        ]);
    }

    public function show()
    {
        // Lấy ID từ URL: product-detail?id=5
        $id = $_GET['id'] ?? null;

        $productModel = new Product();
        $product = $productModel->find($id);

        if (!$product) {
            die("Sản phẩm không tồn tại"); // Hoặc redirect 404
        }

        // Lấy thông tin người bán
        $userModel = new User();
        $seller = $userModel->find($product['user_id']);

        // Lấy sản phẩm liên quan (cùng danh mục, trừ sản phẩm hiện tại)
        $relatedProducts = $productModel->getByCategory($product['category_id'], 4, $product['id']);

        $this->view('products/detail', [
            'product' => $product,
            'seller' => $seller,
            'relatedProducts' => $relatedProducts
        ]);
    }

    // Hàm hiện form đăng tin
    public function create()
    {
        $this->view('products/create'); // Bạn cần tạo file view này
    }

    // Hàm xử lý lưu tin
    public function store()
    {
        // Code xử lý upload ảnh và gọi Model create() tại đây
    }
}