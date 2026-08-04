<?php

namespace App\Controllers;
use App\Models\Product;
use App\Models\Category;

class HomeController extends BaseController
{
    public function index()
    {
        $productModel = new Product();
        $categoryModel = new Category();

        $latestProducts = $productModel->getLatest(8);
        $suggestedProducts = $productModel->getRandom(12);
        $topProducts = $productModel->getByTopKeywords(6);
        $categories = $categoryModel->getAll();

        $this->view('home/index', [
            'latestProducts' => $latestProducts,
            'suggestedProducts' => $suggestedProducts,
            'topProducts' => $topProducts,
            'categories' => $categories,
        ]);
    }
}