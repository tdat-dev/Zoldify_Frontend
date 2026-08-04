<?php

namespace App\Controllers;

use App\Models\Product;
use App\Models\SearchKeyword;


class SearchController extends BaseController
{
    public function index()
    {
        $keyword = $_GET['q'] ?? '';
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = 12;
        $offset = ($page - 1) * $limit;

        $productModel = new Product();

        // Tracking keyword nếu có
        if (!empty(trim($keyword))) {
            $searchModel = new SearchKeyword();
            $searchModel->trackKeyword($keyword);
        }

        // Tìm kiếm sản phẩm
        $products = $productModel->searchByKeyword($keyword, $limit, $offset);
        $totalProducts = $productModel->countByKeyword($keyword);
        $totalPages = ceil($totalProducts / $limit);

        $this->view('search/index', [
            'products' => $products,
            'keyword' => $keyword,
            'currentPage' => $page,
            'totalPages' => $totalPages
        ]);
    }

    public function search()
    {
        // Đảm bảo session đã được khởi tạo
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Kiểm tra đăng nhập
        if (!isset($_SESSION['user'])) {
            // Lưu URL hiện tại vào session để redirect sau khi login
            $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
            header('Location: /login');
            exit;
        }

        // Đã đăng nhập -> Cho phép tìm kiếm
        $this->index();
    }

    public function suggest()
    {
        $keyword = $_GET['q'] ?? '';
        $productModel = new Product();

        $results = $productModel->searchByKeyword($keyword, 6, 0);

        header('Content-Type: application/json');
        echo json_encode($results);
        exit;
    }
}