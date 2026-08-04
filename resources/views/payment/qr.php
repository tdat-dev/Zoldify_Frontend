<?php
/**
 * Payment QR Page
 * Hiển thị mã QR VietQR để thanh toán qua PayOS
 */
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';

$orderId = $paymentData['order_id'] ?? 0;
$amount = $paymentData['amount'] ?? 0;
$checkoutUrl = $paymentData['checkout_url'] ?? '';
$qrCode = $paymentData['qr_code'] ?? '';
$accountNumber = $paymentData['account_number'] ?? '';
$accountName = $paymentData['account_name'] ?? '';
$paymentLinkId = $paymentData['payment_link_id'] ?? '';
$timeLeft = $timeLeft ?? 900; // 15 phút mặc định
?>

<style>
    .payment-container {
        max-width: 500px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .payment-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 2rem;
        color: white;
        text-align: center;
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
    }

    .payment-card__header {
        margin-bottom: 1.5rem;
    }

    .payment-card__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .payment-card__subtitle {
        opacity: 0.9;
        font-size: 0.9rem;
    }

    .qr-container {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        display: inline-block;
    }

    .qr-container img,
    .qr-container canvas {
        max-width: 220px;
        height: auto;
    }

    .qr-placeholder {
        width: 220px;
        height: 220px;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        border-radius: 8px;
    }

    .payment-info {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
    }

    .payment-info__row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .payment-info__row:last-child {
        border-bottom: none;
    }

    .payment-info__label {
        opacity: 0.8;
    }

    .payment-info__value {
        font-weight: 600;
    }

    .payment-amount {
        font-size: 2rem;
        font-weight: 800;
        margin: 1rem 0;
    }

    .countdown {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.2);
        padding: 0.75rem 1.5rem;
        border-radius: 50px;
        margin-bottom: 1.5rem;
    }

    .countdown__icon {
        animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {

        0%,
        100% {
            opacity: 1;
        }

        50% {
            opacity: 0.5;
        }
    }

    .countdown__time {
        font-size: 1.25rem;
        font-weight: 700;
        font-family: monospace;
    }

    .payment-steps {
        text-align: left;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 1.5rem;
    }

    .payment-steps__title {
        font-weight: 600;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .payment-steps__list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .payment-steps__item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.5rem 0;
        opacity: 0.9;
        font-size: 0.9rem;
    }

    .payment-steps__number {
        background: rgba(255, 255, 255, 0.3);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
    }

    .btn-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .btn-primary-payment {
        background: white;
        color: #667eea;
        border: none;
        padding: 0.875rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary-payment:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }

    .btn-secondary-payment {
        background: transparent;
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.5);
        padding: 0.875rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary-payment:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: white;
    }

    .payment-status {
        display: none;
        background: #10b981;
        padding: 1rem;
        border-radius: 12px;
        margin-top: 1rem;
        animation: slideIn 0.3s ease;
    }

    .payment-status.show {
        display: block;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .bank-logos {
        display: flex;
        justify-content: center;
        gap: 1rem;
        opacity: 0.6;
        margin-top: 1.5rem;
    }

    .bank-logos span {
        font-size: 0.75rem;
    }

    /* Expired state */
    .payment-card.expired {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    }

    .payment-card.expired .qr-container {
        opacity: 0.5;
    }
</style>

<main class="bg-gray-100 min-h-screen pb-20 md:py-8">
    <div class="payment-container">
        <div class="payment-card" id="paymentCard">
            <div class="payment-card__header">
                <div class="payment-card__title">
                    <i class="fas fa-qrcode mr-2"></i>
                    Quét mã để thanh toán
                </div>
                <div class="payment-card__subtitle">
                    Mã đơn hàng: #
                    <?= htmlspecialchars($orderId) ?>
                </div>
            </div>

            <!-- QR Code -->
            <div class="qr-container">
                <?php if (!empty($qrCode)): ?>
                    <!-- Render QR from data string -->
                    <div id="qr-code"></div>
                <?php else: ?>
                    <!-- Fallback: Link to PayOS checkout -->
                    <div class="qr-placeholder">
                        <i class="fas fa-spinner fa-spin fa-2x"></i>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Amount -->
            <div class="payment-amount">
                <?= number_format($amount, 0, ',', '.') ?>đ
            </div>

            <!-- Bank Info -->
            <?php if ($accountNumber): ?>
                <div class="payment-info">
                    <div class="payment-info__row">
                        <span class="payment-info__label">Số tài khoản</span>
                        <span class="payment-info__value">
                            <?= htmlspecialchars($accountNumber) ?>
                        </span>
                    </div>
                    <div class="payment-info__row">
                        <span class="payment-info__label">Chủ tài khoản</span>
                        <span class="payment-info__value">
                            <?= htmlspecialchars($accountName) ?>
                        </span>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Countdown -->
            <div class="countdown" id="countdown">
                <i class="fas fa-clock countdown__icon"></i>
                <span>Hết hạn sau:</span>
                <span class="countdown__time" id="countdown-timer">--:--</span>
            </div>

            <!-- Steps -->
            <div class="payment-steps">
                <div class="payment-steps__title">
                    <i class="fas fa-info-circle"></i>
                    Hướng dẫn thanh toán
                </div>
                <ol class="payment-steps__list">
                    <li class="payment-steps__item">
                        <span class="payment-steps__number">1</span>
                        <span>Mở ứng dụng ngân hàng (VietinBank, BIDV, VCB...)</span>
                    </li>
                    <li class="payment-steps__item">
                        <span class="payment-steps__number">2</span>
                        <span>Chọn chức năng Quét QR / VietQR</span>
                    </li>
                    <li class="payment-steps__item">
                        <span class="payment-steps__number">3</span>
                        <span>Quét mã QR ở trên và xác nhận thanh toán</span>
                    </li>
                </ol>
            </div>

            <!-- Success Message (hidden by default) -->
            <div class="payment-status" id="paymentSuccess">
                <i class="fas fa-check-circle mr-2"></i>
                Thanh toán thành công! Đang chuyển hướng...
            </div>

            <!-- Actions -->
            <div class="btn-actions">
                <?php if ($checkoutUrl): ?>
                    <a href="<?= htmlspecialchars($checkoutUrl) ?>" target="_blank" class="btn-primary-payment">
                        <i class="fas fa-external-link-alt mr-2"></i>
                        Mở trang thanh toán
                    </a>
                <?php endif; ?>
                <a href="/profile/orders/detail?id=<?= $orderId ?>" class="btn-secondary-payment">
                    Hủy
                </a>
            </div>

            <!-- Bank logos -->
            <div class="bank-logos">
                <span>Hỗ trợ: VietQR, VietinBank, BIDV, VCB, Techcombank, MB Bank...</span>
            </div>
        </div>
    </div>
</main>

<!-- QR Code Generator Library -->
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const orderId = <?= json_encode($orderId) ?>;
        const qrData = <?= json_encode($qrCode) ?>;
        let timeLeft = <?= (int) $timeLeft ?>;
        let checkInterval;
        let countdownInterval;

        // Generate QR Code
        if (qrData && document.getElementById('qr-code')) {
            QRCode.toCanvas(document.createElement('canvas'), qrData, {
                width: 220,
                margin: 0,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function (error, canvas) {
                if (!error) {
                    document.getElementById('qr-code').appendChild(canvas);
                }
            });
        }

        // Countdown Timer
        function updateCountdown() {
            if (timeLeft <= 0) {
                document.getElementById('countdown-timer').textContent = 'Hết hạn';
                document.getElementById('paymentCard').classList.add('expired');
                clearInterval(countdownInterval);
                clearInterval(checkInterval);
                return;
            }

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('countdown-timer').textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timeLeft--;
        }

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);

        // Polling to check payment status
        function checkPaymentStatus() {
            fetch(`/payment/check-status?order_id=${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.paid) {
                        // Payment successful!
                        clearInterval(checkInterval);
                        clearInterval(countdownInterval);

                        document.getElementById('paymentSuccess').classList.add('show');

                        // Redirect after 2 seconds
                        setTimeout(() => {
                            window.location.href = `/profile/orders/detail?id=${orderId}`;
                        }, 2000);
                    }
                })
                .catch(err => console.log('Status check error:', err));
        }

        // Check every 3 seconds
        checkInterval = setInterval(checkPaymentStatus, 3000);
    });
</script>

<?php include __DIR__ . '/../partials/footer.php'; ?>