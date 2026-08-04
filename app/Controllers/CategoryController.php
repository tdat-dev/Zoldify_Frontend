<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Helpers\SeoHelper;

/**
 * Category Controller
 * 
 * Trang danh mục sản phẩm giống Shopee/Lazada.
 * Features: Sidebar categories, sorting, filters, product grid.
 * 
 * @package App\Controllers
 */
class CategoryController extends BaseController
{
    private const ITEMS_PER_PAGE = 24;

    /**
     * Trang danh mục với SEO URL (Zoldify style)
     * 
     * URL: /dm/dien-thoai.c123
     */
    public function showBySlug(string $slug, int $id): void
    {
        // Gọi show() với flag fromSeoUrl=true để không redirect lại
        $this->show($id, true);
    }

    /**
     * Trang danh mục
     * 
     * Nếu truy cập bằng URL cũ /category/{id}, redirect sang SEO URL mới
     */
    public function show(int $id, bool $fromSeoUrl = false): void
    {
        $categoryModel = new Category();
        $productModel = new Product();

        // Lấy thông tin category hiện tại
        $category = $categoryModel->find($id);
        if (!$category) {
            $this->redirect('/');
            return;
        }

        // Redirect sang SEO URL nếu truy cập bằng URL cũ
        if (!$fromSeoUrl) {
            $seoUrl = \App\Helpers\SlugHelper::categoryUrl($category['name'], (int) $category['id']);
            // Giữ lại query params nếu có
            if (!empty($_GET)) {
                $seoUrl .= '?' . http_build_query($_GET);
            }
            header("Location: {$seoUrl}", true, 301);
            exit;
        }

        // Lấy category tree (tất cả categories cho sidebar)
        $allCategories = $categoryModel->getWithChildren();

        // Lấy parent category (nếu có)
        $parentCategory = null;
        if (!empty($category['parent_id'])) {
            $parentCategory = $categoryModel->find($category['parent_id']);
        }

        // Lấy children categories (subcategories)
        $childCategories = $categoryModel->getChildren($id);

        // Parse filters từ query string
        $filters = $this->parseFilters($id, $categoryModel);

        // Pagination
        $page = max(1, (int) $this->query('page', 1));
        $offset = ($page - 1) * self::ITEMS_PER_PAGE;

        // Lấy products với filters
        $products = $productModel->getFiltered($filters, self::ITEMS_PER_PAGE, $offset);
        $totalProducts = $productModel->countFiltered($filters);
        $totalPages = (int) ceil($totalProducts / self::ITEMS_PER_PAGE);

        // ========== SEO cho trang danh mục ==========
        SeoHelper::setCategory($category);
        // ============================================

        $this->view('category/index', [
            'category' => $category,
            'parentCategory' => $parentCategory,
            'childCategories' => $childCategories,
            'allCategories' => $allCategories,
            'products' => $products,
            'totalProducts' => $totalProducts,
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'filters' => $filters,
            'currentSort' => $this->query('sort', 'popular'),
        ]);
    }

    /**
     * Parse filters từ query string
     * 
     * @return array<string, mixed>
     */
    private function parseFilters(int $categoryId, Category $categoryModel): array
    {
        // Lấy tất cả category IDs bao gồm children
        $categoryIds = $categoryModel->getChildrenIds($categoryId);

        return [
            'category_id' => $categoryIds,
            'product_condition' => $this->query('product_condition'),
            'rating' => $this->query('rating') !== null ? (int) $this->query('rating') : null,
            'price_min' => $this->query('price_min') !== null ? (int) $this->query('price_min') : null,
            'price_max' => $this->query('price_max') !== null ? (int) $this->query('price_max') : null,
            'sort' => $this->query('sort', 'popular'),
        ];
    }

    /**
     * API: Lấy products AJAX (cho lazy loading)
     */
    public function getProducts(): never
    {
        $categoryId = (int) $this->query('category_id', 0);
        $page = max(1, (int) $this->query('page', 1));
        $offset = ($page - 1) * self::ITEMS_PER_PAGE;

        if ($categoryId <= 0) {
            $this->jsonError('Invalid category ID');
        }

        $categoryModel = new Category();
        $productModel = new Product();

        $filters = $this->parseFilters($categoryId, $categoryModel);
        $products = $productModel->getFiltered($filters, self::ITEMS_PER_PAGE, $offset);

        $this->jsonSuccess([
            'products' => $products,
            'page' => $page,
            'hasMore' => count($products) === self::ITEMS_PER_PAGE,
        ]);
    }
}
