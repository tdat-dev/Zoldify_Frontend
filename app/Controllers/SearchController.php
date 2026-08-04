<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\SearchKeyword;
use App\Helpers\SeoHelper;

/**
 * Search Controller
 * 
 * Xử lý tìm kiếm sản phẩm và autocomplete suggestions.
 * 
 * @package App\Controllers
 */
class SearchController extends BaseController
{
    private const ITEMS_PER_PAGE = 12;

    /**
     * Trang kết quả tìm kiếm
     */
    public function index(): void
    {
        $keyword = $this->query('q', '');
        $categoryId = $this->query('category');
        $page = max(1, (int) $this->query('page', 1));
        $offset = ($page - 1) * self::ITEMS_PER_PAGE;

        // Get sort parameter
        $sort = $this->query('sort', 'newest');

        // Get filter parameters
        $priceMin = $this->query('price_min');
        $priceMax = $this->query('price_max');
        $productCondition = $this->query('product_condition');

        // Track keyword nếu có
        if (!empty(trim($keyword))) {
            $searchModel = new SearchKeyword();
            $searchModel->trackKeyword($keyword);
        }

        // Resolve category children nếu có filter category
        $filterCategoryId = $categoryId;
        if ($categoryId !== null) {
            $categoryModel = new Category();
            $filterCategoryId = $categoryModel->getChildrenIds((int) $categoryId);
        }

        $filters = [
            'keyword' => $keyword,
            'category_id' => $filterCategoryId,
            'sort' => $sort,
            'price_min' => $priceMin,
            'price_max' => $priceMax,
            'product_condition' => $productCondition,
        ];

        $productModel = new Product();
        $products = $productModel->getFiltered($filters, self::ITEMS_PER_PAGE, $offset);
        $totalProducts = $productModel->countFiltered($filters);

        // SEO: noindex cho trang search để tránh duplicate content
        SeoHelper::setTitle('Tìm kiếm: ' . $keyword);
        SeoHelper::setRobots('noindex, follow');

        $this->view('search/index', [
            'products' => $products,
            'keyword' => $keyword,
            'categoryId' => $categoryId,
            'currentPage' => $page,
            'totalPages' => (int) ceil($totalProducts / self::ITEMS_PER_PAGE),
        ]);
    }

    /**
     * Tìm kiếm với yêu cầu đăng nhập
     */
    public function search(): void
    {
        if (!$this->isAuthenticated()) {
            $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
            $this->redirect('/login');
        }

        $this->index();
    }

    /**
     * API: Gợi ý sản phẩm cho autocomplete
     */
    public function suggest(): never
    {
        $keyword = $this->query('q', '');

        $productModel = new Product();
        $results = $productModel->searchByKeyword($keyword, 6, 0);

        $this->json($results);
    }
}