<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;

/**
 * WalletService - Quản lý ví tiền của Seller
 * 
 * Mỗi user có 1 ví duy nhất (được tạo tự động khi cần).
 * Tiền từ escrow được chuyển vào ví sau khi hết trial period.
 * Seller có thể rút tiền về tài khoản ngân hàng khi đủ ngưỡng.
 * 
 * @author Zoldify Team
 * @date 2026-01-07
 */
class WalletService
{
    /**
     * Số tiền tối thiểu để rút (VND)
     */
    private int $minWithdrawal;

    private Wallet $walletModel;
    private WalletTransaction $walletTransModel;

    public function __construct()
    {
        $this->minWithdrawal = (int) ($_ENV['MIN_WITHDRAWAL_AMOUNT'] ?? 100000);
        $this->walletModel = new Wallet();
        $this->walletTransModel = new WalletTransaction();
    }

    /**
     * Lấy hoặc tạo ví cho user
     * 
     * Ví được tạo tự động lần đầu khi cần (lazy creation).
     * 
     * @param int $userId
     * @return array Thông tin ví
     */
    public function getOrCreateWallet(int $userId): array
    {
        return $this->walletModel->getOrCreate($userId);
    }

    /**
     * Lấy thông tin ví của user
     * 
     * @param int $userId
     * @return array|null
     */
    public function getWalletByUserId(int $userId): ?array
    {
        return $this->walletModel->findByUserId($userId);
    }

    /**
     * Lấy số dư khả dụng
     * 
     * @param int $userId
     * @return float
     */
    public function getAvailableBalance(int $userId): float
    {
        $wallet = $this->walletModel->findByUserId($userId);
        return $wallet ? (float) $wallet['balance'] : 0;
    }

    /**
     * Lấy số tiền đang trong escrow
     * 
     * @param int $userId
     * @return float
     */
    public function getPendingBalance(int $userId): float
    {
        $wallet = $this->walletModel->findByUserId($userId);
        return $wallet ? (float) $wallet['pending_balance'] : 0;
    }

    /**
     * Cộng tiền vào ví (Credit)
     * 
     * Thường được gọi bởi EscrowService khi giải ngân.
     * 
     * @param int $userId
     * @param float $amount
     * @param int|null $orderId Đơn hàng liên quan
     * @param string $description Mô tả giao dịch
     * @return bool
     */
    public function credit(int $userId, float $amount, ?int $orderId = null, string $description = ''): bool
    {
        $wallet = $this->getOrCreateWallet($userId);

        $balanceBefore = $wallet['balance'];
        $balanceAfter = $balanceBefore + $amount;

        // Cập nhật số dư
        $this->walletModel->update($wallet['id'], [
            'balance' => $balanceAfter,
            'total_earned' => $wallet['total_earned'] + $amount,
        ]);

        // Tạo transaction log
        $this->walletTransModel->create([
            'wallet_id' => $wallet['id'],
            'order_id' => $orderId,
            'transaction_type' => 'credit',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => $description ?: 'Cộng tiền vào ví',
            'status' => 'completed',
        ]);

        return true;
    }

    /**
     * Trừ tiền từ ví (Debit)
     * 
     * Dùng cho phí, điều chỉnh, hoặc hoàn tiền.
     * 
     * @param int $userId
     * @param float $amount
     * @param int|null $orderId
     * @param string $description
     * @return bool
     */
    public function debit(int $userId, float $amount, ?int $orderId = null, string $description = ''): bool
    {
        $wallet = $this->walletModel->findByUserId($userId);
        if (!$wallet || $wallet['balance'] < $amount) {
            return false;
        }

        $balanceBefore = $wallet['balance'];
        $balanceAfter = $balanceBefore - $amount;

        // Cập nhật số dư
        $this->walletModel->update($wallet['id'], [
            'balance' => $balanceAfter,
        ]);

        // Tạo transaction log
        $this->walletTransModel->create([
            'wallet_id' => $wallet['id'],
            'order_id' => $orderId,
            'transaction_type' => 'debit',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => $description ?: 'Trừ tiền từ ví',
            'status' => 'completed',
        ]);

        return true;
    }

    /**
     * Cập nhật thông tin ngân hàng
     * 
     * Seller cần cung cấp thông tin ngân hàng để rút tiền.
     * 
     * @param int $userId
     * @param array $bankInfo [bank_name, bank_account_number, bank_account_name, bank_bin]
     * @return bool
     */
    public function updateBankInfo(int $userId, array $bankInfo): bool
    {
        $wallet = $this->getOrCreateWallet($userId);

        return $this->walletModel->update($wallet['id'], [
            'bank_name' => $bankInfo['bank_name'] ?? null,
            'bank_account_number' => $bankInfo['bank_account_number'] ?? null,
            'bank_account_name' => $bankInfo['bank_account_name'] ?? null,
            'bank_bin' => $bankInfo['bank_bin'] ?? null,
        ]);
    }

    /**
     * Kiểm tra có thể rút tiền không
     * 
     * @param int $userId
     * @param float $amount
     * @return array [can_withdraw, message]
     */
    public function canWithdraw(int $userId, float $amount): array
    {
        $wallet = $this->walletModel->findByUserId($userId);

        if (!$wallet) {
            return [false, 'Ví không tồn tại'];
        }

        if ($amount < $this->minWithdrawal) {
            return [false, "Số tiền rút tối thiểu là " . number_format($this->minWithdrawal) . "đ"];
        }

        if ($wallet['balance'] < $amount) {
            return [false, 'Số dư không đủ'];
        }

        if (empty($wallet['bank_account_number'])) {
            return [false, 'Vui lòng cập nhật thông tin ngân hàng'];
        }

        return [true, 'OK'];
    }

    /**
     * Yêu cầu rút tiền
     * 
     * Tạo transaction với status pending, đợi admin approve.
     * 
     * @param int $userId
     * @param float $amount
     * @return array|false
     */
    public function requestWithdrawal(int $userId, float $amount)
    {
        [$canWithdraw, $message] = $this->canWithdraw($userId, $amount);
        if (!$canWithdraw) {
            return ['success' => false, 'message' => $message];
        }

        $wallet = $this->walletModel->findByUserId($userId);
        $balanceBefore = $wallet['balance'];
        $balanceAfter = $balanceBefore - $amount;

        // Trừ tiền ngay (hold)
        $this->walletModel->update($wallet['id'], [
            'balance' => $balanceAfter,
        ]);

        // Tạo transaction với status pending
        $transId = $this->walletTransModel->create([
            'wallet_id' => $wallet['id'],
            'order_id' => null,
            'transaction_type' => 'withdrawal',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => 'Yêu cầu rút tiền về ' . $wallet['bank_name'],
            'reference_id' => null,
            'status' => 'pending',
        ]);

        return [
            'success' => true,
            'transaction_id' => $transId,
            'amount' => $amount,
            'bank_account' => $wallet['bank_account_number'],
            'bank_name' => $wallet['bank_name'],
        ];
    }

    /**
     * Lấy lịch sử giao dịch ví
     * 
     * @param int $userId
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getTransactionHistory(int $userId, int $limit = 20, int $offset = 0): array
    {
        $wallet = $this->walletModel->findByUserId($userId);
        if (!$wallet) {
            return [];
        }

        return $this->walletTransModel->getByWalletId($wallet['id'], $limit, $offset);
    }

    /**
     * Thống kê ví
     * 
     * @param int $userId
     * @return array
     */
    public function getWalletStats(int $userId): array
    {
        $wallet = $this->walletModel->findByUserId($userId);
        if (!$wallet) {
            return [
                'balance' => 0,
                'pending_balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
                'has_bank_info' => false,
            ];
        }

        return [
            'balance' => (float) $wallet['balance'],
            'pending_balance' => (float) $wallet['pending_balance'],
            'total_earned' => (float) $wallet['total_earned'],
            'total_withdrawn' => (float) $wallet['total_withdrawn'],
            'has_bank_info' => !empty($wallet['bank_account_number']),
            'bank_name' => $wallet['bank_name'],
            'bank_account_number' => $wallet['bank_account_number']
                ? '****' . substr($wallet['bank_account_number'], -4)
                : null,
        ];
    }

    /**
     * Lấy số tiền tối thiểu để rút
     * 
     * @return int
     */
    public function getMinWithdrawalAmount(): int
    {
        return $this->minWithdrawal;
    }
}
