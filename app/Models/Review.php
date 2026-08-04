<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Review Model
 * 
 * Quản lý đánh giá sản phẩm từ buyers.
 * 
 * @package App\Models
 */
class Review extends BaseModel
{
    /** @var string */
    protected $table = 'reviews';

    /** @var array<string> */
    protected array $fillable = [
        'reviewer_id',
        'product_id',
        'rating',
        'comment',
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy reviews của một user (các review mà user đã viết)
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId): array
    {
        $sql = "SELECT r.*, 
                    p.name AS product_name, 
                    p.image AS product_image,
                    p.user_id AS seller_id
                FROM {$this->table} r 
                JOIN products p ON r.product_id = p.id 
                WHERE r.reviewer_id = ?
                ORDER BY r.created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Lấy reviews của một sản phẩm
     * 
     * @param int $productId
     * @return array<int, array<string, mixed>>
     */
    public function getByProductId(int $productId): array
    {
        $sql = "SELECT r.*, 
                    u.full_name AS reviewer_name, 
                    u.avatar AS reviewer_avatar
                FROM {$this->table} r 
                JOIN users u ON r.reviewer_id = u.id 
                WHERE r.product_id = ?
                ORDER BY r.created_at DESC";

        return $this->db->fetchAll($sql, [$productId]);
    }

    /**
     * Kiểm tra user đã review sản phẩm này chưa
     * 
     * @param int $userId
     * @param int $productId
     * @return bool
     */
    public function hasReviewed(int $userId, int $productId): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE reviewer_id = ? AND product_id = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$userId, $productId]) !== null;
    }

    /**
     * Lấy review của user cho một sản phẩm cụ thể
     * 
     * @param int $userId
     * @param int $productId
     * @return array<string, mixed>|null
     */
    public function getByUserAndProduct(int $userId, int $productId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE reviewer_id = ? AND product_id = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$userId, $productId]);
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Lấy thống kê review của seller
     * 
     * @param int $sellerId
     * @return array{review_count: int, avg_rating: float}
     */
    public function getSellerStats(int $sellerId): array
    {
        $sql = "SELECT 
                    COUNT(r.id) AS review_count, 
                    COALESCE(AVG(r.rating), 0) AS avg_rating 
                FROM {$this->table} r 
                JOIN products p ON r.product_id = p.id 
                WHERE p.user_id = ?";

        $result = $this->db->fetchOne($sql, [$sellerId]);

        return [
            'review_count' => (int) ($result['review_count'] ?? 0),
            'avg_rating' => round((float) ($result['avg_rating'] ?? 0), 1),
        ];
    }

    /**
     * Lấy thống kê review của sản phẩm
     * 
     * @param int $productId
     * @return array{review_count: int, avg_rating: float}
     */
    public function getProductStats(int $productId): array
    {
        $sql = "SELECT 
                    COUNT(*) AS review_count, 
                    COALESCE(AVG(rating), 0) AS avg_rating 
                FROM {$this->table} 
                WHERE product_id = ?";

        $result = $this->db->fetchOne($sql, [$productId]);

        return [
            'review_count' => (int) ($result['review_count'] ?? 0),
            'avg_rating' => round((float) ($result['avg_rating'] ?? 0), 1),
        ];
    }

    /**
     * Phân bố rating (1-5 sao) cho sản phẩm
     * 
     * @param int $productId
     * @return array<int, int> [1 => count, 2 => count, ...]
     */
    public function getRatingDistribution(int $productId): array
    {
        $sql = "SELECT rating, COUNT(*) AS total 
                FROM {$this->table} 
                WHERE product_id = ? 
                GROUP BY rating";

        $results = $this->db->fetchAll($sql, [$productId]);

        $distribution = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
        foreach ($results as $row) {
            $rating = (int) $row['rating'];
            if (isset($distribution[$rating])) {
                $distribution[$rating] = (int) $row['total'];
            }
        }

        return $distribution;
    }

    // =========================================================================
    // ADMIN METHODS
    // =========================================================================

    /**
     * Lấy tất cả reviews cho admin panel
     * 
     * @param int $limit
     * @param int $offset
     * @param int|null $rating Filter theo rating
     * @return array<int, array<string, mixed>>
     */
    public function getAllForAdmin(int $limit = 20, int $offset = 0, ?int $rating = null): array
    {
        $sql = "SELECT r.*, 
                    p.name AS product_name, 
                    p.image AS product_image,
                    u.full_name AS reviewer_name,
                    u.avatar AS reviewer_avatar
                FROM {$this->table} r 
                JOIN products p ON r.product_id = p.id 
                JOIN users u ON r.reviewer_id = u.id";

        $params = [];

        if ($rating !== null) {
            $sql .= " WHERE r.rating = ?";
            $params[] = $rating;
        }

        $sql .= " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Đếm số review của user
     * 
     * @param int $userId
     * @return int
     */
    public function countByUserId(int $userId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE reviewer_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Thống kê theo rating cho admin
     * 
     * @return array<int, array{rating: int, count: int}>
     */
    public function getRatingStats(): array
    {
        $sql = "SELECT rating, COUNT(*) AS count 
                FROM {$this->table} 
                GROUP BY rating 
                ORDER BY rating DESC";

        return $this->db->fetchAll($sql);
    }
}
