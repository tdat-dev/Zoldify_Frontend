<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Setting;

class SettingController extends AdminBaseController
{
    private $settingModel;

    public function __construct()
    {
        parent::__construct();
        $this->settingModel = new Setting();
    }

    /**
     * Hiển thị trang Settings
     */
    public function index()
    {
        // Lấy tất cả settings theo group
        $settings = $this->settingModel->getAll();

        $this->view('settings/index', [
            'title' => 'Cài đặt hệ thống',
            'settings' => $settings
        ]);
    }

    /**
     * Xử lý cập nhật settings
     */
    public function update()
    {
        $group = $_POST['group'] ?? 'general';

        // Lấy tất cả input trừ group và submit button
        $settings = $_POST;
        unset($settings['group']);

        // Cập nhật từng setting
        foreach ($settings as $key => $value) {
            $this->settingModel->set($key, $value, $group);
        }

        $_SESSION['success'] = 'Đã cập nhật cài đặt thành công!';
        header('Location: /admin/settings');
        exit;
    }

    /**
     * Upload logo/favicon
     */
    public function uploadImage()
    {
        $type = $_POST['type'] ?? 'logo'; // logo hoặc favicon
        $settingKey = $type === 'favicon' ? 'site_favicon' : 'site_logo';

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $_SESSION['error'] = 'Vui lòng chọn file ảnh!';
            header('Location: /admin/settings');
            exit;
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];

        if (!in_array($file['type'], $allowedTypes)) {
            $_SESSION['error'] = 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, ICO)!';
            header('Location: /admin/settings');
            exit;
        }

        // Tạo thư mục nếu chưa có
        $uploadDir = __DIR__ . '/../../../public/uploads/settings/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Tạo tên file mới
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newFileName = $type . '_' . time() . '.' . $extension;
        $uploadPath = $uploadDir . $newFileName;

        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            // Lưu đường dẫn vào settings
            $this->settingModel->set($settingKey, '/uploads/settings/' . $newFileName, 'general');
            $_SESSION['success'] = 'Đã upload ' . ($type === 'favicon' ? 'favicon' : 'logo') . ' thành công!';
        } else {
            $_SESSION['error'] = 'Upload thất bại. Vui lòng thử lại!';
        }

        header('Location: /admin/settings');
        exit;
    }

    /**
     * Toggle chế độ bảo trì
     */
    public function toggleMaintenance()
    {
        $current = $this->settingModel->get('maintenance_mode', '0');
        $newValue = $current === '1' ? '0' : '1';

        $this->settingModel->set('maintenance_mode', $newValue, 'maintenance');

        $_SESSION['success'] = $newValue === '1'
            ? 'Đã BẬT chế độ bảo trì!'
            : 'Đã TẮT chế độ bảo trì!';

        header('Location: /admin/settings');
        exit;
    }
}