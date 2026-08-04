<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\PayOSService;
use App\Services\EscrowService;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Models\Product;

/**
 * PaymentController - Xử lý thanh toán PayOS
 * 
 * Các routes:
 * - POST /payment/create - Tạo payment link
 * - POST /payment/webhook - Nhận callback từ PayOS
 * - GET /payment/return - Redirect sau thanh toán thành công
 * - GET /payment/cancel - Redirect khi hủy thanh toán
 * - GET /payment/qr - Hiển thị trang QR code
 * 
 * @author Zoldify Team
 * @date 2026-01-07
 */
class PaymentController extends BaseController
{
    private PayOSService $payosService;
    private EscrowService $escrowService;
    private Order $orderModel;
    private PaymentTransaction $transModel;

    public function __construct()
    {
        parent::__construct();
        $this->payosService = new PayOSService();
        $this->escrowService = new EscrowService();
        $this->orderModel = new Order();
        $this->transModel = new PaymentTransaction();
    }

    /**
     * Tạo payment link và redirect đến trang QR
     * 
     * Flow:
     * 1. Nhận order_id từ POST
     * 2. Validate order thuộc về user hiện tại
     * 3. Gọi PayOS API để tạo payment link
     * 4. Lưu payment info vào DB
     * 5. Redirect đến trang QR hoặc PayOS checkout
     */
    public function create()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /');
            exit;
        }

        // Kiểm tra đăng nhập
        if (!isset($_SESSION['user']['id'])) {
            $_SESSION['error'] = 'Vui lòng đăng nhập để thanh toán.';
            header('Location: /login');
            exit;
        }

        $orderId = (int) ($_POST['order_id'] ?? 0);
        if (!$orderId) {
            $_SESSION['error'] = 'Đơn hàng không hợp lệ.';
            header('Location: /cart');
            exit;
        }

        // Lấy thông tin order
        $order = $this->orderModel->find($orderId);

        // Debug: Log để kiểm tra
        error_log('[PayOS Create] orderId: ' . $orderId);
        error_log('[PayOS Create] order: ' . json_encode($order));
        error_log('[PayOS Create] session user id: ' . ($_SESSION['user']['id'] ?? 'null'));

        // Dùng == thay vì !== để tránh lỗi type mismatch (string vs int)
        if (!$order || (int) $order['buyer_id'] != (int) $_SESSION['user']['id']) {
            $_SESSION['error'] = 'Đơn hàng không tồn tại hoặc không thuộc về bạn.';
            error_log('[PayOS Create] Order validation failed - buyer_id: ' . ($order['buyer_id'] ?? 'null') . ', session: ' . ($_SESSION['user']['id'] ?? 'null'));
            header('Location: /profile/orders');
            exit;
        }

        // Kiểm tra order chưa thanh toán
        if ($order['payment_status'] === 'paid') {
            $_SESSION['error'] = 'Đơn hàng này đã được thanh toán.';
            header('Location: /profile/orders/detail?id=' . $orderId);
            exit;
        }

        try {
            // Tạo orderCode unique cho PayOS
            $orderCode = PayOSService::generateOrderCode($orderId);

            // Lấy danh sách sản phẩm trong order
            $orderDetails = $this->orderModel->getOrderDetails($orderId);
            $items = array_map(function ($item) {
                return [
                    'name' => $item['product_name'] ?? 'Sản phẩm',
                    'quantity' => $item['quantity'],
                    'price' => (int) ($item['price_at_purchase'] ?? $item['price'] ?? 0),
                ];
            }, $orderDetails);

            // Tạo description ngắn gọn
            $description = "DH" . $orderId;

            // Gọi PayOS API
            $response = $this->payosService->createPaymentLink(
                orderCode: $orderCode,
                amount: (int) $order['total_amount'],
                description: $description,
                items: $items,
                buyerName: $order['buyer_name'] ?? null,
                buyerEmail: $order['buyer_email'] ?? null,
                buyerPhone: $order['buyer_phone'] ?? null
            );

            // Debug: Log response
            error_log('[PayOS Create] Response: ' . json_encode($response));

            // Kiểm tra response
            if ($response['code'] !== '00') {
                throw new \Exception($response['desc'] ?? 'Lỗi tạo thanh toán: ' . json_encode($response));
            }

            $paymentData = $response['data'];

            // Cập nhật order với payment info
            $this->orderModel->updatePaymentInfo($orderId, [
                'payment_method' => 'payos',
                'payment_link_id' => $paymentData['paymentLinkId'],
                'payos_order_code' => $orderCode,
            ]);

            // Tạo payment transaction log
            $this->transModel->create([
                'order_id' => $orderId,
                'transaction_type' => 'payment',
                'amount' => $order['total_amount'],
                'payment_link_id' => $paymentData['paymentLinkId'],
                'payos_order_code' => $orderCode,
                'status' => 'pending',
                'metadata' => json_encode([
                    'checkout_url' => $paymentData['checkoutUrl'],
                    'qr_code' => $paymentData['qrCode'] ?? null,
                    'account_number' => $paymentData['accountNumber'] ?? null,
                    'account_name' => $paymentData['accountName'] ?? null,
                    'bin' => $paymentData['bin'] ?? null,
                ]),
            ]);

            // Lưu vào session để backup (nếu cần dùng sau)
            $_SESSION['payment_data'] = [
                'order_id' => $orderId,
                'order_code' => $orderCode,
                'amount' => $order['total_amount'],
                'checkout_url' => $paymentData['checkoutUrl'],
                'payment_link_id' => $paymentData['paymentLinkId'],
            ];

            // Redirect thẳng đến PayOS Hosted Page
            // PayOS sẽ tự động xử lý realtime (không cần F5)
            // Sau khi thanh toán xong, PayOS redirect về returnUrl
            header('Location: ' . $paymentData['checkoutUrl']);
            exit;

        } catch (\Exception $e) {
            $_SESSION['error'] = 'Lỗi tạo thanh toán: ' . $e->getMessage();
            header('Location: /profile/orders/detail?id=' . $orderId);
            exit;
        }
    }

    /**
     * Hiển thị trang QR code
     */
    public function showQR()
    {
        if (!isset($_SESSION['payment_data'])) {
            header('Location: /');
            exit;
        }

        $paymentData = $_SESSION['payment_data'];

        // Kiểm tra hết hạn
        if (time() > $paymentData['expired_at']) {
            unset($_SESSION['payment_data']);
            $_SESSION['error'] = 'Link thanh toán đã hết hạn. Vui lòng thử lại.';
            header('Location: /profile/orders/detail?id=' . $paymentData['order_id']);
            exit;
        }

        $this->view('payment/qr', [
            'paymentData' => $paymentData,
            'timeLeft' => $paymentData['expired_at'] - time(),
        ]);
    }

    /**
     * Webhook nhận callback từ PayOS
     * 
     * PayOS sẽ gọi endpoint này khi:
     * - Thanh toán thành công
     * - Thanh toán thất bại
     * - Hết hạn
     * 
     * QUAN TRỌNG: Phải verify signature trước khi xử lý!
     */
    public function webhook()
    {
        // Chỉ chấp nhận POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }

        // Lấy raw body
        $rawBody = file_get_contents('php://input');
        $webhookData = json_decode($rawBody, true);

        if (!$webhookData) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        // Log webhook để debug (trong production nên lưu vào file log)
        error_log('[PayOS Webhook] ' . $rawBody);

        // Kiểm tra có data không
        $data = $webhookData['data'] ?? null;
        if (!$data) {
            // Có thể là test webhook từ PayOS (confirm webhook)
            http_response_code(200);
            echo json_encode(['success' => true]);
            exit;
        }

        // Verify signature
        $signature = $webhookData['signature'] ?? '';
        if (!$this->payosService->verifyWebhookSignature($webhookData, $signature)) {
            error_log('[PayOS Webhook] Invalid signature');
            http_response_code(400);
            echo json_encode(['error' => 'Invalid signature']);
            exit;
        }

        // Lấy thông tin từ webhook
        $orderCode = (int) ($data['orderCode'] ?? 0);
        $paymentLinkId = $data['paymentLinkId'] ?? '';
        $code = $data['code'] ?? '';
        $amount = $data['amount'] ?? 0;
        $reference = $data['reference'] ?? '';
        $transactionDateTime = $data['transactionDateTime'] ?? null;

        // Tìm order theo payos_order_code
        $order = $this->orderModel->findByPayosOrderCode($orderCode);
        if (!$order) {
            error_log("[PayOS Webhook] Order not found for orderCode: {$orderCode}");
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            exit;
        }

        // Kiểm tra đã xử lý chưa (idempotency)
        if ($order['payment_status'] === 'paid') {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Already processed']);
            exit;
        }

        // Thanh toán thành công (code = "00")
        if ($code === '00') {
            $this->handlePaymentSuccess($order, $data, $reference);
        } else {
            // Thanh toán thất bại
            $this->handlePaymentFailed($order, $data);
        }

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    /**
     * Xử lý thanh toán thành công
     */
    private function handlePaymentSuccess(array $order, array $data, string $reference)
    {
        $orderId = (int) $order['id'];
        $sellerId = (int) $order['seller_id'];
        $amount = (float) $order['total_amount'];

        // 1. Cập nhật order status
        $this->orderModel->updatePaymentStatus($orderId, 'paid');
        $this->orderModel->updateStatus($orderId, 'paid');

        // Lấy condition của sản phẩm đầu tiên trong order để xác định trial days
        $orderDetails = $this->orderModel->getOrderDetails($orderId);
        $productCondition = 'new';
        if (!empty($orderDetails)) {
            $productModel = new Product();
            $product = $productModel->find($orderDetails[0]['product_id']);
            $productCondition = $product['product_condition'] ?? 'new';
        }

        // Lấy trial days và cập nhật order
        $trialDays = $this->escrowService->getTrialDays($productCondition);
        $this->orderModel->update($orderId, ['trial_days' => $trialDays]);

        // 2. Tạo escrow hold (giữ tiền)
        $this->escrowService->holdFunds($orderId, $amount, $sellerId, $productCondition);

        // 3. Cập nhật payment transaction
        $trans = $this->transModel->findByPayosOrderCode($data['orderCode']);
        if ($trans) {
            $this->transModel->updateStatus($trans['id'], 'success', [
                'metadata' => [
                    'reference' => $reference,
                    'transaction_datetime' => $data['transactionDateTime'] ?? null,
                    'counter_account' => [
                        'bank_id' => $data['counterAccountBankId'] ?? '',
                        'bank_name' => $data['counterAccountBankName'] ?? '',
                        'account_name' => $data['counterAccountName'] ?? '',
                        'account_number' => $data['counterAccountNumber'] ?? '',
                    ],
                ],
            ]);
        }

        error_log("[PayOS Webhook] Payment success for order #{$orderId}");
    }

    /**
     * Xử lý thanh toán thất bại
     */
    private function handlePaymentFailed(array $order, array $data)
    {
        $orderId = $order['id'];

        // Cập nhật payment transaction
        $trans = $this->transModel->findByPayosOrderCode($data['orderCode']);
        if ($trans) {
            $this->transModel->updateStatus($trans['id'], 'failed', [
                'metadata' => [
                    'error_code' => $data['code'] ?? '',
                    'error_desc' => $data['desc'] ?? '',
                ],
            ]);
        }

        error_log("[PayOS Webhook] Payment failed for order #{$orderId}: " . ($data['desc'] ?? 'Unknown'));
    }

    /**
     * Redirect sau khi thanh toán thành công
     * 
     * PayOS sẽ redirect user về URL này sau khi thanh toán.
     */
    public function returnUrl()
    {
        $orderCode = isset($_GET['orderCode']) ? (int) $_GET['orderCode'] : 0;
        $status = $_GET['status'] ?? null;

        // Xóa payment data khỏi session
        unset($_SESSION['payment_data']);

        if (!$orderCode) {
            $_SESSION['error'] = 'Thông tin thanh toán không hợp lệ.';
            header('Location: /profile/orders');
            exit;
        }

        // Tìm order
        $order = $this->orderModel->findByPayosOrderCode($orderCode);
        if (!$order) {
            $_SESSION['error'] = 'Không tìm thấy đơn hàng.';
            header('Location: /profile/orders');
            exit;
        }

        // Kiểm tra status từ query string
        $isPaid = ($status === 'PAID' || $status === 'CANCELLED'); // Status trả về từ PayOS redirect

        // Fallback: Nếu chưa paid trong DB, kiểm tra chủ động qua API
        // (quan trọng cho localhost vì webhook thường không nhận được)
        if ($order['payment_status'] !== 'paid') {
            try {
                $paymentInfo = $this->payosService->getPaymentInfo($order['payment_link_id']);
                if (($paymentInfo['data']['status'] ?? '') === 'PAID') {
                    // Payment thành công trên PayOS nhưng chưa cập nhật DB -> cập nhật ngay
                    $payosData = $paymentInfo['data'];

                    // Lấy giao dịch cuối cùng thành công
                    $lastTrans = end($payosData['transactions']) ?: [];

                    // Map data để reuse handlePaymentSuccess
                    $webhookData = [
                        'orderCode' => $payosData['orderCode'],
                        'amount' => $payosData['amount'],
                        'transactionDateTime' => $lastTrans['transactionDateTime'] ?? date('Y-m-d H:i:s'),
                        'counterAccountBankId' => $lastTrans['counterAccountBankId'] ?? null,
                        'counterAccountBankName' => $lastTrans['counterAccountBankName'] ?? null,
                        'counterAccountName' => $lastTrans['counterAccountName'] ?? null,
                        'counterAccountNumber' => $lastTrans['counterAccountNumber'] ?? null,
                    ];
                    $reference = $lastTrans['reference'] ?? 'ActiveCheck-' . time();

                    $this->handlePaymentSuccess($order, $webhookData, $reference);

                    $_SESSION['success'] = 'Thanh toán thành công (đã xác thực)! Đơn hàng đang được xử lý.';
                    header('Location: /profile/orders/detail?id=' . $order['id']);
                    exit;
                }
            } catch (\Exception $e) {
                error_log('[Payment Return] Error verifying payment: ' . $e->getMessage());
            }
        }

        if ($status === 'PAID' || $order['payment_status'] === 'paid') {
            $_SESSION['success'] = 'Thanh toán thành công! Đơn hàng của bạn đang được xử lý.';
        } else {
            $_SESSION['info'] = 'Đang xác nhận thanh toán. Vui lòng chờ trong giây lát.';
        }

        header('Location: /profile/orders/detail?id=' . $order['id']);
        exit;
    }

    /**
     * Redirect khi hủy thanh toán
     */
    public function cancelUrl()
    {
        $orderCode = isset($_GET['orderCode']) ? (int) $_GET['orderCode'] : 0;

        // Xóa payment data khỏi session
        unset($_SESSION['payment_data']);

        if ($orderCode) {
            $order = $this->orderModel->findByPayosOrderCode($orderCode);
            if ($order) {
                $_SESSION['info'] = 'Bạn đã hủy thanh toán. Đơn hàng vẫn được giữ lại, bạn có thể thanh toán sau.';
                header('Location: /profile/orders/detail?id=' . $order['id']);
                exit;
            }
        }

        header('Location: /profile/orders');
        exit;
    }

    /**
     * Kiểm tra trạng thái thanh toán (AJAX)
     * 
     * Dùng cho polling từ trang QR
     */
    public function checkStatus()
    {
        header('Content-Type: application/json');

        $orderId = $_GET['order_id'] ?? 0;
        if (!$orderId) {
            echo json_encode(['error' => 'Invalid order']);
            exit;
        }

        $order = $this->orderModel->find($orderId);
        if (!$order) {
            echo json_encode(['error' => 'Order not found']);
            exit;
        }

        echo json_encode([
            'status' => $order['status'],
            'payment_status' => $order['payment_status'],
            'paid' => $order['payment_status'] === 'paid',
        ]);
        exit;
    }
}
