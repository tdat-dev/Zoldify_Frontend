<?php

namespace App\Core;

class App
{
    public function run()
    {
        $router = new Router();
        // Load danh sách route
        require_once __DIR__ . '/../../routes/web.php';
        require_once __DIR__ . '/../../routes/admin.php';
        $router->dispatch();
    }
}