<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Middleware\AdminMiddleware;

class AdminBaseController
{
    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Kiểm tra quyền admin
        AdminMiddleware::handle();
    }

    /**
     * Render view admin với layout
     * 
     * @param string $viewPath Đường dẫn view (không cần .php)
     * @param array $data Dữ liệu truyền vào view
     * @param string $layout Layout sử dụng (mặc định: master)
     */
    protected function view($viewPath, $data = [], $layout = 'master')
    {
        // Extract data để dùng trong view
        extract($data);

        // Đường dẫn tới view
        $viewFile = __DIR__ . '/../../../resources/views/admin/' . $viewPath . '.php';

        if (!file_exists($viewFile)) {
            echo "Admin View not found: $viewPath";
            return;
        }

        // BẮT ĐẦU OUTPUT BUFFERING
        ob_start();

        // Include view con → HTML được lưu vào buffer
        include $viewFile;

        // Lấy nội dung buffer ra biến $content
        $content = ob_get_clean();

        // Include layout (layout sẽ dùng biến $content)
        $layoutFile = __DIR__ . '/../../../resources/views/admin/layouts/' . $layout . '.php';

        if (file_exists($layoutFile)) {
            include $layoutFile;
        } else {
            // Không có layout → in nội dung trực tiếp
            echo $content;
        }
    }

    /**
     * Redirect to URL
     * 
     * @param string $url
     * @return void
     */
    protected function redirect(string $url)
    {
        header("Location: " . $url);
        exit;
    }
}