<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Cart Model
 * 
 * Quản lý giỏ hàng của users.
 * Sử dụng composite key (user_id, product_id).
 * Hỗ trợ merge session cart → database cart khi đăng nhập.
 * 
 * @package App\Models
 */
class Cart extends BaseModel
{
    /** @var string */
    protected $table = 'carts';

    /** @var array<string> */
    protected array $fillable = [
        'user_id',
        'product_id',
        'quantity',
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy tất cả items trong giỏ hàng của user
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId): array
    {
        $sql = "SELECT c.*, 
                    p.id AS product_id, 
                    p.name AS product_name, 
                    p.price, 
                    p.image, 
                    p.quantity AS stock,
                    p.status AS product_status,
                    p.user_id AS seller_id,
                    seller.full_name AS seller_name
                FROM {$this->table} c
                JOIN products p ON c.product_id = p.id
                LEFT JOIN users seller ON p.user_id = seller.id
                WHERE c.user_id = ?
                ORDER BY c.created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Lấy một item cụ thể trong giỏ
     * 
     * @param int $userId
     * @param int $productId
     * @return array<string, mixed>|null
     */
    public function getItem(int $userId, int $productId): ?array
    {
        $sql = "SELECT c.*, p.name, p.price, p.image, p.quantity AS stock
                FROM {$this->table} c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ? AND c.product_id = ?";

        return $this->db->fetchOne($sql, [$userId, $productId]) ?: null;
    }

    /**
     * Đếm số loại sản phẩm trong giỏ
     * 
     * @param int $userId
     * @return int
     */
    public function countItems(int $userId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE user_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);

        return (int) ($result['total'] ?? 0);
    }

    /**
     * Đếm tổng số lượng sản phẩm
     * 
     * @param int $userId
     * @return int
     */
    public function countTotalQuantity(int $userId): int
    {
        $sql = "SELECT COALESCE(SUM(quantity), 0) AS total FROM {$this->table} WHERE user_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);

        return (int) ($result['total'] ?? 0);
    }

    /**
     * Tính tổng tiền giỏ hàng
     * 
     * @param int $userId
     * @return float
     */
    public function getTotal(int $userId): float
    {
        $sql = "SELECT COALESCE(SUM(c.quantity * p.price), 0) AS total
                FROM {$this->table} c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?";

        $result = $this->db->fetchOne($sql, [$userId]);
        return (float) ($result['total'] ?? 0);
    }

    // =========================================================================
    // CRUD METHODS
    // =========================================================================

    /**
     * Thêm sản phẩm vào giỏ (hoặc tăng số lượng nếu đã có)
     * 
     * Sử dụng UPSERT pattern với ON DUPLICATE KEY UPDATE.
     * 
     * @param int $userId
     * @param int $productId
     * @param int $quantity
     * @return bool
     */
    public function addItem(int $userId, int $productId, int $quantity = 1): bool
    {
        // Validate quantity
        if ($quantity <= 0) {
            return false;
        }

        $sql = "INSERT INTO {$this->table} (user_id, product_id, quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = quantity + ?";

        return $this->db->execute($sql, [$userId, $productId, $quantity, $quantity]) !== false;
    }

    /**
     * Cập nhật số lượng sản phẩm
     * 
     * @param int $userId
     * @param int $productId
     * @param int $quantity
     * @return bool
     */
    public function updateQuantity(int $userId, int $productId, int $quantity): bool
    {
        if ($quantity <= 0) {
            return $this->removeItem($userId, $productId);
        }

        $sql = "UPDATE {$this->table} SET quantity = ? WHERE user_id = ? AND product_id = ?";
        return $this->db->execute($sql, [$quantity, $userId, $productId]) !== false;
    }

    /**
     * Xóa sản phẩm khỏi giỏ
     * 
     * @param int $userId
     * @param int $productId
     * @return bool
     */
    public function removeItem(int $userId, int $productId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE user_id = ? AND product_id = ?";
        return $this->db->execute($sql, [$userId, $productId]) !== false;
    }

    /**
     * Xóa toàn bộ giỏ hàng
     * 
     * @param int $userId
     * @return bool
     */
    public function clearCart(int $userId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE user_id = ?";
        return $this->db->execute($sql, [$userId]) !== false;
    }

    // =========================================================================
    // SESSION MERGE
    // =========================================================================

    /**
     * Merge giỏ hàng từ Session vào Database (khi đăng nhập)
     * 
     * Chỉ merge các sản phẩm còn tồn tại và còn hàng.
     * 
     * @param int $userId
     * @param array<int, array{quantity: int}> $sessionCart [product_id => ['quantity' => n], ...]
     * @return int Số items đã merge thành công
     */
    public function mergeFromSession(int $userId, array $sessionCart): int
    {
        if (empty($sessionCart)) {
            return 0;
        }

        $mergedCount = 0;
        $productIds = array_keys($sessionCart);

        // Batch check products exist (tránh N+1)
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $sql = "SELECT id FROM products WHERE id IN ({$placeholders}) AND status = '" . Product::STATUS_ACTIVE . "'";
        $existingProducts = $this->db->fetchAll($sql, $productIds);
        $existingIds = array_column($existingProducts, 'id');

        foreach ($sessionCart as $productId => $item) {
            // Chỉ merge nếu sản phẩm tồn tại
            if (in_array($productId, $existingIds, false)) {
                $quantity = (int) ($item['quantity'] ?? 1);
                if ($this->addItem($userId, (int) $productId, $quantity)) {
                    $mergedCount++;
                }
            }
        }

        return $mergedCount;
    }

    // =========================================================================
    // VALIDATION HELPERS
    // =========================================================================

    /**
     * Kiểm tra và loại bỏ các items không hợp lệ (sản phẩm đã xóa hoặc hết hàng)
     * 
     * @param int $userId
     * @return int Số items đã xóa
     */
    public function removeInvalidItems(int $userId): int
    {
        // Xóa items có product không tồn tại hoặc không active
        $sql = "DELETE c FROM {$this->table} c
                LEFT JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ? 
                AND (p.id IS NULL OR p.status != '" . Product::STATUS_ACTIVE . "')";

        return $this->db->execute($sql, [$userId]);
    }

    /**
     * Validate stock trước khi checkout
     * 
     * @param int $userId
     * @return array<int, array{product_id: int, product_name: string, requested: int, available: int}>
     */
    public function validateStock(int $userId): array
    {
        $sql = "SELECT c.product_id, p.name AS product_name, c.quantity AS requested, p.quantity AS available
                FROM {$this->table} c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ? AND c.quantity > p.quantity";

        return $this->db->fetchAll($sql, [$userId]);
    }
}
