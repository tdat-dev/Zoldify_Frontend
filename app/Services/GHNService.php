<?php

declare(strict_types=1);

namespace App\Services;

/**
 * GHNService - Wrapper cho Giao Hàng Nhanh API
 * 
 * GHN là đơn vị vận chuyển hàng đầu Việt Nam, hỗ trợ:
 * - Lấy hàng tận nơi (pickup at seller address)
 * - Giao hàng thu tiền hộ (COD)
 * - Tracking realtime
 * 
 * API Documentation: https://api.ghn.vn/home/docs/detail
 * 
 * @author Zoldify Team
 * @date 2026-01-13
 */
class GHNService
{
    /**
     * API Token từ GHN
     */
    private string $token;

    /**
     * Shop ID đăng ký trên GHN
     */
    private int $shopId;

    /**
     * Base URL của API
     * - Sandbox: https://dev-online-gateway.ghn.vn/shiip/public-api
     * - Production: https://online-gateway.ghn.vn/shiip/public-api
     */
    private string $baseUrl;

    /**
     * Môi trường: sandbox hoặc production
     */
    private string $environment;

    /**
     * Bật/tắt GHN service (tạm thời)
     */
    private bool $enabled;

    /**
     * Service type mặc định
     * 1 = Express (Nhanh)
     * 2 = Standard (Chuẩn) - Recommended
     */
    public const SERVICE_TYPE_EXPRESS = 1;
    public const SERVICE_TYPE_STANDARD = 2;

    /**
     * Payment type (Ai trả phí ship)
     * 1 = Seller trả
     * 2 = Buyer trả (recommended cho COD)
     */
    public const PAYMENT_SELLER = 1;
    public const PAYMENT_BUYER = 2;

    /**
     * Required note options (Ghi chú bắt buộc khi giao)
     */
    public const NOTE_ALLOW_TRY = 'CHOTHUHANG';          // Cho thử hàng
    public const NOTE_ALLOW_VIEW = 'CHOXEMHANGKHONGTHU'; // Cho xem không thử
    public const NOTE_NO_VIEW = 'KHONGCHOXEMHANG';       // Không cho xem

    public function __construct()
    {
        $this->enabled = self::isEnabled();
        $this->token = $_ENV['GHN_TOKEN'] ?? '';
        $this->shopId = (int) ($_ENV['GHN_SHOP_ID'] ?? 0);
        $this->environment = $_ENV['GHN_ENV'] ?? 'sandbox';

        // Chọn URL dựa trên environment
        $this->baseUrl = $this->environment === 'production'
            ? 'https://online-gateway.ghn.vn/shiip/public-api'
            : 'https://dev-online-gateway.ghn.vn/shiip/public-api';

        if (!$this->enabled) {
            return;
        }

        if (empty($this->token) || $this->shopId === 0) {
            throw new \Exception('GHN credentials chưa được cấu hình trong .env (GHN_TOKEN, GHN_SHOP_ID)');
        }
    }

    /**
     * Kiểm tra GHN service có đang bật hay không
     */
    public static function isEnabled(): bool
    {
        $value = $_ENV['GHN_ENABLED'] ?? null;
        if ($value === null || $value === '') {
            return true;
        }

        $parsed = filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
        return $parsed ?? true;
    }

    // ========================================
    // MASTER DATA APIs (Lấy danh sách địa chỉ)
    // ========================================

    /**
     * Lấy danh sách tỉnh/thành phố
     * 
     * @return array Danh sách tỉnh [{ProvinceID, ProvinceName, Code}]
     */
    public function getProvinces(): array
    {
        $response = $this->request('GET', '/master-data/province');
        return $response['data'] ?? [];
    }

    /**
     * Lấy danh sách quận/huyện theo tỉnh
     * 
     * @param int $provinceId ID tỉnh từ getProvinces()
     * @return array Danh sách quận [{DistrictID, DistrictName, ProvinceID}]
     */
    public function getDistricts(int $provinceId): array
    {
        $response = $this->request('POST', '/master-data/district', [
            'province_id' => $provinceId,
        ]);
        return $response['data'] ?? [];
    }

    /**
     * Lấy danh sách phường/xã theo quận
     * 
     * @param int $districtId ID quận từ getDistricts()
     * @return array Danh sách phường [{WardCode, WardName, DistrictID}]
     */
    public function getWards(int $districtId): array
    {
        $response = $this->request('POST', '/master-data/ward', [
            'district_id' => $districtId,
        ]);
        return $response['data'] ?? [];
    }

    /**
     * Lấy danh sách dịch vụ khả dụng giữa 2 quận
     * 
     * @param int $fromDistrictId Quận gửi
     * @param int $toDistrictId Quận nhận
     * @return array Danh sách dịch vụ [{service_id, short_name, service_type_id}]
     */
    public function getAvailableServices(int $fromDistrictId, int $toDistrictId): array
    {
        $response = $this->request('POST', '/v2/shipping-order/available-services', [
            'shop_id' => $this->shopId,
            'from_district' => $fromDistrictId,
            'to_district' => $toDistrictId,
        ]);
        return $response['data'] ?? [];
    }

    // ========================================
    // SHIPPING FEE APIs (Tính phí vận chuyển)
    // ========================================

    /**
     * Tính phí vận chuyển
     * 
     * @param array $data {
     *     to_district_id: int (bắt buộc),
     *     to_ward_code: string (bắt buộc),
     *     weight: int (gram, bắt buộc),
     *     service_type_id: int (1=Express, 2=Standard),
     *     insurance_value: int (giá trị khai báo để bảo hiểm),
     *     cod_value: int (tiền thu hộ COD),
     *     from_district_id: int (optional, lấy từ shop nếu không truyền),
     *     from_ward_code: string (optional),
     *     length: int (cm),
     *     width: int (cm),
     *     height: int (cm),
     * }
     * @return array {total, service_fee, insurance_fee, cod_fee, ...}
     */
    public function calculateFee(array $data): array
    {
        if (!$this->enabled) {
            return [
                'total' => 0,
                'service_fee' => 0,
                'insurance_fee' => 0,
                'cod_fee' => 0,
            ];
        }

        // Gán giá trị mặc định
        $payload = array_merge([
            'service_type_id' => self::SERVICE_TYPE_STANDARD,
            'insurance_value' => 0,
            'weight' => 500, // 500g default
        ], $data);

        // GHN fee API hiện yêu cầu service_id (not just service_type_id)
        if (empty($payload['service_id'])) {
            $fromDistrictId = (int) ($payload['from_district_id'] ?? 0);
            $toDistrictId = (int) ($payload['to_district_id'] ?? 0);

            if ($fromDistrictId <= 0 || $toDistrictId <= 0) {
                throw new \InvalidArgumentException('Missing from_district_id/to_district_id for GHN fee calculation.');
            }

            $services = $this->getAvailableServices($fromDistrictId, $toDistrictId);
            if (empty($services)) {
                throw new \Exception('GHN: No available services for these districts.');
            }

            $serviceId = null;
            $serviceTypeId = (int) ($payload['service_type_id'] ?? 0);
            if ($serviceTypeId > 0) {
                foreach ($services as $service) {
                    if ((int) ($service['service_type_id'] ?? 0) === $serviceTypeId) {
                        $serviceId = $service['service_id'] ?? null;
                        break;
                    }
                }
            }

            if (empty($serviceId)) {
                $serviceId = $services[0]['service_id'] ?? null;
            }

            if (empty($serviceId)) {
                throw new \Exception('GHN: Could not resolve service_id for fee calculation.');
            }

            $payload['service_id'] = (int) $serviceId;
        }

        $response = $this->request('POST', '/v2/shipping-order/fee', $payload, true);
        return $response['data'] ?? [];
    }

    // ========================================
    // ORDER APIs (Quản lý đơn vận chuyển)
    // ========================================

    /**
     * Tạo đơn vận chuyển mới
     * 
     * Khi tạo xong, GHN sẽ:
     * 1. Sinh mã vận đơn (order_code)
     * 2. Tự động phân công shipper đến lấy hàng
     * 3. Gửi notification cho shipper
     * 
     * @param array $data {
     *     to_name: string (Tên người nhận),
     *     to_phone: string (SĐT người nhận),
     *     to_address: string (Địa chỉ giao hàng),
     *     to_ward_code: string (Mã phường/xã),
     *     to_district_id: int (Mã quận/huyện),
     *     weight: int (Cân nặng gram, max 30000),
     *     cod_amount: int (Tiền thu hộ, 0 nếu đã thanh toán online),
     *     content: string (Nội dung đơn hàng),
     *     
     *     // Optional
     *     payment_type_id: int (1=Seller trả, 2=Buyer trả ship),
     *     service_type_id: int (1=Express, 2=Standard),
     *     required_note: string (CHOTHUHANG/CHOXEMHANGKHONGTHU/KHONGCHOXEMHANG),
     *     note: string (Ghi chú cho shipper),
     *     insurance_value: int (Giá trị bảo hiểm, max 5tr),
     *     client_order_code: string (Mã order của bạn để mapping),
     *     length: int, width: int, height: int (cm),
     *     items: array (Danh sách sản phẩm),
     * }
     * @return array {order_code, total_fee, expected_delivery_time, ...}
     */
    public function createOrder(array $data): array
    {
        if (!$this->enabled) {
            throw new \Exception('GHN service is disabled.');
        }

        // Validate required fields
        $required = ['to_name', 'to_phone', 'to_address', 'to_ward_code', 'to_district_id', 'weight'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \InvalidArgumentException("Missing required field: {$field}");
            }
        }

        // Gán giá trị mặc định
        $payload = array_merge([
            'payment_type_id' => self::PAYMENT_BUYER, // Buyer trả phí ship
            'service_type_id' => self::SERVICE_TYPE_STANDARD,
            'required_note' => self::NOTE_ALLOW_VIEW,
            'cod_amount' => 0,
            'insurance_value' => 0,
        ], $data);

        $response = $this->request('POST', '/v2/shipping-order/create', $payload, true);

        return [
            'order_code' => $response['data']['order_code'] ?? null,
            'sort_code' => $response['data']['sort_code'] ?? null,
            'total_fee' => $response['data']['total_fee'] ?? 0,
            'expected_delivery_time' => $response['data']['expected_delivery_time'] ?? null,
            'fee' => $response['data']['fee'] ?? [],
            'raw' => $response['data'] ?? [],
        ];
    }

    /**
     * Lấy thông tin chi tiết đơn vận chuyển
     * 
     * Dùng để tracking trạng thái:
     * - ready_to_pick: Chờ lấy hàng
     * - picking: Đang lấy hàng
     * - picked: Đã lấy hàng
     * - storing: Đang lưu kho
     * - transporting: Đang vận chuyển
     * - delivering: Đang giao
     * - delivered: Đã giao
     * - delivery_fail: Giao thất bại
     * - return: Trả hàng
     * - returned: Đã trả hàng
     * - cancel: Đã hủy
     * 
     * @param string $orderCode Mã vận đơn GHN
     * @return array Thông tin chi tiết đơn hàng
     */
    public function getOrderInfo(string $orderCode): array
    {
        if (!$this->enabled) {
            throw new \Exception('GHN service is disabled.');
        }

        $response = $this->request('POST', '/v2/shipping-order/detail', [
            'order_code' => $orderCode,
        ]);
        return $response['data'] ?? [];
    }

    /**
     * Hủy đơn vận chuyển
     * 
     * Chỉ có thể hủy khi đơn chưa được lấy (status trước picking)
     * 
     * @param string[] $orderCodes Mảng các mã vận đơn cần hủy
     * @return array Kết quả hủy
     */
    public function cancelOrder(array $orderCodes): array
    {
        if (!$this->enabled) {
            throw new \Exception('GHN service is disabled.');
        }

        $response = $this->request('POST', '/v2/switch-status/cancel', [
            'order_codes' => $orderCodes,
        ], true);
        return $response['data'] ?? [];
    }

    /**
     * Lấy URL in phiếu gửi hàng
     * 
     * @param string $orderCode Mã vận đơn
     * @return string URL để in phiếu (size A5)
     */
    public function getPrintUrl(string $orderCode): string
    {
        if (!$this->enabled) {
            throw new \Exception('GHN service is disabled.');
        }

        // API print trả về URL trực tiếp
        $response = $this->request('POST', '/v2/a5/gen-token', [
            'order_codes' => [$orderCode],
        ], true);

        return $response['data']['token'] ?? '';
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    /**
     * Gọi API GHN
     * 
     * @param string $method HTTP method (GET, POST)
     * @param string $endpoint API endpoint
     * @param array $data Request body
     * @param bool $includeShopId Có gửi ShopId header không
     * @return array Response data
     */
    private function request(string $method, string $endpoint, array $data = [], bool $includeShopId = false): array
    {
        if (!$this->enabled) {
            throw new \Exception('GHN service is disabled.');
        }

        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Content-Type: application/json',
            'Token: ' . $this->token,
        ];

        // Một số API cần ShopId trong header
        if ($includeShopId) {
            $headers[] = 'ShopId: ' . $this->shopId;
        }

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            // Development: tắt SSL verify (production nên bật)
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($data)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            throw new \Exception("GHN API Error: {$error}");
        }

        $result = json_decode($response, true);

        // GHN trả code trong body, không phải HTTP status
        $code = $result['code'] ?? $httpCode;
        if ($code !== 200) {
            $errorMsg = $result['message'] ?? 'Unknown error';
            throw new \Exception("GHN API Error ({$code}): {$errorMsg}");
        }

        return $result;
    }

    /**
     * Chuyển đổi trạng thái GHN sang trạng thái hệ thống
     * 
     * @param string $ghnStatus Trạng thái từ GHN
     * @return string Trạng thái trong hệ thống Zoldify
     */
    public static function mapStatusToSystem(string $ghnStatus): string
    {
        $mapping = [
            'ready_to_pick' => 'shipping',
            'picking' => 'shipping',
            'picked' => 'shipping',
            'storing' => 'shipping',
            'transporting' => 'shipping',
            'sorting' => 'shipping',
            'delivering' => 'shipping',
            'delivered' => 'received',
            'delivery_fail' => 'shipping',
            'waiting_to_return' => 'shipping',
            'return' => 'shipping',
            'returned' => 'cancelled',
            'cancel' => 'cancelled',
        ];

        return $mapping[$ghnStatus] ?? 'shipping';
    }

    /**
     * Getter cho environment (để debug)
     */
    public function getEnvironment(): string
    {
        return $this->environment;
    }

    /**
     * Getter cho shopId
     */
    public function getShopId(): int
    {
        return $this->shopId;
    }
}
