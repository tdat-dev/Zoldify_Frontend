<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\EscrowHold;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\PaymentTransaction;

/**
 * EscrowService - Quản lý tiền giữ lại (Escrow)
 * 
 * Escrow là cơ chế giữ tiền của buyer cho đến khi:
 * 1. Seller giao hàng thành công
 * 2. Buyer xác nhận đã nhận hàng
 * 3. Hết thời gian thử hàng (7 ngày cho đồ mới, ít hơn cho đồ cũ)
 * 
 * @author Zoldify Team
 * @date 2026-01-07
 */
class EscrowService
{
    /**
     * Thời gian thử hàng mặc định theo condition
     */
    private array $trialDays;

    /**
     * Phí sàn (% trên mỗi giao dịch)
     */
    private float $platformFeePercent;

    private EscrowHold $escrowModel;
    private Wallet $walletModel;
    private WalletTransaction $walletTransModel;
    private PaymentTransaction $paymentTransModel;

    public function __construct()
    {
        // Load config từ .env
        $this->trialDays = [
            'new' => (int) ($_ENV['ESCROW_TRIAL_DAYS_NEW'] ?? 7),
            'like_new' => (int) ($_ENV['ESCROW_TRIAL_DAYS_LIKE_NEW'] ?? 5),
            'good' => (int) ($_ENV['ESCROW_TRIAL_DAYS_GOOD'] ?? 3),
            'fair' => (int) ($_ENV['ESCROW_TRIAL_DAYS_FAIR'] ?? 2),
        ];

        $this->platformFeePercent = (float) ($_ENV['PLATFORM_FEE_PERCENT'] ?? 5);

        $this->escrowModel = new EscrowHold();
        $this->walletModel = new Wallet();
        $this->walletTransModel = new WalletTransaction();
        $this->paymentTransModel = new PaymentTransaction();
    }

    /**
     * Lấy số ngày thử hàng dựa trên condition sản phẩm
     * 
     * @param string $condition new|like_new|good|fair
     * @return int Số ngày
     */
    public function getTrialDays(string $condition): int
    {
        return $this->trialDays[$condition] ?? $this->trialDays['good'];
    }

    /**
     * Giữ tiền khi payment thành công (Hold Funds)
     * 
     * Được gọi khi nhận webhook thanh toán thành công từ PayOS.
     * Tiền sẽ được giữ lại cho đến khi buyer nhận hàng + hết trial period.
     * 
     * @param int $orderId ID đơn hàng
     * @param float $amount Số tiền cần giữ
     * @param int $sellerId ID người bán
     * @param string $productCondition Tình trạng sản phẩm (new, like_new, good, fair)
     * @return array Thông tin escrow hold
     */
    public function holdFunds(int $orderId, float $amount, int $sellerId, string $productCondition = 'new'): array
    {
        // Tính phí sàn
        $platformFee = $amount * ($this->platformFeePercent / 100);
        $sellerAmount = $amount - $platformFee;

        // Tính thời gian giải ngân dự kiến
        $trialDays = $this->getTrialDays($productCondition);

        // Tạo escrow hold
        $escrowId = $this->escrowModel->create([
            'order_id' => $orderId,
            'seller_id' => $sellerId,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'seller_amount' => $sellerAmount,
            'status' => 'holding',
        ]);

        // Tạo payment transaction log
        $this->paymentTransModel->create([
            'order_id' => $orderId,
            'transaction_type' => 'escrow_hold',
            'amount' => $amount,
            'status' => 'success',
            'metadata' => json_encode([
                'seller_id' => $sellerId,
                'platform_fee' => $platformFee,
                'seller_amount' => $sellerAmount,
                'trial_days' => $trialDays,
                'product_condition' => $productCondition,
            ]),
        ]);

        // Cập nhật pending_balance trong ví seller
        $wallet = $this->walletModel->getOrCreate($sellerId);
        $this->walletModel->addPendingBalance($wallet['id'], $sellerAmount);

        return [
            'escrow_id' => $escrowId,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'seller_amount' => $sellerAmount,
            'trial_days' => $trialDays,
        ];
    }

    /**
     * Đăng ký thời gian giải ngân khi buyer nhận hàng
     * 
     * Được gọi khi buyer bấm "Đã nhận hàng".
     * Sau đó, tiền sẽ được giải ngân sau X ngày (tùy condition).
     * 
     * @param int $orderId
     * @param int $trialDays (lấy từ order.trial_days)
     * @return bool
     */
    public function scheduleRelease(int $orderId, int $trialDays): bool
    {
        $escrow = $this->escrowModel->findByOrderId($orderId);
        if (!$escrow || $escrow['status'] !== 'holding') {
            return false;
        }

        // Tính ngày giải ngân = ngày hiện tại + số ngày thử
        $releaseDate = date('Y-m-d H:i:s', strtotime("+{$trialDays} days"));

        return $this->escrowModel->update($escrow['id'], [
            'release_scheduled_at' => $releaseDate,
        ]);
    }

    /**
     * Giải ngân tiền cho seller (Release Funds)
     * 
     * Được gọi bởi:
     * 1. Cron job khi hết thời gian thử hàng
     * 2. Admin khi xử lý tranh chấp thủ công
     * 
     * @param int $orderId
     * @param string|null $notes Ghi chú
     * @return bool
     */
    public function releaseFunds(int $orderId, ?string $notes = null): bool
    {
        $escrow = $this->escrowModel->findByOrderId($orderId);
        if (!$escrow || $escrow['status'] !== 'holding') {
            return false;
        }

        $sellerId = $escrow['seller_id'];
        $sellerAmount = $escrow['seller_amount'];

        // 1. Cập nhật escrow status
        $this->escrowModel->update($escrow['id'], [
            'status' => 'released',
            'released_at' => date('Y-m-d H:i:s'),
            'release_notes' => $notes,
        ]);

        // 2. Chuyển tiền từ pending vào balance của ví seller
        $wallet = $this->walletModel->getOrCreate($sellerId);

        $balanceBefore = $wallet['balance'];
        $balanceAfter = $balanceBefore + $sellerAmount;

        // Cập nhật ví
        $this->walletModel->update($wallet['id'], [
            'balance' => $balanceAfter,
            'pending_balance' => max(0, $wallet['pending_balance'] - $sellerAmount),
            'total_earned' => $wallet['total_earned'] + $sellerAmount,
        ]);

        // 3. Tạo wallet transaction log
        $this->walletTransModel->create([
            'wallet_id' => $wallet['id'],
            'order_id' => $orderId,
            'transaction_type' => 'credit',
            'amount' => $sellerAmount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => "Nhận tiền từ đơn hàng #{$orderId}",
            'status' => 'completed',
        ]);

        // 4. Tạo payment transaction log
        $this->paymentTransModel->create([
            'order_id' => $orderId,
            'transaction_type' => 'escrow_release',
            'amount' => $sellerAmount,
            'status' => 'success',
            'metadata' => json_encode([
                'seller_id' => $sellerId,
                'wallet_id' => $wallet['id'],
                'notes' => $notes,
            ]),
        ]);

        return true;
    }

    /**
     * Hoàn tiền cho buyer (Refund)
     * 
     * Được gọi khi:
     * 1. Buyer khiếu nại và Admin quyết định hoàn tiền
     * 2. Seller không giao hàng trong thời gian quy định
     * 
     * @param int $orderId
     * @param string $reason Lý do hoàn tiền
     * @return bool
     */
    public function refundBuyer(int $orderId, string $reason): bool
    {
        $escrow = $this->escrowModel->findByOrderId($orderId);
        if (!$escrow || !in_array($escrow['status'], ['holding', 'disputed'])) {
            return false;
        }

        // 1. Cập nhật escrow status
        $this->escrowModel->update($escrow['id'], [
            'status' => 'refunded',
            'released_at' => date('Y-m-d H:i:s'),
            'release_notes' => "Hoàn tiền: {$reason}",
        ]);

        // 2. Giảm pending_balance của seller
        $wallet = $this->walletModel->findByUserId($escrow['seller_id']);
        if ($wallet) {
            $this->walletModel->update($wallet['id'], [
                'pending_balance' => max(0, $wallet['pending_balance'] - $escrow['seller_amount']),
            ]);
        }

        // 3. Tạo payment transaction log
        $this->paymentTransModel->create([
            'order_id' => $orderId,
            'transaction_type' => 'refund',
            'amount' => $escrow['amount'],
            'status' => 'success',
            'metadata' => json_encode([
                'reason' => $reason,
                'seller_id' => $escrow['seller_id'],
            ]),
        ]);

        return true;
    }

    /**
     * Đánh dấu đơn hàng đang tranh chấp
     * 
     * @param int $orderId
     * @param string $reason
     * @return bool
     */
    public function markDisputed(int $orderId, string $reason): bool
    {
        $escrow = $this->escrowModel->findByOrderId($orderId);
        if (!$escrow || $escrow['status'] !== 'holding') {
            return false;
        }

        return $this->escrowModel->update($escrow['id'], [
            'status' => 'disputed',
            'release_notes' => "Tranh chấp: {$reason}",
        ]);
    }

    /**
     * Lấy danh sách escrow đã đến hạn giải ngân
     * 
     * Dùng cho Cron Job chạy hàng ngày để tự động giải ngân.
     * 
     * @return array
     */
    public function getReleasableEscrows(): array
    {
        return $this->escrowModel->getReleasable();
    }

    /**
     * Lấy thông tin escrow của một order
     * 
     * @param int $orderId
     * @return array|null
     */
    public function getEscrowByOrderId(int $orderId): ?array
    {
        return $this->escrowModel->findByOrderId($orderId);
    }

    /**
     * Tính phí sàn
     * 
     * @param float $amount
     * @return float
     */
    public function calculatePlatformFee(float $amount): float
    {
        return round($amount * ($this->platformFeePercent / 100), 2);
    }

    /**
     * Tính toán phí sàn và số tiền seller nhận
     * 
     * Dùng khi tạo đơn hàng để lưu vào order record.
     * 
     * @param float $totalAmount Tổng tiền đơn hàng
     * @return array{platform_fee: float, seller_amount: float, fee_percent: float}
     */
    public function calculateFees(float $totalAmount): array
    {
        $platformFee = $this->calculatePlatformFee($totalAmount);
        $sellerAmount = round($totalAmount - $platformFee, 2);

        return [
            'platform_fee' => $platformFee,
            'seller_amount' => $sellerAmount,
            'fee_percent' => $this->platformFeePercent,
        ];
    }

    /**
     * Giữ tiền COD khi buyer xác nhận nhận hàng
     * 
     * Khác với holdFunds() (cho PayOS được gọi sau payment), 
     * holdCODFunds() được gọi khi buyer xác nhận "Đã nhận hàng" với đơn COD.
     * 
     * Flow: Buyer nhận hàng → holdCODFunds() → scheduleRelease() → releaseFunds()
     * 
     * @param int $orderId
     * @param float $amount Tổng tiền đơn hàng
     * @param int $sellerId
     * @param string $productCondition
     * @return array Thông tin escrow hold
     */
    public function holdCODFunds(int $orderId, float $amount, int $sellerId, string $productCondition = 'good'): array
    {
        // Kiểm tra đã có escrow chưa
        $existing = $this->escrowModel->findByOrderId($orderId);
        if ($existing) {
            return [
                'escrow_id' => $existing['id'],
                'amount' => $existing['amount'],
                'platform_fee' => $existing['platform_fee'],
                'seller_amount' => $existing['seller_amount'],
                'already_exists' => true,
            ];
        }

        // Tính phí sàn
        $fees = $this->calculateFees($amount);
        $platformFee = $fees['platform_fee'];
        $sellerAmount = $fees['seller_amount'];

        // Tính thời gian giải ngân dự kiến
        $trialDays = $this->getTrialDays($productCondition);

        // Tạo escrow hold
        $escrowId = $this->escrowModel->create([
            'order_id' => $orderId,
            'seller_id' => $sellerId,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'seller_amount' => $sellerAmount,
            'status' => 'holding',
        ]);

        // Tạo payment transaction log
        $this->paymentTransModel->create([
            'order_id' => $orderId,
            'transaction_type' => 'cod_escrow_hold',
            'amount' => $amount,
            'status' => 'success',
            'metadata' => json_encode([
                'seller_id' => $sellerId,
                'platform_fee' => $platformFee,
                'seller_amount' => $sellerAmount,
                'trial_days' => $trialDays,
                'product_condition' => $productCondition,
                'payment_method' => 'cod',
            ]),
        ]);

        // Cập nhật pending_balance trong ví seller
        $wallet = $this->walletModel->getOrCreate($sellerId);
        $this->walletModel->addPendingBalance($wallet['id'], $sellerAmount);

        return [
            'escrow_id' => $escrowId,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'seller_amount' => $sellerAmount,
            'trial_days' => $trialDays,
        ];
    }
}
