<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Transaction Model
 * 
 * Quản lý giao dịch tài chính của users (deposit, withdraw, payment).
 * Tự động cập nhật balance khi transaction completed.
 * 
 * @package App\Models
 */
class Transaction extends BaseModel
{
    /** @var string */
    protected $table = 'transactions';

    /** @var array<string> */
    protected array $fillable = [
        'user_id',
        'type',
        'amount',
        'description',
        'status',
        'reference_id',
    ];

    /** @var array<string> Transaction types */
    public const TYPE_DEPOSIT = 'deposit';
    public const TYPE_WITHDRAW = 'withdraw';
    public const TYPE_PAYMENT = 'payment';
    public const TYPE_REFUND = 'refund';
    public const TYPE_EARNING = 'earning';

    /** @var array<string> Transaction statuses */
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy transactions của user
     * 
     * @param int $userId
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$userId, $limit, $offset]);
    }

    /**
     * Lấy transactions theo type
     * 
     * @param int $userId
     * @param string $type
     * @return array<int, array<string, mixed>>
     */
    public function getByType(int $userId, string $type): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? AND type = ? 
                ORDER BY created_at DESC";

        return $this->db->fetchAll($sql, [$userId, $type]);
    }

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Tạo transaction với auto-update balance
     * 
     * Sử dụng DB transaction để đảm bảo tính toàn vẹn dữ liệu.
     * 
     * @param array{
     *     user_id: int,
     *     type: string,
     *     amount: float,
     *     description?: string,
     *     status?: string,
     *     reference_id?: int
     * } $data
     * @return int|false Transaction ID hoặc false nếu thất bại
     */
    public function createWithBalanceUpdate(array $data): int|false
    {
        try {
            $this->db->beginTransaction();

            $status = $data['status'] ?? self::STATUS_COMPLETED;

            // 1. Insert transaction
            $sql = "INSERT INTO {$this->table} (user_id, type, amount, description, status, reference_id) 
                    VALUES (?, ?, ?, ?, ?, ?)";

            $transactionId = $this->db->insert($sql, [
                $data['user_id'],
                $data['type'],
                $data['amount'],
                $data['description'] ?? '',
                $status,
                $data['reference_id'] ?? null,
            ]);

            // 2. Update balance nếu completed
            if ($status === self::STATUS_COMPLETED) {
                $adjust = $this->calculateBalanceAdjustment($data['type'], (float) $data['amount']);

                $this->db->execute(
                    "UPDATE users SET balance = balance + ? WHERE id = ?",
                    [$adjust, $data['user_id']]
                );
            }

            $this->db->commit();
            return $transactionId;

        } catch (\Exception $e) {
            $this->db->rollback();
            return false;
        }
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Tổng hợp giao dịch của user
     * 
     * @param int $userId
     * @return array{total_deposit: float, total_withdraw: float, total_earning: float}
     */
    public function getUserStats(int $userId): array
    {
        $sql = "SELECT 
                    type,
                    COALESCE(SUM(amount), 0) AS total
                FROM {$this->table}
                WHERE user_id = ? AND status = ?
                GROUP BY type";

        $results = $this->db->fetchAll($sql, [$userId, self::STATUS_COMPLETED]);

        $stats = [
            'total_deposit' => 0.0,
            'total_withdraw' => 0.0,
            'total_earning' => 0.0,
            'total_payment' => 0.0,
        ];

        foreach ($results as $row) {
            $key = 'total_' . $row['type'];
            if (isset($stats[$key])) {
                $stats[$key] = (float) $row['total'];
            }
        }

        return $stats;
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Tính số tiền cần điều chỉnh balance
     * 
     * @param string $type
     * @param float $amount
     * @return float Số dương (tăng) hoặc âm (giảm)
     */
    private function calculateBalanceAdjustment(string $type, float $amount): float
    {
        return match ($type) {
            self::TYPE_DEPOSIT, self::TYPE_REFUND, self::TYPE_EARNING => $amount,
            self::TYPE_WITHDRAW, self::TYPE_PAYMENT => -$amount,
            default => 0.0,
        };
    }
}
