<?php

declare(strict_types=1);

namespace App\Models;

/**
 * EscrowHold Model
 * 
 * Quản lý tiền đang được giữ (escrow) trong giao dịch.
 * Mỗi order tương ứng với 1 escrow hold.
 * 
 * Lifecycle: holding → released | refunded | disputed
 * 
 * @package App\Models
 */
class EscrowHold extends BaseModel
{
    /** @var string */
    protected $table = 'escrow_holds';

    /** @var array<string> */
    protected array $fillable = [
        'order_id',
        'seller_id',
        'amount',
        'platform_fee',
        'seller_amount',
        'status',
        'release_scheduled_at',
    ];

    /** @var array<string> Escrow statuses */
    public const STATUS_HOLDING = 'holding';
    public const STATUS_RELEASED = 'released';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_DISPUTED = 'disputed';

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Tìm theo order ID
     * 
     * @param int $orderId
     * @return array<string, mixed>|null
     */
    public function findByOrderId(int $orderId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE order_id = ?";
        return $this->db->fetchOne($sql, [$orderId]) ?: null;
    }

    /**
     * Lấy escrow đã đến hạn giải ngân
     * 
     * Điều kiện:
     * - status = 'holding'
     * - release_scheduled_at <= NOW()
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getReleasable(): array
    {
        $sql = "SELECT eh.*, 
                    o.total_amount AS order_total, 
                    u.full_name AS seller_name,
                    u.email AS seller_email
                FROM {$this->table} eh
                JOIN orders o ON eh.order_id = o.id
                JOIN users u ON eh.seller_id = u.id
                WHERE eh.status = ?
                AND eh.release_scheduled_at IS NOT NULL
                AND eh.release_scheduled_at <= NOW()
                ORDER BY eh.release_scheduled_at ASC";

        return $this->db->fetchAll($sql, [self::STATUS_HOLDING]);
    }

    /**
     * Lấy escrow theo seller ID
     * 
     * @param int $sellerId
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getBySellerId(int $sellerId, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT eh.*, o.total_amount AS order_total
                FROM {$this->table} eh
                JOIN orders o ON eh.order_id = o.id
                WHERE eh.seller_id = ?
                ORDER BY eh.held_at DESC
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$sellerId, $limit, $offset]);
    }

    /**
     * Lấy tất cả escrow (cho admin)
     * 
     * @param int $limit
     * @param int $offset
     * @param string|null $status Filter theo status
     * @return array<int, array<string, mixed>>
     */
    public function getAllWithDetails(int $limit = 50, int $offset = 0, ?string $status = null): array
    {
        $sql = "SELECT eh.*, 
                    o.total_amount AS order_total, 
                    u.full_name AS seller_name, 
                    u.email AS seller_email
                FROM {$this->table} eh
                JOIN orders o ON eh.order_id = o.id
                JOIN users u ON eh.seller_id = u.id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE eh.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY eh.held_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Lấy escrow đang tranh chấp
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getDisputed(): array
    {
        $sql = "SELECT eh.*, 
                    o.total_amount AS order_total,
                    seller.full_name AS seller_name,
                    seller.email AS seller_email,
                    buyer.full_name AS buyer_name,
                    buyer.email AS buyer_email
                FROM {$this->table} eh
                JOIN orders o ON eh.order_id = o.id
                JOIN users seller ON eh.seller_id = seller.id
                JOIN users buyer ON o.buyer_id = buyer.id
                WHERE eh.status = ?
                ORDER BY eh.held_at ASC";

        return $this->db->fetchAll($sql, [self::STATUS_DISPUTED]);
    }

    // =========================================================================
    // STATUS UPDATES
    // =========================================================================

    /**
     * Đánh dấu đã giải ngân
     * 
     * @param int $id
     * @return bool
     */
    public function markReleased(int $id): bool
    {
        return $this->updateStatus($id, self::STATUS_RELEASED);
    }

    /**
     * Đánh dấu đã hoàn tiền
     * 
     * @param int $id
     * @return bool
     */
    public function markRefunded(int $id): bool
    {
        return $this->updateStatus($id, self::STATUS_REFUNDED);
    }

    /**
     * Đánh dấu tranh chấp
     * 
     * @param int $id
     * @return bool
     */
    public function markDisputed(int $id): bool
    {
        return $this->updateStatus($id, self::STATUS_DISPUTED);
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
        $field = match ($status) {
            self::STATUS_RELEASED => 'released_at',
            self::STATUS_REFUNDED => 'refunded_at',
            default => null,
        };

        if ($field !== null) {
            $sql = "UPDATE {$this->table} SET status = ?, {$field} = NOW() WHERE id = ?";
        } else {
            $sql = "UPDATE {$this->table} SET status = ? WHERE id = ?";
        }

        return $this->db->execute($sql, [$status, $id]) !== false;
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Thống kê escrow theo status
     * 
     * @return array<string, array{count: int, total_amount: float, total_seller_amount: float, total_platform_fee: float}>
     */
    public function getStats(): array
    {
        $sql = "SELECT 
                    status,
                    COUNT(*) AS count,
                    COALESCE(SUM(amount), 0) AS total_amount,
                    COALESCE(SUM(seller_amount), 0) AS total_seller_amount,
                    COALESCE(SUM(platform_fee), 0) AS total_platform_fee
                FROM {$this->table}
                GROUP BY status";

        $results = $this->db->fetchAll($sql);

        $stats = [];
        foreach ($results as $row) {
            $stats[$row['status']] = [
                'count' => (int) $row['count'],
                'total_amount' => (float) $row['total_amount'],
                'total_seller_amount' => (float) $row['total_seller_amount'],
                'total_platform_fee' => (float) $row['total_platform_fee'],
            ];
        }

        return $stats;
    }

    /**
     * Tổng tiền đang holding
     * 
     * @return float
     */
    public function getTotalHolding(): float
    {
        $sql = "SELECT COALESCE(SUM(amount), 0) AS total FROM {$this->table} WHERE status = ?";
        $result = $this->db->fetchOne($sql, [self::STATUS_HOLDING]);

        return (float) ($result['total'] ?? 0);
    }

    /**
     * Tổng tiền của seller đang pending
     * 
     * @param int $sellerId
     * @return float
     */
    public function getSellerPendingAmount(int $sellerId): float
    {
        $sql = "SELECT COALESCE(SUM(seller_amount), 0) AS total 
                FROM {$this->table} 
                WHERE seller_id = ? AND status = ?";

        $result = $this->db->fetchOne($sql, [$sellerId, self::STATUS_HOLDING]);
        return (float) ($result['total'] ?? 0);
    }
}
