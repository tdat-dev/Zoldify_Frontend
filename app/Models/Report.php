<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Report Model
 * 
 * Quản lý báo cáo vi phạm sản phẩm.
 * 
 * @package App\Models
 */
class Report extends BaseModel
{
    /** @var string */
    protected $table = 'reports';

    /** @var array<string> */
    protected array $fillable = [
        'product_id',
        'reporter_id',
        'reason',
        'description',
        'status',
    ];

    /** @var array<string> Report statuses */
    public const STATUS_PENDING = 'pending';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_REJECTED = 'rejected';

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy tất cả reports với thông tin product
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getAllWithProduct(): array
    {
        $sql = "SELECT r.*, p.name AS product_name, p.image AS product_image
                FROM {$this->table} r
                JOIN products p ON r.product_id = p.id
                ORDER BY r.created_at DESC";

        return $this->db->fetchAll($sql);
    }

    /**
     * Lấy chi tiết report theo ID với đầy đủ thông tin
     * 
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function findWithDetails(int $id): ?array
    {
        $sql = "SELECT r.*, 
                    p.name AS product_name, 
                    p.description AS product_description,
                    p.price AS product_price,
                    p.image AS product_image,
                    p.status AS product_status,
                    p.product_condition,
                    p.quantity AS product_quantity,
                    seller.full_name AS seller_name,
                    seller.email AS seller_email,
                    reporter.full_name AS reporter_name,
                    reporter.email AS reporter_email,
                    c.name AS category_name
                FROM {$this->table} r
                JOIN products p ON r.product_id = p.id
                LEFT JOIN users seller ON p.user_id = seller.id
                LEFT JOIN users reporter ON r.reporter_id = reporter.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE r.id = ?";

        return $this->db->fetchOne($sql, [$id]) ?: null;
    }

    /**
     * Lấy reports theo status
     * 
     * @param string $status
     * @return array<int, array<string, mixed>>
     */
    public function getByStatus(string $status): array
    {
        $sql = "SELECT r.*, p.name AS product_name
                FROM {$this->table} r
                JOIN products p ON r.product_id = p.id
                WHERE r.status = ?
                ORDER BY r.created_at DESC";

        return $this->db->fetchAll($sql, [$status]);
    }

    // =========================================================================
    // STATUS UPDATES
    // =========================================================================

    /**
     * Đánh dấu đã xử lý
     * 
     * @param int $id
     * @return bool
     */
    public function markResolved(int $id): bool
    {
        return $this->updateStatus($id, self::STATUS_RESOLVED);
    }

    /**
     * Đánh dấu từ chối
     * 
     * @param int $id
     * @return bool
     */
    public function markRejected(int $id): bool
    {
        return $this->updateStatus($id, self::STATUS_REJECTED);
    }

    /**
     * Cập nhật status
     * 
     * @param int $id
     * @param string $status
     * @return bool
     */
    private function updateStatus(int $id, string $status): bool
    {
        $sql = "UPDATE {$this->table} SET status = ?, resolved_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$status, $id]) !== false;
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Đếm reports theo status
     * 
     * @return array<string, int>
     */
    public function countByStatus(): array
    {
        $sql = "SELECT status, COUNT(*) as total FROM {$this->table} GROUP BY status";
        $results = $this->db->fetchAll($sql);

        $counts = [
            self::STATUS_PENDING => 0,
            self::STATUS_RESOLVED => 0,
            self::STATUS_REJECTED => 0,
        ];

        foreach ($results as $row) {
            $counts[$row['status']] = (int) $row['total'];
        }

        return $counts;
    }
}
