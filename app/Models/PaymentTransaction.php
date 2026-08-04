<?php

declare(strict_types=1);

namespace App\Models;

/**
 * PaymentTransaction Model
 * 
 * Lưu lịch sử tất cả giao dịch thanh toán từ PayOS.
 * 
 * @package App\Models
 */
class PaymentTransaction extends BaseModel
{
    /** @var string */
    protected $table = 'payment_transactions';

    /** @var array<string> */
    protected array $fillable = [
        'order_id',
        'transaction_type',
        'amount',
        'payment_link_id',
        'payos_transaction_id',
        'payos_reference',
        'payos_order_code',
        'status',
        'metadata',
    ];

    /** @var array<string> Transaction types */
    public const TYPE_PAYMENT = 'payment';
    public const TYPE_REFUND = 'refund';

    /** @var array<string> Transaction statuses */
    public const STATUS_PENDING = 'pending';
    public const STATUS_SUCCESS = 'success';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EXPIRED = 'expired';

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy transactions theo order ID
     * 
     * @param int $orderId
     * @return array<int, array<string, mixed>>
     */
    public function getByOrderId(int $orderId): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE order_id = ? ORDER BY created_at DESC";
        return $this->db->fetchAll($sql, [$orderId]);
    }

    /**
     * Lấy transaction mới nhất của order
     * 
     * @param int $orderId
     * @return array<string, mixed>|null
     */
    public function getLatestByOrderId(int $orderId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE order_id = ? ORDER BY created_at DESC LIMIT 1";
        return $this->db->fetchOne($sql, [$orderId]) ?: null;
    }

    /**
     * Tìm theo payment_link_id
     * 
     * @param string $paymentLinkId
     * @return array<string, mixed>|null
     */
    public function findByPaymentLinkId(string $paymentLinkId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE payment_link_id = ? ORDER BY created_at DESC LIMIT 1";
        return $this->db->fetchOne($sql, [$paymentLinkId]) ?: null;
    }

    /**
     * Tìm theo payos_order_code
     * 
     * @param int $orderCode
     * @return array<string, mixed>|null
     */
    public function findByPayosOrderCode(int $orderCode): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE payos_order_code = ? ORDER BY created_at DESC LIMIT 1";
        return $this->db->fetchOne($sql, [$orderCode]) ?: null;
    }

    /**
     * Lấy tất cả transactions (cho admin)
     * 
     * @param int $limit
     * @param int $offset
     * @param string|null $status
     * @return array<int, array<string, mixed>>
     */
    public function getAllWithDetails(int $limit = 50, int $offset = 0, ?string $status = null): array
    {
        $sql = "SELECT pt.*, 
                    o.total_amount AS order_total,
                    o.buyer_id,
                    u.full_name AS buyer_name,
                    u.email AS buyer_email
                FROM {$this->table} pt
                LEFT JOIN orders o ON pt.order_id = o.id
                LEFT JOIN users u ON o.buyer_id = u.id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE pt.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY pt.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->fetchAll($sql, $params);
    }

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Tạo payment transaction mới
     * 
     * @param array{
     *     order_id: int,
     *     transaction_type: string,
     *     amount: float,
     *     payment_link_id?: string,
     *     payos_order_code?: int,
     *     status?: string,
     *     metadata?: string
     * } $data
     * @return int Transaction ID
     */
    public function createTransaction(array $data): int
    {
        $sql = "INSERT INTO {$this->table} 
                (order_id, transaction_type, amount, payment_link_id, payos_transaction_id, 
                 payos_reference, payos_order_code, status, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        return $this->db->insert($sql, [
            $data['order_id'],
            $data['transaction_type'],
            $data['amount'],
            $data['payment_link_id'] ?? null,
            $data['payos_transaction_id'] ?? null,
            $data['payos_reference'] ?? null,
            $data['payos_order_code'] ?? null,
            $data['status'] ?? self::STATUS_PENDING,
            $data['metadata'] ?? null,
        ]);
    }

    // =========================================================================
    // STATUS UPDATES
    // =========================================================================

    /**
     * Cập nhật status
     * 
     * @param int $id
     * @param string $status
     * @param array<string, mixed>|null $additionalData
     * @return bool
     */
    public function updateStatus(int $id, string $status, ?array $additionalData = null): bool
    {
        $sql = "UPDATE {$this->table} SET status = ?";
        $params = [$status];

        if ($additionalData !== null) {
            if (isset($additionalData['metadata'])) {
                $sql .= ", metadata = ?";
                $params[] = is_string($additionalData['metadata'])
                    ? $additionalData['metadata']
                    : json_encode($additionalData['metadata']);
            }
            if (isset($additionalData['payos_transaction_id'])) {
                $sql .= ", payos_transaction_id = ?";
                $params[] = $additionalData['payos_transaction_id'];
            }
            if (isset($additionalData['payos_reference'])) {
                $sql .= ", payos_reference = ?";
                $params[] = $additionalData['payos_reference'];
            }
        }

        $sql .= " WHERE id = ?";
        $params[] = $id;

        return $this->db->execute($sql, $params) !== false;
    }

    /**
     * Mark as success with PayOS data
     * 
     * @param int $id
     * @param string $payosTransactionId
     * @param string|null $payosReference
     * @return bool
     */
    public function markSuccess(int $id, string $payosTransactionId, ?string $payosReference = null): bool
    {
        return $this->updateStatus($id, self::STATUS_SUCCESS, [
            'payos_transaction_id' => $payosTransactionId,
            'payos_reference' => $payosReference,
        ]);
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Thống kê theo transaction_type
     * 
     * @return array<string, array{count: int, total_amount: float}>
     */
    public function getStatsByType(): array
    {
        $sql = "SELECT transaction_type, 
                    COUNT(*) AS count,
                    COALESCE(SUM(amount), 0) AS total_amount
                FROM {$this->table}
                WHERE status = ?
                GROUP BY transaction_type";

        $results = $this->db->fetchAll($sql, [self::STATUS_SUCCESS]);

        $stats = [];
        foreach ($results as $row) {
            $stats[$row['transaction_type']] = [
                'count' => (int) $row['count'],
                'total_amount' => (float) $row['total_amount'],
            ];
        }

        return $stats;
    }

    /**
     * Thống kê theo status
     * 
     * @return array<string, int>
     */
    public function getStatsByStatus(): array
    {
        $sql = "SELECT status, COUNT(*) AS count FROM {$this->table} GROUP BY status";
        $results = $this->db->fetchAll($sql);

        $stats = [];
        foreach ($results as $row) {
            $stats[$row['status']] = (int) $row['count'];
        }

        return $stats;
    }

    /**
     * Tổng doanh thu (successful payments)
     * 
     * @return float
     */
    public function getTotalRevenue(): float
    {
        $sql = "SELECT COALESCE(SUM(amount), 0) AS total 
                FROM {$this->table} 
                WHERE transaction_type = ? AND status = ?";

        $result = $this->db->fetchOne($sql, [self::TYPE_PAYMENT, self::STATUS_SUCCESS]);
        return (float) ($result['total'] ?? 0);
    }
}
