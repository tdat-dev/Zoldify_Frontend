<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Product;
use App\Models\Category;

class ProductController extends AdminBaseController
{
    private $productModel;
    private $categoryModel;

    public function __construct()
    {
        parent::__construct();
        $this->productModel = new Product();
        $this->categoryModel = new Category();
    }

    /**
     * Danh sách sản phẩm
     */
    public function index()
    {
        $products = $this->productModel->getAllForAdmin();
        $totalProducts = $this->productModel->count();

        $this->view('products/index', [
            'title' => 'Quản lý Sản phẩm',
            'products' => $products,
            'totalProducts' => $totalProducts
        ]);
    }

    /**
     * Form thêm sản phẩm
     */
    public function create()
    {
        $categories = $this->categoryModel->getAll();

        $this->view('products/create', [
            'title' => 'Thêm sản phẩm',
            'categories' => $categories
        ]);
    }

    /**
     * Xử lý thêm sản phẩm
     */
    public function store()
    {
        // Xử lý upload ảnh
        $imageName = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageName = $this->uploadImage($_FILES['image']);
        }

        $data = [
            'name' => trim($_POST['name'] ?? ''),
            'price' => (float) ($_POST['price'] ?? 0),
            'quantity' => (int) ($_POST['quantity'] ?? 1),
            'description' => trim($_POST['description'] ?? ''),
            'category_id' => (int) ($_POST['category_id'] ?? 1),
            'user_id' => $_SESSION['user']['id'],
            'image' => $imageName
        ];

        $result = $this->productModel->create($data);

        if ($result) {
            $_SESSION['success'] = 'Thêm sản phẩm thành công!';
        } else {
            $_SESSION['error'] = 'Thêm sản phẩm thất bại';
        }

        header('Location: /admin/products');
        exit;
    }

    /**
     * Form sửa sản phẩm
     */
    public function edit()
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'ID không hợp lệ';
            header('Location: /admin/products');
            exit;
        }

        $product = $this->productModel->find((int) $id);
        $categories = $this->categoryModel->getAll();

        if (!$product) {
            $_SESSION['error'] = 'Sản phẩm không tồn tại';
            header('Location: /admin/products');
            exit;
        }

        $this->view('products/edit', [
            'title' => 'Sửa sản phẩm',
            'product' => $product,
            'categories' => $categories
        ]);
    }

    /**
     * Xử lý cập nhật sản phẩm
     */
    public function update()
    {
        $id = $_POST['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'Dữ liệu không hợp lệ';
            header('Location: /admin/products');
            exit;
        }

        $data = [
            'name' => trim($_POST['name'] ?? ''),
            'price' => (float) ($_POST['price'] ?? 0),
            'quantity' => (int) ($_POST['quantity'] ?? 1),
            'description' => trim($_POST['description'] ?? ''),
            'category_id' => (int) ($_POST['category_id'] ?? 1),
            'status' => $_POST['status'] ?? 'active'
        ];

        // Xử lý upload ảnh mới (nếu có)
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $data['image'] = $this->uploadImage($_FILES['image']);
        }

        $result = $this->productModel->update((int) $id, $data);

        if ($result) {
            $_SESSION['success'] = 'Cập nhật thành công!';
        } else {
            $_SESSION['error'] = 'Cập nhật thất bại';
        }

        header('Location: /admin/products');
        exit;
    }

    /**
     * Xóa sản phẩm
     */
    public function delete()
    {
        $id = $_POST['id'] ?? null;

        if ($id) {
            $productId = (int) $id;

            // Kiểm tra sản phẩm có đơn hàng không
            if ($this->productModel->hasAnyOrder($productId)) {
                // Có đơn hàng → Soft delete (ẩn sản phẩm)
                $this->productModel->hideProduct($productId);
                $_SESSION['success'] = 'Sản phẩm đã được ẩn (không thể xóa vĩnh viễn vì có lịch sử đơn hàng)';
            } else {
                // Không có đơn hàng → Hard delete (xóa thật)
                $this->productModel->delete($productId);
                $_SESSION['success'] = 'Đã xóa sản phẩm!';
            }
        }

        header('Location: /admin/products');
        exit;
    }

    /**
     * Helper: Upload ảnh sản phẩm
     */
    private function uploadImage($file): string
    {
        $uploadDir = __DIR__ . '/../../../public/uploads/';

        // Tạo tên file unique
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'product_' . time() . '_' . uniqid() . '.' . $extension;

        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $fileName;
        }

        return '';
    }
}