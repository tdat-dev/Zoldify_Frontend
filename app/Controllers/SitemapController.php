<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Helpers\SlugHelper;

/**
 * SitemapController - Tạo sitemap.xml động
 * 
 * Sitemap là gì?
 * - Một file XML chứa danh sách TẤT CẢ các URL quan trọng của website
 * - Google dùng file này để biết website có những trang nào
 * - Giúp Google index (lưu vào cơ sở dữ liệu) website nhanh hơn
 * 
 * Ví dụ output:
 * <urlset>
 *   <url>
 *     <loc>https://zoldify.com/</loc>
 *     <lastmod>2024-01-23</lastmod>
 *     <priority>1.0</priority>
 *   </url>
 *   ...
 * </urlset>
 */
class SitemapController extends BaseController
{
    /**
     * Generate và trả về sitemap.xml
     * 
     * Route: GET /sitemap.xml
     */
    public function index(): void
    {
        // Clear any previous output (whitespace, etc.) to prevent XML errors
        if (ob_get_length()) {
            ob_end_clean();
        }

        // Set header để browser hiểu đây là file XML
        header('Content-Type: application/xml; charset=UTF-8');

        $baseUrl = $this->getBaseUrl();
        $urls = [];

        // 1. Trang chủ - Priority cao nhất
        $urls[] = [
            'loc' => $baseUrl . '/',
            'lastmod' => date('Y-m-d'),
            'changefreq' => 'daily',
            'priority' => '1.0',
        ];

        // 2. Trang static quan trọng
        $staticPages = [
            '/products' => ['priority' => '0.9', 'changefreq' => 'daily'],
            '/support' => ['priority' => '0.5', 'changefreq' => 'monthly'],
            '/privacy' => ['priority' => '0.3', 'changefreq' => 'yearly'],
            '/terms' => ['priority' => '0.3', 'changefreq' => 'yearly'],
        ];

        foreach ($staticPages as $path => $meta) {
            $urls[] = [
                'loc' => $baseUrl . $path,
                'lastmod' => date('Y-m-d'),
                'changefreq' => $meta['changefreq'],
                'priority' => $meta['priority'],
            ];
        }

        // 3. Danh mục sản phẩm
        $categories = $this->getActiveCategories();
        foreach ($categories as $category) {
            $urls[] = [
                'loc' => $baseUrl . SlugHelper::categoryUrl($category['name'], (int) $category['id']),
                'lastmod' => date('Y-m-d', strtotime($category['updated_at'] ?? 'now')),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        // 4. Sản phẩm đang bán (giới hạn 5000 URL theo Google guidelines)
        $products = $this->getActiveProducts(5000);
        foreach ($products as $product) {
            $urls[] = [
                'loc' => $baseUrl . SlugHelper::productUrl($product['name'], (int) $product['id']),
                'lastmod' => date('Y-m-d', strtotime($product['updated_at'] ?? 'now')),
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ];
        }

        // Render XML
        echo $this->renderXml($urls);
        exit;
    }

    /**
     * Render URLs thành XML format
     */
    private function renderXml(array $urls): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($url['loc']) . "</loc>\n";

            if (!empty($url['lastmod'])) {
                $xml .= "    <lastmod>" . $url['lastmod'] . "</lastmod>\n";
            }
            if (!empty($url['changefreq'])) {
                $xml .= "    <changefreq>" . $url['changefreq'] . "</changefreq>\n";
            }
            if (!empty($url['priority'])) {
                $xml .= "    <priority>" . $url['priority'] . "</priority>\n";
            }

            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Lấy danh sách categories đang active
     */
    private function getActiveCategories(): array
    {
        try {
            $categoryModel = new Category();
            return $categoryModel->findAll(['status' => 'active'], 'name ASC', 100);
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Lấy danh sách products đang active
     */
    private function getActiveProducts(int $limit = 5000): array
    {
        try {
            $productModel = new Product();
            return $productModel->findAll(
                [
                    'status' => 'active',
                    'quantity >' => 0
                ],
                'updated_at DESC',
                $limit
            );
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get base URL
     */
    private function getBaseUrl(): string
    {
        $appUrl = $_ENV['APP_URL'] ?? null;
        if ($appUrl) {
            return rtrim($appUrl, '/');
        }

        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host;
    }
}
