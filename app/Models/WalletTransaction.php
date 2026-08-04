<?php

declare(strict_types=1);

namespace App\Models;

/**
 * WalletTransaction Model
 * 
 * Lưu lịch sử giao dịch ví của sellers.
 * Mỗi thay đổi số dư = 1 record (audit trail).
 * 
 * @package App\Models
 */
class WalletTransaction extends BaseModel
{
    /** @var string */
    protected $table = 'wallet_transactions';

    /** @var array<string> */
    protected array $fillable = [
        'wallet_id',
        'order_id',
        'transaction_type',
        'amount',
        'balance_before',
        'balance_after',
        'description',
        'reference_id',
        'status',
    ];

    /** @var array<string> Transaction types */
    public const TYPE_EARNING = 'earning';
    public const TYPE_WITHDRAWAL = 'withdrawal';
    public const TYPE_REFUND = 'refund';
    public const TYPE_ADJUSTMENT = 'adjustment';

    /** @var array<string> Transaction statuses */
    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy transactions theo wallet ID
     * 
     * @param int $walletId
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getByWalletId(int $walletId, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE wallet_id = ? 
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$walletId, $limit, $offset]);
    }

    /**
     * Lấy pending withdrawals (chờ admin approve)
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getPendingWithdrawals(): array
    {
        $sql = "SELECT wt.*, 
                    w.user_id, 
                    w.bank_name, 
                    w.bank_account_number, 
                    w.bank_account_name,
                    w.balance AS wallet_balance,
                    u.full_name, 
                    u.email
                FROM {$this->table} wt
                JOIN wallets w ON wt.wallet_id = w.id
                JOIN users u ON w.user_id = u.id
                WHERE wt.transaction_type = ? AND wt.status = ?
                ORDER BY wt.created_at ASC";

        return $this->db->fetchAll($sql, [self::TYPE_WITHDRAWAL, self::STATUS_PENDING]);
    }

    /**
     * Lấy transactions theo type
     * 
     * @param int $walletId
     * @param string $type
     * @return array<int, array<string, mixed>>
     */
    public function getByType(int $walletId, string $type): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE wallet_id = ? AND transaction_type = ? 
                ORDER BY created_at DESC";

        return $this->db->fetchAll($sql, [$walletId, $type]);
    }

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Tạo transaction mới với đầy đủ thông tin
     * 
     * @param array{
     *     wallet_id: int,
     *     transaction_type: string,
     *     amount: float,
     *     balance_before: float,
     *     balance_after: float,
     *     order_id?: int,
     *     description?: string,
     *     reference_id?: string,
     *     status?: string
     * } $data
     * @return int Transaction ID
     */
    public function createTransaction(array $data): int
    {
        $sql = "INSERT INTO {$this->table} 
                (wallet_id, order_id, transaction_type, amount, balance_before, 
                 balance_after, description, reference_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        return $this->db->insert($sql, [
            $data['wallet_id'],
            $data['order_id'] ?? null,
            $data['transaction_type'],
            $data['amount'],
            $data['balance_before'],
            $data['balance_after'],
            $data['description'] ?? null,
            $data['reference_id'] ?? null,
            $data['status'] ?? self::STATUS_COMPLETED,
        ]);
    }

    // =========================================================================
    // STATUS UPDATES
    // =========================================================================

    /**
     * Approve withdrawal (admin action)
     * 
     * @param int $transactionId
     * @param string|null $referenceId Bank transfer reference
     * @return bool
     */
    public function approveWithdrawal(int $transactionId, ?string $referenceId = null): bool
    {
        $transaction = $this->find($transactionId);
        if (!$transaction || $transaction['status'] !== self::STATUS_PENDING) {
            return false;
        }

        // Update wallet total_withdrawn
        $walletModel = new Wallet();
        $walletModel->recordWithdrawal((int) $transaction['wallet_id'], (float) $transaction['amount']);

        return $this->updateStatus($transactionId, self::STATUS_COMPLETED, $referenceId);
    }

    /**
     * Reject withdrawal và hoàn tiền
     * 
     * @param int $transactionId
     * @param string|null $reason
     * @return bool
     */
    public function rejectWithdrawal(int $transactionId, ?string $reason = null): bool
    {
        $transaction = $this->find($transactionId);
        if (!$transaction || $transaction['transaction_type'] !== self::TYPE_WITHDRAWAL) {
            return false;
        }

        // Cộng lại tiền vào ví
        $walletModel = new Wallet();
        $walletModel->addBalance((int) $transaction['wallet_id'], (float) $transaction['amount']);

        // Update status
        $this->updateStatus($transactionId, self::STATUS_FAILED, $reason);

        return true;
    }

    /**
     * Cập nhật status
     * 
     * @param int $id
     * @param string $status
     * @param string|null $referenceId
     * @return bool
     */
    public function updateStatus(int $id, string $status, ?string $referenceId = null): bool
    {
        $sql = "UPDATE {$this->table} SET status = ?";
        $params = [$status];

        if ($referenceId !== null) {
            $sql .= ", reference_id = ?";
            $params[] = $referenceId;
        }

        $sql .= " WHERE id = ?";
        $params[] = $id;

        return $this->db->execute($sql, $params) !== false;
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Thống kê theo transaction_type
     * 
     * @param int $walletId
     * @return array<string, array{count: int, total_amount: float}>
     */
    public function getStatsByType(int $walletId): array
    {
        $sql = "SELECT transaction_type, 
                    COUNT(*) AS count,
                    COALESCE(SUM(amount), 0) AS total_amount
                FROM {$this->table}
                WHERE wallet_id = ? AND status = ?
                GROUP BY transaction_type";

        $results = $this->db->fetchAll($sql, [$walletId, self::STATUS_COMPLETED]);

        $stats = [];
        foreach ($results as $row) {
            $stats[$row['transaction_type']] = [
                'count' => (int) $row['count'],
                'total_amount' => (float) $row['total_amount'],
            ];
        }

        return $stats;
    }
}
