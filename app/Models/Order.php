<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Order Model
 * 
 * Quản lý đơn hàng trong hệ thống.
 * Hỗ trợ đầy đủ lifecycle: pending → paid → shipping → received → completed
 * 
 * @package App\Models
 */
class Order extends BaseModel
{
    /** @var string */
    protected $table = 'orders';

    /** @var array<string> */
    protected array $fillable = [
        'buyer_id',
        'seller_id',
        'total_amount',
        'status',
        'payment_method',
        'payment_status',
        'shipping_address_id',
        'shipping_address_snapshot',
        'shipping_fee',
        'shipping_note',
    ];

    /** @var array<string> Order statuses */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_SHIPPING = 'shipping';
    public const STATUS_RECEIVED = 'received';
    public const STATUS_TRIAL_PERIOD = 'trial_period';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';

    /** @var array<string> Payment statuses */
    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_FAILED = 'failed';
    public const PAYMENT_REFUNDED = 'refunded';

    /** @var array<string> Valid status transitions */
    private const VALID_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_PAID,
        self::STATUS_SHIPPING,
        self::STATUS_RECEIVED,
        self::STATUS_TRIAL_PERIOD,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
        self::STATUS_REFUNDED,
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy 1 đơn hàng theo ID với thông tin buyer, seller
     * 
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function findWithDetails(int $id): ?array
    {
        $sql = "SELECT o.*, 
                    b.full_name AS buyer_name, 
                    b.email AS buyer_email, 
                    b.phone_number AS buyer_phone,
                    b.avatar AS buyer_avatar,
                    s.full_name AS seller_name, 
                    s.email AS seller_email
                FROM {$this->table} o
                LEFT JOIN users b ON o.buyer_id = b.id
                LEFT JOIN users s ON o.seller_id = s.id
                WHERE o.id = ?";

        return $this->db->fetchOne($sql, [$id]) ?: null;
    }

    /**
     * Lấy đơn hàng theo buyer ID
     * 
     * @param int $buyerId
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getByBuyerId(int $buyerId, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT o.*, s.full_name AS seller_name
                FROM {$this->table} o
                JOIN users s ON o.seller_id = s.id
                WHERE o.buyer_id = ? 
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$buyerId, $limit, $offset]);
    }

    /**
     * Lấy đơn hàng theo seller ID
     * 
     * @param int $sellerId
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getBySellerId(int $sellerId, int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT o.*, 
                    b.full_name AS buyer_name, 
                    b.address AS buyer_address,
                    b.phone_number AS buyer_phone
                FROM {$this->table} o
                JOIN users b ON o.buyer_id = b.id
                WHERE o.seller_id = ? 
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$sellerId, $limit, $offset]);
    }

    /**
     * Lấy tất cả đơn hàng cho admin
     * 
     * @param int $limit
     * @param int $offset
     * @param string|null $status
     * @return array<int, array<string, mixed>>
     */
    public function getAllForAdmin(int $limit = 20, int $offset = 0, ?string $status = null): array
    {
        $sql = "SELECT o.*, 
                    b.full_name AS buyer_name, 
                    b.email AS buyer_email,
                    s.full_name AS seller_name
                FROM {$this->table} o
                LEFT JOIN users b ON o.buyer_id = b.id
                LEFT JOIN users s ON o.seller_id = s.id";

        $params = [];

        if ($status !== null) {
            $sql .= " WHERE o.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Lấy chi tiết sản phẩm trong đơn hàng
     * 
     * @param int $orderId
     * @return array<int, array<string, mixed>>
     */
    public function getOrderItems(int $orderId): array
    {
        $sql = "SELECT od.*, 
                    p.name AS product_name, 
                    p.image AS product_image,
                    p.user_id AS seller_id
                FROM order_details od
                LEFT JOIN products p ON od.product_id = p.id
                WHERE od.order_id = ?";

        return $this->db->fetchAll($sql, [$orderId]);
    }

    /**
     * Tìm order theo PayOS order code
     * 
     * @param int $orderCode
     * @return array<string, mixed>|null
     */
    public function findByPayosOrderCode(int $orderCode): ?array
    {
        $sql = "SELECT o.*, 
                    b.full_name AS buyer_name, 
                    b.email AS buyer_email, 
                    b.phone_number AS buyer_phone,
                    s.full_name AS seller_name, 
                    s.email AS seller_email
                FROM {$this->table} o
                LEFT JOIN users b ON o.buyer_id = b.id
                LEFT JOIN users s ON o.seller_id = s.id
                WHERE o.payos_order_code = ?";

        return $this->db->fetchOne($sql, [$orderCode]) ?: null;
    }

    /**
     * Lấy orders cần auto-complete (hết trial period)
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getOrdersToComplete(): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status IN (?, ?)
                AND escrow_release_at IS NOT NULL 
                AND escrow_release_at <= NOW()";

        return $this->db->fetchAll($sql, [self::STATUS_RECEIVED, self::STATUS_TRIAL_PERIOD]);
    }

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Tạo đơn hàng mới
     * 
     * @param array{
     *     buyer_id: int,
     *     seller_id: int,
     *     total_amount: float,
     *     status?: string,
     *     payment_method?: string,
     *     payment_status?: string,
     *     platform_fee?: float,
     *     seller_amount?: float,
     *     shipping_fee?: float,
     *     shipping_address_id?: int,
     *     shipping_note?: string
     * } $data
     * @return int Order ID
     */
    public function createOrder(array $data): int
    {
        $sql = "INSERT INTO {$this->table} 
                (buyer_id, seller_id, total_amount, status, payment_method, payment_status,
                 platform_fee, seller_amount, shipping_fee, shipping_address_id, shipping_note) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        return $this->db->insert($sql, [
            $data['buyer_id'],
            $data['seller_id'],
            $data['total_amount'],
            $data['status'] ?? self::STATUS_PENDING,
            $data['payment_method'] ?? 'cod',
            $data['payment_status'] ?? self::PAYMENT_PENDING,
            $data['platform_fee'] ?? 0,
            $data['seller_amount'] ?? 0,
            $data['shipping_fee'] ?? 0,
            $data['shipping_address_id'] ?? null,
            $data['shipping_note'] ?? null,
        ]);
    }

    // =========================================================================
    // STATUS UPDATES
    // =========================================================================

    /**
     * Cập nhật trạng thái đơn hàng
     * 
     * @param int $orderId
     * @param string $status
     * @param string|null $reason Cancel reason nếu có
     * @return bool
     */
    public function updateStatus(int $orderId, string $status, ?string $reason = null): bool
    {
        if (!in_array($status, self::VALID_STATUSES, true)) {
            return false;
        }

        if ($reason !== null) {
            $sql = "UPDATE {$this->table} SET status = ?, cancel_reason = ? WHERE id = ?";
            return $this->db->execute($sql, [$status, $reason, $orderId]) !== false;
        }

        $sql = "UPDATE {$this->table} SET status = ? WHERE id = ?";
        return $this->db->execute($sql, [$status, $orderId]) !== false;
    }

    /**
     * Đánh dấu đã thanh toán
     * 
     * @param int $orderId
     * @return bool
     */
    public function markAsPaid(int $orderId): bool
    {
        $sql = "UPDATE {$this->table} SET 
                status = ?, 
                payment_status = ?, 
                paid_at = NOW() 
                WHERE id = ?";

        return $this->db->execute($sql, [self::STATUS_PAID, self::PAYMENT_PAID, $orderId]) !== false;
    }

    /**
     * Xác nhận đã nhận hàng (buyer)
     * 
     * @param int $orderId
     * @param int $trialDays Số ngày trial trước khi release tiền
     * @return bool
     */
    public function confirmReceived(int $orderId, int $trialDays = 3): bool
    {
        $releaseAt = date('Y-m-d H:i:s', strtotime("+{$trialDays} days"));

        $sql = "UPDATE {$this->table} SET 
                status = ?, 
                received_at = NOW(),
                escrow_release_at = ?
                WHERE id = ?";

        return $this->db->execute($sql, [self::STATUS_RECEIVED, $releaseAt, $orderId]) !== false;
    }

    /**
     * Đánh dấu hoàn thành
     * 
     * @param int $orderId
     * @return bool
     */
    public function markAsCompleted(int $orderId): bool
    {
        $sql = "UPDATE {$this->table} SET status = ?, completed_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [self::STATUS_COMPLETED, $orderId]) !== false;
    }

    // =========================================================================
    // PAYMENT UPDATES
    // =========================================================================

    /**
     * Cập nhật thông tin payment
     * 
     * @param int $orderId
     * @param array<string, mixed> $data
     * @return bool
     */
    public function updatePaymentInfo(int $orderId, array $data): bool
    {
        $allowedFields = [
            'payment_method',
            'payment_status',
            'payment_link_id',
            'payos_order_code',
            'paid_at'
        ];

        $sets = [];
        $params = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields, true)) {
                $sets[] = "{$key} = ?";
                $params[] = $value;
            }
        }

        if (empty($sets)) {
            return false;
        }

        $params[] = $orderId;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE id = ?";

        return $this->db->execute($sql, $params) !== false;
    }

    /**
     * Cập nhật payment status
     * 
     * @param int $orderId
     * @param string $status
     * @return bool
     */
    public function updatePaymentStatus(int $orderId, string $status): bool
    {
        $sql = "UPDATE {$this->table} SET payment_status = ?";
        $params = [$status];

        if ($status === self::PAYMENT_PAID) {
            $sql .= ", paid_at = NOW()";
        }

        $sql .= " WHERE id = ?";
        $params[] = $orderId;

        return $this->db->execute($sql, $params) !== false;
    }

    /**
     * Cập nhật thông tin GHN
     * 
     * @param int $orderId
     * @param array{
     *     ghn_order_code?: string,
     *     ghn_sort_code?: string,
     *     ghn_expected_delivery?: string,
     *     ghn_shipping_fee?: int,
     *     ghn_status?: string
     * } $data
     * @return bool
     */
    public function updateGHNInfo(int $orderId, array $data): bool
    {
        $allowedFields = [
            'ghn_order_code',
            'ghn_sort_code',
            'ghn_expected_delivery',
            'ghn_shipping_fee',
            'ghn_status'
        ];

        $sets = [];
        $params = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields, true)) {
                $sets[] = "{$key} = ?";
                $params[] = $value;
            }
        }

        if (empty($sets)) {
            return false;
        }

        $params[] = $orderId;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE id = ?";

        return $this->db->execute($sql, $params) !== false;
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Đếm số đơn hàng của buyer
     * 
     * @param int $buyerId
     * @return int
     */
    public function countByBuyerId(int $buyerId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE buyer_id = ?";
        $result = $this->db->fetchOne($sql, [$buyerId]);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Đếm theo trạng thái
     * 
     * @return array<string, int>
     */
    public function countByStatus(): array
    {
        $sql = "SELECT status, COUNT(*) AS count FROM {$this->table} GROUP BY status";
        $results = $this->db->fetchAll($sql);

        $counts = array_fill_keys(self::VALID_STATUSES, 0);

        foreach ($results as $row) {
            if (isset($counts[$row['status']])) {
                $counts[$row['status']] = (int) $row['count'];
            }
        }

        return $counts;
    }

    /**
     * Tính tổng doanh thu
     * 
     * @return float
     */
    public function getTotalRevenue(): float
    {
        $sql = "SELECT COALESCE(SUM(total_amount), 0) AS total 
                FROM {$this->table} 
                WHERE status = ?";

        $result = $this->db->fetchOne($sql, [self::STATUS_COMPLETED]);
        return (float) ($result['total'] ?? 0);
    }

    /**
     * Thống kê doanh thu theo seller
     * 
     * @param int $sellerId
     * @return array{total_orders: int, total_revenue: float, completed_orders: int}
     */
    public function getSellerStats(int $sellerId): array
    {
        $sql = "SELECT 
                    COUNT(*) AS total_orders,
                    COALESCE(SUM(total_amount), 0) AS total_revenue,
                    SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS completed_orders
                FROM {$this->table}
                WHERE seller_id = ?";

        $result = $this->db->fetchOne($sql, [self::STATUS_COMPLETED, $sellerId]);

        return [
            'total_orders' => (int) ($result['total_orders'] ?? 0),
            'total_revenue' => (float) ($result['total_revenue'] ?? 0),
            'completed_orders' => (int) ($result['completed_orders'] ?? 0),
        ];
    }

    // =========================================================================
    // AUTO-CANCEL EXPIRED ORDERS
    // =========================================================================

    /** @var int Thời gian tối đa chờ thanh toán (phút) */
    public const PAYMENT_TIMEOUT_MINUTES = 15;

    /**
     * Lấy các đơn hàng pending quá hạn thanh toán
     * 
     * @param int $minutes Số phút timeout (mặc định 15)
     * @return array<int, array<string, mixed>>
     */
    public function getExpiredPendingOrders(int $minutes = self::PAYMENT_TIMEOUT_MINUTES): array
    {
        $sql = "SELECT o.*, GROUP_CONCAT(od.product_id, ':', od.quantity) AS items_data
                FROM {$this->table} o
                LEFT JOIN order_details od ON od.order_id = o.id
                WHERE o.status = ?
                AND o.payment_method != 'cod'
                AND o.created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)
                GROUP BY o.id";

        return $this->db->fetchAll($sql, [self::STATUS_PENDING, $minutes]);
    }

    /**
     * Tự động hủy các đơn hàng quá hạn và hoàn lại stock
     * 
     * @return array{cancelled: int, restored_items: int}
     */
    public function cancelExpiredOrders(): array
    {
        $expiredOrders = $this->getExpiredPendingOrders();
        $cancelledCount = 0;
        $restoredItems = 0;

        $productModel = new Product();

        foreach ($expiredOrders as $order) {
            // Parse items_data: "1:2,3:1" => [product_id => quantity]
            $itemsRaw = $order['items_data'] ?? '';
            $items = [];
            if (!empty($itemsRaw)) {
                foreach (explode(',', $itemsRaw) as $pair) {
                    [$productId, $qty] = explode(':', $pair);
                    $items[(int) $productId] = (int) $qty;
                }
            }

            // Hoàn lại stock cho từng sản phẩm
            foreach ($items as $productId => $quantity) {
                $productModel->increaseQuantity($productId, $quantity);
                $restoredItems++;
            }

            // Hủy đơn hàng
            $this->updateStatus(
                (int) $order['id'],
                self::STATUS_CANCELLED,
                'Tự động hủy do quá hạn thanh toán (' . self::PAYMENT_TIMEOUT_MINUTES . ' phút)'
            );
            $cancelledCount++;
        }

        return [
            'cancelled' => $cancelledCount,
            'restored_items' => $restoredItems,
        ];
    }

    // =========================================================================
    // LEGACY COMPATIBILITY
    // =========================================================================

    /**
     * @deprecated Use findWithDetails() instead
     */
    public function find($id): ?array
    {
        return $this->findWithDetails((int) $id);
    }

    /**
     * @deprecated Use getOrderItems() instead
     */
    public function getOrderDetails(int $orderId): array
    {
        return $this->getOrderItems($orderId);
    }
}
