<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\ProductController;

$controller = new ProductController();
$controller->index();  // In ra JSON danh sách products