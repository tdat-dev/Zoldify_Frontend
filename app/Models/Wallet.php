<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Wallet Model
 * 
 * Quản lý ví tiền của sellers.
 * Mỗi user có 1 ví duy nhất (lazy creation).
 * 
 * @package App\Models
 */
class Wallet extends BaseModel
{
    /** @var string */
    protected $table = 'wallets';

    /** @var array<string> */
    protected array $fillable = [
        'user_id',
        'balance',
        'pending_balance',
        'total_earned',
        'total_withdrawn',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy hoặc tạo ví cho user (lazy creation pattern)
     * 
     * @param int $userId
     * @return array<string, mixed>
     */
    public function getOrCreate(int $userId): array
    {
        $wallet = $this->findByUserId($userId);

        if ($wallet === null) {
            $id = $this->createWallet($userId);
            $wallet = $this->find($id);
        }

        return $wallet;
    }

    /**
     * Tìm ví theo user ID
     * 
     * @param int $userId
     * @return array<string, mixed>|null
     */
    public function findByUserId(int $userId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        return $this->db->fetchOne($sql, [$userId]) ?: null;
    }

    /**
     * Lấy tất cả ví có số dư > 0 (cho admin)
     * 
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getAllWithBalance(int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT w.*, u.full_name, u.email, u.avatar
                FROM {$this->table} w
                JOIN users u ON w.user_id = u.id
                WHERE w.balance > 0 OR w.pending_balance > 0
                ORDER BY w.balance DESC
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$limit, $offset]);
    }

    // =========================================================================
    // BALANCE OPERATIONS
    // =========================================================================

    /**
     * Thêm tiền vào available balance
     * 
     * @param int $walletId
     * @param float $amount
     * @return bool
     */
    public function addBalance(int $walletId, float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $sql = "UPDATE {$this->table} 
                SET balance = balance + ?, total_earned = total_earned + ? 
                WHERE id = ?";

        return $this->db->execute($sql, [$amount, $amount, $walletId]) !== false;
    }

    /**
     * Trừ tiền từ available balance
     * 
     * @param int $walletId
     * @param float $amount
     * @return bool
     */
    public function deductBalance(int $walletId, float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        // Sử dụng GREATEST để tránh balance âm
        $sql = "UPDATE {$this->table} 
                SET balance = GREATEST(0, balance - ?) 
                WHERE id = ? AND balance >= ?";

        return $this->db->execute($sql, [$amount, $walletId, $amount]) > 0;
    }

    /**
     * Thêm tiền vào pending balance
     * 
     * @param int $walletId
     * @param float $amount
     * @return bool
     */
    public function addPendingBalance(int $walletId, float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET pending_balance = pending_balance + ? WHERE id = ?";
        return $this->db->execute($sql, [$amount, $walletId]) !== false;
    }

    /**
     * Chuyển tiền từ pending sang available (khi escrow release)
     * 
     * @param int $walletId
     * @param float $amount
     * @return bool
     */
    public function releasePending(int $walletId, float $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }

        $sql = "UPDATE {$this->table} 
                SET pending_balance = GREATEST(0, pending_balance - ?),
                    balance = balance + ?
                WHERE id = ?";

        return $this->db->execute($sql, [$amount, $amount, $walletId]) !== false;
    }

    /**
     * Ghi nhận rút tiền
     * 
     * @param int $walletId
     * @param float $amount
     * @return bool
     */
    public function recordWithdrawal(int $walletId, float $amount): bool
    {
        $sql = "UPDATE {$this->table} 
                SET total_withdrawn = total_withdrawn + ? 
                WHERE id = ?";

        return $this->db->execute($sql, [$amount, $walletId]) !== false;
    }

    // =========================================================================
    // BANK INFO
    // =========================================================================

    /**
     * Cập nhật thông tin ngân hàng
     * 
     * @param int $walletId
     * @param string $bankName
     * @param string $accountNumber
     * @param string $accountName
     * @return bool
     */
    public function updateBankInfo(int $walletId, string $bankName, string $accountNumber, string $accountName): bool
    {
        $sql = "UPDATE {$this->table} 
                SET bank_name = ?, bank_account_number = ?, bank_account_name = ? 
                WHERE id = ?";

        return $this->db->execute($sql, [$bankName, $accountNumber, $accountName, $walletId]) !== false;
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Tổng tiền đang trong hệ thống
     * 
     * @return array{total_balance: float, total_pending: float, total_earned: float, total_withdrawn: float}
     */
    public function getSystemStats(): array
    {
        $sql = "SELECT 
                    COALESCE(SUM(balance), 0) AS total_balance,
                    COALESCE(SUM(pending_balance), 0) AS total_pending,
                    COALESCE(SUM(total_earned), 0) AS total_earned,
                    COALESCE(SUM(total_withdrawn), 0) AS total_withdrawn
                FROM {$this->table}";

        $result = $this->db->fetchOne($sql);

        return [
            'total_balance' => (float) ($result['total_balance'] ?? 0),
            'total_pending' => (float) ($result['total_pending'] ?? 0),
            'total_earned' => (float) ($result['total_earned'] ?? 0),
            'total_withdrawn' => (float) ($result['total_withdrawn'] ?? 0),
        ];
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Tạo ví mới
     * 
     * @param int $userId
     * @return int Wallet ID
     */
    private function createWallet(int $userId): int
    {
        $sql = "INSERT INTO {$this->table} (user_id, balance, pending_balance) VALUES (?, 0, 0)";
        return $this->db->insert($sql, [$userId]);
    }
}
