<?php

declare(strict_types=1);

namespace App\Helpers;

class ImageHelper
{
    /**
     * Get image URL with cache busting version
     * 
     * @param string|null $path Relative path to image in public folder (e.g., 'uploads/products/abc.jpg')
     * @return string Absolute URL with version param
     */
    public static function url(?string $path): string
    {
        if (empty($path)) {
            return '/images/default_product.png'; // Fallback image
        }

        // Clean path (remove leading slashes)
        $cleanPath = ltrim($path, '/');

        // Check if file exists to get modification time
        $absolutePath = __DIR__ . '/../../public/' . $cleanPath;

        // If path starts with uploads/, we check directly
        if (!file_exists($absolutePath) && strpos($cleanPath, 'uploads/') === false) {
            // Try adding uploads/ prefix if not present (legacy support)
            $result = self::url('uploads/' . $cleanPath);
            // If recursive call returns default, return original path as fallback
            if ($result === '/images/default_product.png') {
                return '/' . $cleanPath;
            }
            return $result;
        }

        if (file_exists($absolutePath)) {
            $version = filemtime($absolutePath);
            return '/' . $cleanPath . '?v=' . $version;
        }

        // Return original path if file not found (browser might create 404)
        return '/' . $cleanPath;
    }
}
