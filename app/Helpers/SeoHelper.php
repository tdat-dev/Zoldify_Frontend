<?php

declare(strict_types=1);

namespace App\Helpers;

/**
 * SeoHelper - Quản lý tất cả SEO tags cho website
 * 
 * Giải thích đơn giản:
 * - Class này giống như "bộ não SEO" của website
 * - Nó tạo ra các thẻ meta để Google và Facebook hiểu nội dung trang
 * 
 * Sử dụng:
 * 1. Controller set data: SeoHelper::setTitle('iPhone 14 Pro');
 * 2. View render: <?= SeoHelper::render() ?>
 * 
 * @package App\Helpers
 */
class SeoHelper
{
    /** @var array Lưu trữ tất cả SEO data */
    private static array $data = [];

    /** @var string Default site name */
    private const SITE_NAME = 'Zoldify';

    /** @var string Default description */
    private const DEFAULT_DESCRIPTION = 'Mua bán đồ cũ uy tín - Nền tảng mua bán đồ secondhand hàng đầu Việt Nam với hệ thống Escrow bảo vệ người mua';

    /** @var string Default OG image */
    private const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

    /**
     * Khởi tạo với default values
     */
    public static function init(): void
    {
        self::$data = [
            'title' => self::SITE_NAME,
            'description' => self::DEFAULT_DESCRIPTION,
            'keywords' => 'mua bán đồ cũ, secondhand, đồ cũ, zoldify, mua bán online',
            'image' => self::DEFAULT_OG_IMAGE,
            'url' => self::getCurrentUrl(),
            'type' => 'website',
            'locale' => 'vi_VN',
            'siteName' => self::SITE_NAME,
            'robots' => 'index, follow',
            'schema' => null,
            'canonical' => null,
        ];
    }

    /**
     * Set page title
     * 
     * @param string $title Tiêu đề trang
     * @param bool $appendSiteName Thêm tên site vào cuối không?
     */
    public static function setTitle(string $title, bool $appendSiteName = true): void
    {
        self::ensureInit();
        self::$data['title'] = $appendSiteName
            ? $title . ' | ' . self::SITE_NAME
            : $title;
    }

    /**
     * Set meta description
     * 
     * @param string $description Mô tả trang (tối đa 160 ký tự cho SEO tốt nhất)
     */
    public static function setDescription(string $description): void
    {
        self::ensureInit();
        // Giới hạn 160 ký tự để hiển thị tốt trên Google
        self::$data['description'] = mb_substr(strip_tags($description), 0, 160);
    }

    /**
     * Set keywords
     */
    public static function setKeywords(string $keywords): void
    {
        self::ensureInit();
        self::$data['keywords'] = $keywords;
    }

    /**
     * Set OG image (ảnh khi share lên Facebook/Zalo)
     * 
     * @param string $imageUrl URL ảnh (relative hoặc absolute)
     */
    public static function setImage(string $imageUrl): void
    {
        self::ensureInit();
        // Chuyển relative URL thành absolute
        if (str_starts_with($imageUrl, '/')) {
            $imageUrl = self::getBaseUrl() . $imageUrl;
        }
        self::$data['image'] = $imageUrl;
    }

    /**
     * Set canonical URL (URL chính thức của trang)
     * Dùng để tránh duplicate content
     */
    public static function setCanonical(string $url): void
    {
        self::ensureInit();
        self::$data['canonical'] = $url;
    }

    /**
     * Set OG type (website, article, product...)
     */
    public static function setType(string $type): void
    {
        self::ensureInit();
        self::$data['type'] = $type;
    }

    /**
     * Set robots directive
     * 
     * @param string $robots 'index, follow' | 'noindex, nofollow' | 'noindex, follow'
     */
    public static function setRobots(string $robots): void
    {
        self::ensureInit();
        self::$data['robots'] = $robots;
    }

    /**
     * Set SEO cho trang sản phẩm
     * 
     * @param array $product Product data từ database
     * @param string|null $imageUrl URL ảnh sản phẩm
     */
    public static function setProduct(array $product, ?string $imageUrl = null): void
    {
        self::ensureInit();

        $productName = $product['name'] ?? 'Sản phẩm';
        $price = $product['price'] ?? 0;
        $description = $product['description'] ?? '';
        $condition = $product['product_condition'] ?? 'good';

        // Set basic SEO
        self::setTitle($productName);
        self::setDescription($description ?: "Mua {$productName} giá " . number_format($price) . "đ tại Zoldify");
        self::setType('product');

        if ($imageUrl) {
            self::setImage($imageUrl);
        }

        // Set Schema.org Product (JSON-LD)
        self::$data['schema'] = self::buildProductSchema($product, $imageUrl);
    }

    /**
     * Set SEO cho trang danh mục
     */
    public static function setCategory(array $category): void
    {
        self::ensureInit();

        $name = $category['name'] ?? 'Danh mục';
        $description = $category['description'] ?? '';

        self::setTitle($name);
        self::setDescription($description ?: "Khám phá các sản phẩm {$name} tại Zoldify - Mua bán đồ cũ uy tín");
    }

    /**
     * Render tất cả meta tags
     * Gọi trong <head> của HTML
     * 
     * @return string HTML meta tags
     */
    public static function render(): string
    {
        self::ensureInit();

        $html = [];

        // Basic Meta Tags
        $html[] = '<meta name="description" content="' . htmlspecialchars(self::$data['description']) . '">';
        $html[] = '<meta name="keywords" content="' . htmlspecialchars(self::$data['keywords']) . '">';
        $html[] = '<meta name="robots" content="' . htmlspecialchars(self::$data['robots']) . '">';

        // Canonical URL
        $canonical = self::$data['canonical'] ?? self::$data['url'];
        $html[] = '<link rel="canonical" href="' . htmlspecialchars($canonical) . '">';

        // Open Graph (Facebook, Zalo, LinkedIn)
        $html[] = '';
        $html[] = '<!-- Open Graph / Facebook -->';
        $html[] = '<meta property="og:type" content="' . htmlspecialchars(self::$data['type']) . '">';
        $html[] = '<meta property="og:url" content="' . htmlspecialchars(self::$data['url']) . '">';
        $html[] = '<meta property="og:title" content="' . htmlspecialchars(self::$data['title']) . '">';
        $html[] = '<meta property="og:description" content="' . htmlspecialchars(self::$data['description']) . '">';
        $html[] = '<meta property="og:image" content="' . htmlspecialchars(self::$data['image']) . '">';
        $html[] = '<meta property="og:site_name" content="' . htmlspecialchars(self::$data['siteName']) . '">';
        $html[] = '<meta property="og:locale" content="' . htmlspecialchars(self::$data['locale']) . '">';

        // Twitter Card
        $html[] = '';
        $html[] = '<!-- Twitter Card -->';
        $html[] = '<meta name="twitter:card" content="summary_large_image">';
        $html[] = '<meta name="twitter:title" content="' . htmlspecialchars(self::$data['title']) . '">';
        $html[] = '<meta name="twitter:description" content="' . htmlspecialchars(self::$data['description']) . '">';
        $html[] = '<meta name="twitter:image" content="' . htmlspecialchars(self::$data['image']) . '">';

        // Schema.org JSON-LD
        if (!empty(self::$data['schema'])) {
            $html[] = '';
            $html[] = '<!-- Schema.org JSON-LD -->';
            $html[] = '<script type="application/ld+json">';
            $html[] = json_encode(self::$data['schema'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
            $html[] = '</script>';
        }

        return implode("\n    ", $html);
    }

    /**
     * Render title tag
     * Dùng riêng cho <title>
     */
    public static function getTitle(): string
    {
        self::ensureInit();
        return htmlspecialchars(self::$data['title']);
    }

    /**
     * Build Schema.org Product JSON-LD
     * 
     * Schema giúp Google hiển thị rich snippets (giá, đánh giá, tình trạng hàng)
     */
    private static function buildProductSchema(array $product, ?string $imageUrl): array
    {
        $availability = ($product['quantity'] ?? 0) > 0 && ($product['status'] ?? '') === 'active'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock';

        // Map condition to Schema.org
        $conditionMap = [
            'new' => 'https://schema.org/NewCondition',
            'like_new' => 'https://schema.org/UsedCondition',
            'good' => 'https://schema.org/UsedCondition',
            'fair' => 'https://schema.org/UsedCondition',
        ];

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product['name'] ?? '',
            'description' => mb_substr($product['description'] ?? '', 0, 500),
            'sku' => 'ZLD-' . ($product['id'] ?? '0'),
            'brand' => [
                '@type' => 'Brand',
                'name' => $product['brand'] ?? 'Không xác định',
            ],
            'offers' => [
                '@type' => 'Offer',
                'url' => self::$data['url'],
                'priceCurrency' => 'VND',
                'price' => $product['price'] ?? 0,
                'availability' => $availability,
                'itemCondition' => $conditionMap[$product['product_condition'] ?? 'good'] ?? 'https://schema.org/UsedCondition',
                'seller' => [
                    '@type' => 'Organization',
                    'name' => 'Zoldify',
                ],
            ],
        ];

        // Add image if available
        if ($imageUrl) {
            $schema['image'] = $imageUrl;
        }

        return $schema;
    }

    /**
     * Build Organization Schema (cho trang chủ)
     */
    public static function getOrganizationSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'Zoldify',
            'description' => self::DEFAULT_DESCRIPTION,
            'url' => self::getBaseUrl(),
            'logo' => self::getBaseUrl() . '/images/logo.png',
            'sameAs' => [
                'https://facebook.com/zoldify',
            ],
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'contactType' => 'customer service',
                'availableLanguage' => 'Vietnamese',
            ],
        ];
    }

    /**
     * Build BreadcrumbList Schema
     * 
     * @param array $items Array of ['name' => '...', 'url' => '...']
     */
    public static function getBreadcrumbSchema(array $items): array
    {
        $listItems = [];
        foreach ($items as $index => $item) {
            $listItems[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['name'],
                'item' => $item['url'],
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $listItems,
        ];
    }

    /**
     * Ensure data is initialized
     */
    private static function ensureInit(): void
    {
        if (empty(self::$data)) {
            self::init();
        }
    }

    /**
     * Get current full URL
     */
    private static function getCurrentUrl(): string
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        return $protocol . '://' . $host . $uri;
    }

    /**
     * Get base URL from env or detect
     */
    private static function getBaseUrl(): string
    {
        // Try to get from env
        $appUrl = $_ENV['APP_URL'] ?? null;
        if ($appUrl) {
            return rtrim($appUrl, '/');
        }

        // Fallback to detection
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $protocol . '://' . $host;
    }

    /**
     * Reset all data (useful for testing)
     */
    public static function reset(): void
    {
        self::$data = [];
    }
}
