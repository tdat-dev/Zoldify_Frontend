<?php

declare(strict_types=1);

namespace App\Helpers;

/**
 * SlugHelper - Tạo URL slug độc đáo cho Zoldify
 * 
 * URL Format (Unique Zoldify Style):
 * - Product: /z/ten-san-pham.p123
 * - Category: /dm/ten-danh-muc.c123
 * 
 * Giải thích:
 * - /z/ = Zoldify brand prefix
 * - /dm/ = Danh Mục prefix
 * - .p123 = product ID
 * - .c123 = category ID
 * 
 * @package App\Helpers
 */
class SlugHelper
{
    /** @var string Product URL prefix */
    private const PRODUCT_PREFIX = '/z/';

    /** @var string Category URL prefix */
    private const CATEGORY_PREFIX = '/dm/';

    /**
     * Chuyển text thành URL slug (SEO-friendly)
     * 
     * "Điện Thoại & Phụ Kiện" → "dien-thoai-phu-kien"
     * "iPhone 14 Pro Max 256GB" → "iphone-14-pro-max-256gb"
     * 
     * @param string $text
     * @param int $maxLength Maximum length of slug
     * @return string
     */
    public static function toSlug(string $text, int $maxLength = 80): string
    {
        // 1. Loại bỏ dấu tiếng Việt
        $text = self::removeVietnameseAccents($text);

        // 2. Chuyển thành lowercase
        $text = mb_strtolower($text);

        // 3. Thay thế ký tự đặc biệt bằng khoảng trắng
        $text = preg_replace('/[^a-z0-9\s]/', ' ', $text);

        // 4. Loại bỏ khoảng trắng thừa
        $text = preg_replace('/\s+/', ' ', trim($text));

        // 5. Thay khoảng trắng bằng dấu gạch ngang
        $text = str_replace(' ', '-', $text);

        // 6. Giới hạn độ dài
        if (strlen($text) > $maxLength) {
            $text = substr($text, 0, $maxLength);
            // Cắt tại dấu - cuối cùng để không bị cắt giữa từ
            $lastDash = strrpos($text, '-');
            if ($lastDash !== false && $lastDash > $maxLength / 2) {
                $text = substr($text, 0, $lastDash);
            }
        }

        return $text;
    }

    /**
     * Tạo URL cho product (Zoldify style)
     * 
     * Output: /z/ten-san-pham.p123
     * 
     * @param string $name Tên sản phẩm
     * @param int $productId ID sản phẩm (param thứ 2 hoặc 3 đều được vì backward compat)
     * @return string URL
     */
    public static function productUrl(string $name, int $productIdOrSellerId, ?int $productId = null): string
    {
        // Backward compatibility: nếu có 3 params, param thứ 3 là productId
        $actualProductId = $productId ?? $productIdOrSellerId;
        $slug = self::toSlug($name, 60);
        return self::PRODUCT_PREFIX . "{$slug}.p{$actualProductId}";
    }

    /**
     * Tạo URL cho category (Zoldify style)
     * 
     * Output: /dm/ten-danh-muc.c123
     * 
     * @param string $name Tên danh mục
     * @param int $id ID danh mục
     * @return string URL
     */
    public static function categoryUrl(string $name, int $id): string
    {
        $slug = self::toSlug($name, 50);
        return self::CATEGORY_PREFIX . "{$slug}.c{$id}";
    }

    /**
     * Parse product ID từ slug URL
     * 
     * Input: "ten-san-pham.p123" hoặc full URL
     * Output: 123
     * 
     * @param string $slug
     * @return int|null Product ID hoặc null nếu không hợp lệ
     */
    public static function parseProductId(string $slug): ?int
    {
        // Match .p followed by digits at the end
        if (preg_match('/\.p(\d+)$/', $slug, $matches)) {
            return (int) $matches[1];
        }
        return null;
    }

    /**
     * Parse category ID từ slug URL
     * 
     * Input: "ten-danh-muc.c123" hoặc full URL
     * Output: 123
     * 
     * @param string $slug
     * @return int|null Category ID hoặc null nếu không hợp lệ
     */
    public static function parseCategoryId(string $slug): ?int
    {
        // Match .c followed by digits at the end
        if (preg_match('/\.c(\d+)$/', $slug, $matches)) {
            return (int) $matches[1];
        }
        return null;
    }

    /**
     * Kiểm tra URL có phải product URL không
     */
    public static function isProductUrl(string $url): bool
    {
        return str_starts_with($url, self::PRODUCT_PREFIX) &&
            preg_match('/\.p\d+$/', $url) === 1;
    }

    /**
     * Kiểm tra URL có phải category URL không
     */
    public static function isCategoryUrl(string $url): bool
    {
        return str_starts_with($url, self::CATEGORY_PREFIX) &&
            preg_match('/\.c\d+$/', $url) === 1;
    }

    /**
     * Loại bỏ dấu tiếng Việt
     */
    private static function removeVietnameseAccents(string $str): string
    {
        $accents = [
            'à',
            'á',
            'ạ',
            'ả',
            'ã',
            'â',
            'ầ',
            'ấ',
            'ậ',
            'ẩ',
            'ẫ',
            'ă',
            'ằ',
            'ắ',
            'ặ',
            'ẳ',
            'ẵ',
            'è',
            'é',
            'ẹ',
            'ẻ',
            'ẽ',
            'ê',
            'ề',
            'ế',
            'ệ',
            'ể',
            'ễ',
            'ì',
            'í',
            'ị',
            'ỉ',
            'ĩ',
            'ò',
            'ó',
            'ọ',
            'ỏ',
            'õ',
            'ô',
            'ồ',
            'ố',
            'ộ',
            'ổ',
            'ỗ',
            'ơ',
            'ờ',
            'ớ',
            'ợ',
            'ở',
            'ỡ',
            'ù',
            'ú',
            'ụ',
            'ủ',
            'ũ',
            'ư',
            'ừ',
            'ứ',
            'ự',
            'ử',
            'ữ',
            'ỳ',
            'ý',
            'ỵ',
            'ỷ',
            'ỹ',
            'đ',
            'À',
            'Á',
            'Ạ',
            'Ả',
            'Ã',
            'Â',
            'Ầ',
            'Ấ',
            'Ậ',
            'Ẩ',
            'Ẫ',
            'Ă',
            'Ằ',
            'Ắ',
            'Ặ',
            'Ẳ',
            'Ẵ',
            'È',
            'É',
            'Ẹ',
            'Ẻ',
            'Ẽ',
            'Ê',
            'Ề',
            'Ế',
            'Ệ',
            'Ể',
            'Ễ',
            'Ì',
            'Í',
            'Ị',
            'Ỉ',
            'Ĩ',
            'Ò',
            'Ó',
            'Ọ',
            'Ỏ',
            'Õ',
            'Ô',
            'Ồ',
            'Ố',
            'Ộ',
            'Ổ',
            'Ỗ',
            'Ơ',
            'Ờ',
            'Ớ',
            'Ợ',
            'Ở',
            'Ỡ',
            'Ù',
            'Ú',
            'Ụ',
            'Ủ',
            'Ũ',
            'Ư',
            'Ừ',
            'Ứ',
            'Ự',
            'Ử',
            'Ữ',
            'Ỳ',
            'Ý',
            'Ỵ',
            'Ỷ',
            'Ỹ',
            'Đ'
        ];

        $noAccents = [
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'i',
            'i',
            'i',
            'i',
            'i',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'y',
            'y',
            'y',
            'y',
            'y',
            'd',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'I',
            'I',
            'I',
            'I',
            'I',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'Y',
            'Y',
            'Y',
            'Y',
            'Y',
            'D'
        ];

        return str_replace($accents, $noAccents, $str);
    }
}
