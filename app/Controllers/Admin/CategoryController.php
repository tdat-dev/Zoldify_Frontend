<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Category;

class CategoryController extends AdminBaseController
{
    private $categoryModel;

    public function __construct()
    {
        parent::__construct();
        $this->categoryModel = new Category();
    }

    /**
     * Danh sách categories
     */
    public function index()
    {
        $categories = $this->categoryModel->getAll();
        $totalCategories = $this->categoryModel->count();

        foreach ($categories as &$cat) {
            $cat['product_count'] = $this->categoryModel->countProducts($cat['id']);
        }

        $editingCategory = null;
        if (isset($_GET['edit'])) {
            $editingCategory = $this->categoryModel->find((int) $_GET['edit']);
        }

        $this->view('categories/index', [
            'title' => 'Quản lý Danh mục',
            'categories' => $categories,
            'totalCategories' => $totalCategories,
            'editingCategory' => $editingCategory
        ]);
    }

    /**
     * Thêm category mới
     */
    public function store()
    {
        $data = [
            'name' => trim($_POST['name'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'icon' => '' // Mặc định rỗng
        ];

        if (empty($data['name'])) {
            $_SESSION['error'] = 'Tên danh mục không được để trống';
            header('Location: /admin/categories');
            exit;
        }

        // Xử lý upload icon
        if (isset($_FILES['icon']) && $_FILES['icon']['error'] === UPLOAD_ERR_OK) {
            $data['icon'] = $this->uploadIcon($_FILES['icon']);
        }

        $result = $this->categoryModel->create($data);

        if ($result) {
            $_SESSION['success'] = 'Thêm danh mục thành công!';
        } else {
            $_SESSION['error'] = 'Thêm danh mục thất bại';
        }

        header('Location: /admin/categories');
        exit;
    }

    /**
     * Cập nhật category
     */
    public function update()
    {
        $id = $_POST['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'ID không hợp lệ';
            header('Location: /admin/categories');
            exit;
        }

        $data = [
            'name' => trim($_POST['name'] ?? ''),
            'description' => trim($_POST['description'] ?? '')
        ];

        // Xử lý upload icon mới (nếu có)
        if (isset($_FILES['icon']) && $_FILES['icon']['error'] === UPLOAD_ERR_OK) {
            $data['icon'] = $this->uploadIcon($_FILES['icon']);
        }

        $result = $this->categoryModel->update($id, $data);

        if ($result) {
            $_SESSION['success'] = 'Cập nhật thành công!';
        } else {
            $_SESSION['error'] = 'Cập nhật thất bại';
        }

        header('Location: /admin/categories');
        exit;
    }

    /**
     * Xóa category
     */
    public function delete()
    {
        $id = $_POST['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'ID không hợp lệ';
            header('Location: /admin/categories');
            exit;
        }

        $productCount = $this->categoryModel->countProducts($id);
        if ($productCount > 0) {
            $_SESSION['error'] = "Không thể xóa! Danh mục này có {$productCount} sản phẩm.";
            header('Location: /admin/categories');
            exit;
        }

        $result = $this->categoryModel->delete($id);

        if ($result) {
            $_SESSION['success'] = 'Đã xóa danh mục!';
        } else {
            $_SESSION['error'] = 'Xóa thất bại';
        }

        header('Location: /admin/categories');
        exit;
    }

    /**
     * Helper: Upload icon danh mục
     */
    private function uploadIcon($file): string
    {
        $uploadDir = __DIR__ . '/../../../public/images/categories/';

        // Tạo folder nếu chưa có
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Tạo tên file unique
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

        if (!in_array($extension, $allowedExt)) {
            return ''; // Không hợp lệ
        }

        $fileName = 'category_' . time() . '_' . uniqid() . '.' . $extension;
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return '/images/categories/' . $fileName; // Trả về path tương đối
        }

        return '';
    }
}