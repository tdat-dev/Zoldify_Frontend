<?php

declare(strict_types=1);

namespace App\Models;

/**
 * SearchKeyword Model
 * 
 * Theo dõi và thống kê từ khóa tìm kiếm phổ biến.
 * Dùng để gợi ý sản phẩm trending.
 * 
 * @package App\Models
 */
class SearchKeyword extends BaseModel
{
    /** @var string */
    protected $table = 'search_keywords';

    /** @var array<string> */
    protected array $fillable = [
        'keyword',
        'search_count',
    ];

    // =========================================================================
    // TRACKING
    // =========================================================================

    /**
     * Ghi nhận từ khóa tìm kiếm (tăng count hoặc tạo mới)
     * 
     * Sử dụng UPSERT pattern để tối ưu performance.
     * 
     * @param string $keyword
     * @return void
     */
    public function trackKeyword(string $keyword): void
    {
        $keyword = $this->normalizeKeyword($keyword);

        if (empty($keyword)) {
            return;
        }

        // Skip invalid keywords (containing query params or special chars)
        if (!$this->isValidKeyword($keyword)) {
            return;
        }

        // UPSERT: Insert hoặc Update nếu đã tồn tại
        $sql = "INSERT INTO {$this->table} (keyword, search_count) 
                VALUES (?, 1)
                ON DUPLICATE KEY UPDATE search_count = search_count + 1";

        $this->db->execute($sql, [$keyword]);
    }

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy top từ khóa phổ biến
     * 
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getTopKeywords(int $limit = 10): array
    {
        // Filter out invalid keywords containing query params
        $sql = "SELECT keyword, search_count 
                FROM {$this->table} 
                WHERE keyword NOT LIKE '%?%'
                  AND keyword NOT LIKE '%=%'
                  AND keyword NOT LIKE '%sort%'
                  AND keyword NOT LIKE '%condition%'
                  AND keyword NOT LIKE '%price_%'
                  AND keyword NOT LIKE '%page%'
                  AND keyword NOT LIKE '%category%'
                  AND LENGTH(keyword) >= 2
                ORDER BY search_count DESC 
                LIMIT ?";

        return $this->db->fetchAll($sql, [$limit]);
    }

    /**
     * Tìm keywords tương tự (cho autocomplete)
     * 
     * @param string $prefix
     * @param int $limit
     * @return array<int, string>
     */
    public function getSuggestions(string $prefix, int $limit = 5): array
    {
        $prefix = $this->normalizeKeyword($prefix);

        if (empty($prefix)) {
            return [];
        }

        $sql = "SELECT keyword 
                FROM {$this->table} 
                WHERE keyword LIKE ? 
                ORDER BY search_count DESC 
                LIMIT ?";

        $results = $this->db->fetchAll($sql, [$prefix . '%', $limit]);

        return array_column($results, 'keyword');
    }

    /**
     * Lấy trending keywords (tăng mạnh gần đây)
     * 
     * @param int $days Số ngày gần đây
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getTrending(int $days = 7, int $limit = 5): array
    {
        // Filter out invalid keywords containing query params
        $sql = "SELECT keyword, search_count 
                FROM {$this->table} 
                WHERE updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                  AND keyword NOT LIKE '%?%'
                  AND keyword NOT LIKE '%=%'
                  AND keyword NOT LIKE '%sort%'
                  AND keyword NOT LIKE '%condition%'
                  AND keyword NOT LIKE '%price_%'
                  AND keyword NOT LIKE '%page%'
                  AND keyword NOT LIKE '%category%'
                  AND keyword NOT LIKE '%rating%'
                  AND keyword NOT LIKE '%popular%'
                  AND keyword NOT LIKE '%best_selling%'
                  AND LENGTH(keyword) >= 2
                ORDER BY search_count DESC 
                LIMIT ?";

        return $this->db->fetchAll($sql, [$days, $limit]);
    }

    // =========================================================================
    // MAINTENANCE
    // =========================================================================

    /**
     * Xóa keywords ít phổ biến (cleanup job)
     * 
     * @param int $minCount Xóa keywords có count < minCount
     * @return int Số records đã xóa
     */
    public function cleanup(int $minCount = 2): int
    {
        $sql = "DELETE FROM {$this->table} WHERE search_count < ?";
        return $this->db->execute($sql, [$minCount]);
    }

    /**
     * Xóa keywords chứa query params (dọn dẹp dữ liệu xấu)
     * 
     * @return int Số records đã xóa
     */
    public function cleanupInvalidKeywords(): int
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE keyword LIKE '%?%'
                   OR keyword LIKE '%=%'
                   OR keyword LIKE '%sort%'
                   OR keyword LIKE '%condition%'
                   OR keyword LIKE '%price_%'
                   OR keyword LIKE '%page%'
                   OR keyword LIKE '%category%'
                   OR keyword LIKE '%rating%'
                   OR keyword LIKE '%popular%'
                   OR keyword LIKE '%best_selling%'
                   OR keyword LIKE '%newest%'";
        return $this->db->execute($sql, []);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Chuẩn hóa keyword
     * 
     * @param string $keyword
     * @return string
     */
    private function normalizeKeyword(string $keyword): string
    {
        return trim(mb_strtolower($keyword));
    }

    /**
     * Kiểm tra keyword có hợp lệ không
     * 
     * Loại bỏ keywords chứa query params hoặc ký tự đặc biệt
     * 
     * @param string $keyword
     * @return bool
     */
    private function isValidKeyword(string $keyword): bool
    {
        // Keyword quá ngắn
        if (mb_strlen($keyword) < 2) {
            return false;
        }

        // Keyword chứa các ký tự query string
        $invalidPatterns = [
            '?',
            '=',
            '&',
            'sort=',
            'condition=',
            'price_min',
            'price_max',
            'page=',
            'category=',
            'rating=',
            'popular',
            'best_selling',
            'newest',
            'price_asc',
            'price_desc',
        ];

        foreach ($invalidPatterns as $pattern) {
            if (strpos($keyword, $pattern) !== false) {
                return false;
            }
        }

        return true;
    }
}