<?php

declare(strict_types=1);

namespace App\Models;

/**
 * OrderItem Model
 * 
 * Quản lý chi tiết đơn hàng (order_details).
 * Mỗi order có nhiều items.
 * 
 * @package App\Models
 */
class OrderItem extends BaseModel
{
    /** @var string */
    protected $table = 'order_details';

    /** @var array<string> */
    protected array $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price_at_purchase',
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy items của một order
     * 
     * @param int $orderId
     * @return array<int, array<string, mixed>>
     */
    public function getByOrderId(int $orderId): array
    {
        $sql = "SELECT od.*, 
                    p.name AS product_name, 
                    p.image AS product_image,
                    p.user_id AS seller_id
                FROM {$this->table} od
                JOIN products p ON od.product_id = p.id
                WHERE od.order_id = ?";

        return $this->db->fetchAll($sql, [$orderId]);
    }

    /**
     * Lấy items chưa được review của user
     * 
     * Điều kiện:
     * - Order đã completed
     * - User chưa review sản phẩm này
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getUnreviewedItems(int $userId): array
    {
        $sql = "SELECT od.*, 
                    o.id AS order_id,
                    o.created_at AS order_date, 
                    p.name AS product_name, 
                    p.image AS product_image, 
                    p.id AS product_id,
                    p.user_id AS seller_id
                FROM {$this->table} od
                JOIN orders o ON od.order_id = o.id
                JOIN products p ON od.product_id = p.id
                LEFT JOIN reviews r ON r.product_id = od.product_id AND r.reviewer_id = ?
                WHERE o.buyer_id = ? 
                AND o.status = '" . Order::STATUS_COMPLETED . "'
                AND r.id IS NULL
                ORDER BY o.created_at DESC";

        return $this->db->fetchAll($sql, [$userId, $userId]);
    }

    /**
     * Kiểm tra user đã mua sản phẩm này chưa (để cho phép review)
     * 
     * @param int $userId
     * @param int $productId
     * @return bool
     */
    public function hasPurchased(int $userId, int $productId): bool
    {
        $sql = "SELECT 1 FROM {$this->table} od
                JOIN orders o ON od.order_id = o.id
                WHERE o.buyer_id = ? 
                AND od.product_id = ? 
                AND o.status = '" . Order::STATUS_COMPLETED . "'
                LIMIT 1";

        return $this->db->fetchOne($sql, [$userId, $productId]) !== null;
    }

    /**
     * Tính tổng số lượng đã bán của sản phẩm
     * 
     * @param int $productId
     * @return int
     */
    public function getTotalSold(int $productId): int
    {
        $sql = "SELECT COALESCE(SUM(od.quantity), 0) AS total 
                FROM {$this->table} od
                JOIN orders o ON od.order_id = o.id
                WHERE od.product_id = ? 
                AND o.status IN ('" . Order::STATUS_COMPLETED . "', '" . Order::STATUS_RECEIVED . "', '" . Order::STATUS_TRIAL_PERIOD . "')";

        $result = $this->db->fetchOne($sql, [$productId]);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Lấy top sản phẩm bán chạy
     * 
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getTopSellingProducts(int $limit = 10): array
    {
        $sql = "SELECT 
                    p.id, 
                    p.name, 
                    p.image, 
                    p.price,
                    SUM(od.quantity) AS total_sold,
                    SUM(od.quantity * od.price_at_purchase) AS total_revenue
                FROM {$this->table} od
                JOIN orders o ON od.order_id = o.id
                JOIN products p ON od.product_id = p.id
                WHERE o.status IN ('" . Order::STATUS_COMPLETED . "', '" . Order::STATUS_RECEIVED . "', '" . Order::STATUS_TRIAL_PERIOD . "')
                GROUP BY p.id
                ORDER BY total_sold DESC
                LIMIT ?";

        return $this->db->fetchAll($sql, [$limit]);
    }

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Thêm item vào order
     * 
     * @param int $orderId
     * @param int $productId
     * @param int $quantity
     * @param float $price
     * @return int OrderItem ID
     */
    public function addItem(int $orderId, int $productId, int $quantity, float $price): int
    {
        $sql = "INSERT INTO {$this->table} (order_id, product_id, quantity, price_at_purchase) 
                VALUES (?, ?, ?, ?)";

        return $this->db->insert($sql, [$orderId, $productId, $quantity, $price]);
    }

    /**
     * Thêm nhiều items cùng lúc
     * 
     * @param int $orderId
     * @param array<array{product_id: int, quantity: int, price: float}> $items
     * @return void
     */
    public function addMultiple(int $orderId, array $items): void
    {
        foreach ($items as $item) {
            $this->addItem(
                $orderId,
                (int) $item['product_id'],
                (int) $item['quantity'],
                (float) $item['price']
            );
        }
    }
}
