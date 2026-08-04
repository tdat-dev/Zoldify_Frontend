<?php

declare(strict_types=1);

namespace App\Services;

/**
 * PayOSService - Wrapper cho PayOS Payment Gateway API
 * 
 * PayOS là cổng thanh toán hỗ trợ VietQR, cho phép người dùng
 * quét mã QR để chuyển khoản ngân hàng.
 * 
 * API Documentation: https://payos.vn/docs/api/
 * 
 * @author Zoldify Team
 * @date 2026-01-07
 */
class PayOSService
{
    private string $clientId;
    private string $apiKey;
    private string $checksumKey;
    private string $baseUrl = 'https://api-merchant.payos.vn';
    private string $returnUrl;
    private string $cancelUrl;

    public function __construct()
    {
        $this->clientId = $_ENV['PAYOS_CLIENT_ID'] ?? '';
        $this->apiKey = $_ENV['PAYOS_API_KEY'] ?? '';
        $this->checksumKey = $_ENV['PAYOS_CHECKSUM_KEY'] ?? '';
        $this->returnUrl = $_ENV['PAYOS_RETURN_URL'] ?? '';
        $this->cancelUrl = $_ENV['PAYOS_CANCEL_URL'] ?? '';

        // Tự động detect domain hiện tại nếu trong .env cấu hình sai port (ví dụ 8000)
        // Fix lỗi ERR_CONNECTION_REFUSED khi chạy trên Laragon (port 80/443) nhưng config là 8000
        if (isset($_SERVER['HTTP_HOST'])) {
            $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
            $domain = $protocol . "://" . $_SERVER['HTTP_HOST'];

            // Luôn ưu tiên dynamic URL để đảm bảo redirect về đúng nơi user đang đứng
            $this->returnUrl = $domain . '/payment/return';
            $this->cancelUrl = $domain . '/payment/cancel';
        }

        if (empty($this->clientId) || empty($this->apiKey) || empty($this->checksumKey)) {
            throw new \Exception('PayOS credentials chưa được cấu hình trong .env');
        }
    }

    /**
     * Tạo payment link với QR code
     * 
     * Khi gọi API này, PayOS sẽ trả về:
     * - checkoutUrl: URL trang thanh toán (có QR)
     * - qrCode: Chuỗi QR code data
     * - paymentLinkId: ID để track payment
     * 
     * @param int $orderCode Mã đơn hàng unique (do mình tạo, phải là số nguyên dương)
     * @param int $amount Số tiền thanh toán (VND)
     * @param string $description Mô tả (tối đa 25 ký tự, không dấu)
     * @param array $items Danh sách sản phẩm [{name, quantity, price}]
     * @param string|null $buyerName Tên người mua
     * @param string|null $buyerEmail Email người mua
     * @param string|null $buyerPhone SĐT người mua
     * @param int|null $expiredAt Unix timestamp hết hạn (mặc định 15 phút)
     * @return array Response từ PayOS
     */
    public function createPaymentLink(
        int $orderCode,
        int $amount,
        string $description,
        array $items = [],
        ?string $buyerName = null,
        ?string $buyerEmail = null,
        ?string $buyerPhone = null,
        ?int $expiredAt = null
    ): array {
        // Mặc định hết hạn sau 15 phút
        if ($expiredAt === null) {
            $expiredAt = time() + (15 * 60);
        }

        // Chuẩn hóa description (loại bỏ dấu, max 25 ký tự)
        $description = $this->normalizeDescription($description);

        // Chuẩn bị data
        $data = [
            'orderCode' => $orderCode,
            'amount' => $amount,
            'description' => $description,
            'cancelUrl' => $this->cancelUrl,
            'returnUrl' => $this->returnUrl,
            'expiredAt' => $expiredAt,
        ];

        // Thêm thông tin buyer (nếu có)
        if ($buyerName)
            $data['buyerName'] = $buyerName;
        if ($buyerEmail)
            $data['buyerEmail'] = $buyerEmail;
        if ($buyerPhone)
            $data['buyerPhone'] = $buyerPhone;

        // Thêm danh sách sản phẩm
        if (!empty($items)) {
            $data['items'] = array_map(function ($item) {
                return [
                    'name' => mb_substr($item['name'] ?? 'Sản phẩm', 0, 256),
                    'quantity' => (int) ($item['quantity'] ?? 1),
                    'price' => (int) ($item['price'] ?? 0),
                ];
            }, $items);
        }

        // Tạo signature
        $data['signature'] = $this->createSignature([
            'amount' => $amount,
            'cancelUrl' => $this->cancelUrl,
            'description' => $description,
            'orderCode' => $orderCode,
            'returnUrl' => $this->returnUrl,
        ]);

        // Gọi API
        return $this->request('POST', '/v2/payment-requests', $data);
    }

    /**
     * Lấy thông tin payment từ PayOS
     * 
     * Dùng để kiểm tra trạng thái thanh toán:
     * - PENDING: Chờ thanh toán
     * - PAID: Đã thanh toán
     * - CANCELLED: Đã hủy
     * 
     * @param string $paymentLinkId ID từ response createPaymentLink
     * @return array
     */
    public function getPaymentInfo(string $paymentLinkId): array
    {
        return $this->request('GET', "/v2/payment-requests/{$paymentLinkId}");
    }

    /**
     * Hủy payment link
     * 
     * @param string $paymentLinkId ID cần hủy
     * @param string|null $reason Lý do hủy
     * @return array
     */
    public function cancelPaymentLink(string $paymentLinkId, ?string $reason = null): array
    {
        $data = [];
        if ($reason) {
            $data['cancellationReason'] = $reason;
        }

        return $this->request('POST', "/v2/payment-requests/{$paymentLinkId}/cancel", $data);
    }

    /**
     * Xác thực webhook signature từ PayOS
     * 
     * Khi PayOS gửi webhook, họ sẽ gửi kèm signature.
     * Mình cần verify signature để đảm bảo request đến từ PayOS.
     * 
     * @param array $webhookData Dữ liệu từ webhook body
     * @param string $signature Signature từ webhook
     * @return bool
     */
    public function verifyWebhookSignature(array $webhookData, string $signature): bool
    {
        // Lấy data object từ webhook
        $data = $webhookData['data'] ?? [];

        // Các field cần dùng để tạo signature (theo thứ tự alphabet)
        $signatureFields = [
            'amount' => $data['amount'] ?? 0,
            'code' => $data['code'] ?? '',
            'desc' => $data['desc'] ?? '',
            'orderCode' => $data['orderCode'] ?? 0,
            'paymentLinkId' => $data['paymentLinkId'] ?? '',
        ];

        // Tạo expected signature
        $expectedSignature = $this->createWebhookSignature($signatureFields);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Tạo signature cho request
     * 
     * PayOS yêu cầu signature được tạo bằng HMAC_SHA256
     * với data format: key1=value1&key2=value2 (sorted alphabetically)
     * 
     * @param array $data
     * @return string
     */
    private function createSignature(array $data): string
    {
        // Sort theo key alphabet
        ksort($data);

        // Build signature string thủ công (KHÔNG encode URL)
        // PayOS yêu cầu signature từ giá trị gốc, không phải URL-encoded
        $parts = [];
        foreach ($data as $key => $value) {
            $parts[] = "{$key}={$value}";
        }
        $signatureString = implode('&', $parts);

        // HMAC SHA256
        return hash_hmac('sha256', $signatureString, $this->checksumKey);
    }

    /**
     * Tạo signature cho webhook verification
     * 
     * @param array $data
     * @return string
     */
    private function createWebhookSignature(array $data): string
    {
        // Sort theo key alphabet
        ksort($data);

        // Build signature string
        $parts = [];
        foreach ($data as $key => $value) {
            $parts[] = "{$key}={$value}";
        }
        $signatureString = implode('&', $parts);

        // HMAC SHA256
        return hash_hmac('sha256', $signatureString, $this->checksumKey);
    }

    /**
     * Chuẩn hóa description
     * 
     * PayOS yêu cầu description:
     * - Không có ký tự đặc biệt
     * - Không có dấu tiếng Việt
     * - Tối đa 25 ký tự
     * 
     * @param string $description
     * @return string
     */
    private function normalizeDescription(string $description): string
    {
        // Loại bỏ dấu tiếng Việt
        $description = $this->removeVietnameseAccents($description);

        // Chỉ giữ chữ cái, số, khoảng trắng
        $description = preg_replace('/[^A-Za-z0-9\s]/', '', $description);

        // Loại bỏ khoảng trắng thừa
        $description = preg_replace('/\s+/', ' ', trim($description));

        // Giới hạn 25 ký tự
        return mb_substr($description, 0, 25);
    }

    /**
     * Loại bỏ dấu tiếng Việt
     * 
     * @param string $str
     * @return string
     */
    private function removeVietnameseAccents(string $str): string
    {
        $accents = [
            'à',
            'á',
            'ạ',
            'ả',
            'ã',
            'â',
            'ầ',
            'ấ',
            'ậ',
            'ẩ',
            'ẫ',
            'ă',
            'ằ',
            'ắ',
            'ặ',
            'ẳ',
            'ẵ',
            'è',
            'é',
            'ẹ',
            'ẻ',
            'ẽ',
            'ê',
            'ề',
            'ế',
            'ệ',
            'ể',
            'ễ',
            'ì',
            'í',
            'ị',
            'ỉ',
            'ĩ',
            'ò',
            'ó',
            'ọ',
            'ỏ',
            'õ',
            'ô',
            'ồ',
            'ố',
            'ộ',
            'ổ',
            'ỗ',
            'ơ',
            'ờ',
            'ớ',
            'ợ',
            'ở',
            'ỡ',
            'ù',
            'ú',
            'ụ',
            'ủ',
            'ũ',
            'ư',
            'ừ',
            'ứ',
            'ự',
            'ử',
            'ữ',
            'ỳ',
            'ý',
            'ỵ',
            'ỷ',
            'ỹ',
            'đ',
            'À',
            'Á',
            'Ạ',
            'Ả',
            'Ã',
            'Â',
            'Ầ',
            'Ấ',
            'Ậ',
            'Ẩ',
            'Ẫ',
            'Ă',
            'Ằ',
            'Ắ',
            'Ặ',
            'Ẳ',
            'Ẵ',
            'È',
            'É',
            'Ẹ',
            'Ẻ',
            'Ẽ',
            'Ê',
            'Ề',
            'Ế',
            'Ệ',
            'Ể',
            'Ễ',
            'Ì',
            'Í',
            'Ị',
            'Ỉ',
            'Ĩ',
            'Ò',
            'Ó',
            'Ọ',
            'Ỏ',
            'Õ',
            'Ô',
            'Ồ',
            'Ố',
            'Ộ',
            'Ổ',
            'Ỗ',
            'Ơ',
            'Ờ',
            'Ớ',
            'Ợ',
            'Ở',
            'Ỡ',
            'Ù',
            'Ú',
            'Ụ',
            'Ủ',
            'Ũ',
            'Ư',
            'Ừ',
            'Ứ',
            'Ự',
            'Ử',
            'Ữ',
            'Ỳ',
            'Ý',
            'Ỵ',
            'Ỷ',
            'Ỹ',
            'Đ'
        ];

        $noAccents = [
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'a',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'e',
            'i',
            'i',
            'i',
            'i',
            'i',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'o',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'u',
            'y',
            'y',
            'y',
            'y',
            'y',
            'd',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'A',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'E',
            'I',
            'I',
            'I',
            'I',
            'I',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'O',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'U',
            'Y',
            'Y',
            'Y',
            'Y',
            'Y',
            'D'
        ];

        return str_replace($accents, $noAccents, $str);
    }

    /**
     * Gọi API PayOS
     * 
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array $data Request body
     * @return array
     */
    private function request(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Content-Type: application/json',
            'x-client-id: ' . $this->clientId,
            'x-api-key: ' . $this->apiKey,
        ];

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            // Tắt SSL verify cho development (production nên bật lại hoặc dùng CA bundle)
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($data)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if (!empty($data)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new \Exception("PayOS API Error: {$error}");
        }

        $result = json_decode($response, true);

        if ($httpCode >= 400) {
            $errorMsg = $result['desc'] ?? $result['message'] ?? 'Unknown error';
            throw new \Exception("PayOS API Error ({$httpCode}): {$errorMsg}");
        }

        return $result;
    }

    /**
     * Tạo mã đơn hàng unique cho PayOS
     * 
     * PayOS yêu cầu orderCode phải là số nguyên dương và unique.
     * Chúng ta sẽ dùng timestamp + order_id để đảm bảo unique.
     * 
     * @param int $orderId ID đơn hàng trong DB
     * @return int
     */
    public static function generateOrderCode(int $orderId): int
    {
        // Format: timestamp (7 chữ số cuối) + orderId (tối đa 6 chữ số)
        // Đảm bảo orderCode không vượt quá max int (2^53 cho JS)
        $timestamp = (int) substr((string) time(), -7);
        return (int) ($timestamp . str_pad((string) $orderId, 6, '0', STR_PAD_LEFT));
    }
}
