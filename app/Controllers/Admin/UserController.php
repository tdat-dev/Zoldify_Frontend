<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\User;

class UserController extends AdminBaseController
{
    private $userModel;

    public function __construct()
    {
        parent::__construct();
        $this->userModel = new User();
    }

    /**
     * Hiển thị danh sách users
     */
    public function index()
    {
        $users = $this->userModel->getAll();
        $totalUsers = $this->userModel->count();

        $this->view('users/index', [
            'title' => 'Quản lý Users',
            'users' => $users,
            'totalUsers' => $totalUsers
        ]);
    }

    /**
     * Hiển thị form sửa user
     */
    public function edit()
    {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'Không tìm thấy user';
            header('Location: /admin/users');
            exit;
        }

        $user = $this->userModel->find($id);

        if (!$user) {
            $_SESSION['error'] = 'User không tồn tại';
            header('Location: /admin/users');
            exit;
        }

        $this->view('users/edit', [
            'title' => 'Sửa User',
            'user' => $user
        ]);
    }

    /**
     * Xử lý cập nhật user
     */
    public function update()
    {
        $id = $_POST['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'Dữ liệu không hợp lệ';
            header('Location: /admin/users');
            exit;
        }

        $data = [
            'full_name' => trim($_POST['full_name'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'phone_number' => trim($_POST['phone_number'] ?? ''),
            'role' => $_POST['role'] ?? 'buyer',
            'email_verified' => isset($_POST['email_verified']) ? 1 : 0
        ];

        $result = $this->userModel->update($id, $data);

        if ($result) {
            $_SESSION['success'] = 'Cập nhật user thành công!';
        } else {
            $_SESSION['error'] = 'Cập nhật thất bại';
        }

        header('Location: /admin/users');
        exit;
    }

    /**
     * Khóa/Mở khóa tài khoản
     */
    public function toggleLock()
    {
        $id = $_POST['id'] ?? null;

        if (!$id) {
            $_SESSION['error'] = 'ID không hợp lệ';
            header('Location: /admin/users');
            exit;
        }

        // Không cho khóa chính mình
        if ($id == $_SESSION['user']['id']) {
            $_SESSION['error'] = 'Không thể khóa chính mình!';
            header('Location: /admin/users');
            exit;
        }

        $result = $this->userModel->toggleLock((int) $id);

        if ($result) {
            $_SESSION['success'] = 'Đã cập nhật trạng thái tài khoản!';
        } else {
            $_SESSION['error'] = 'Thao tác thất bại';
        }

        header('Location: /admin/users');
        exit;
    }

    /**
     * Toggle trạng thái xác minh email
     */
    public function toggleStatus()
    {
        $id = isset($_POST['id']) ? (int) $_POST['id'] : null;

        if ($id) {
            $this->userModel->toggleVerified($id);
            $_SESSION['success'] = 'Đã cập nhật trạng thái!';
        }

        header('Location: /admin/users');
        exit;
    }
}