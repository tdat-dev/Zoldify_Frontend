<?php
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
     * Render view admin
     */
    protected function view($viewPath, $data = [])
    {
        extract($data);

        $viewFile = __DIR__ . '/../../../resources/views/admin/' . $viewPath . '.php';

        if (file_exists($viewFile)) {
            require_once $viewFile;
        } else {
            echo "Admin View not found: $viewPath";
        }
    }
}