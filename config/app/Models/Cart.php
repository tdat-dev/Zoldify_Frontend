<?php

namespace App\Models;

class Cart extends BaseModel
{
    protected $table = 'carts';

    /**
     * Lấy tất cả sản phẩm trong giỏ hàng của user
     */
    public function getByUserId($userId)
    {
        $sql = "
            SELECT c.*, p.name, p.price, p.image, p.quantity as stock
            FROM {$this->table} c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        ";
        return $this->db->query($sql, [$userId])->fetchAll();
    }

    /**
     * Thêm sản phẩm vào giỏ (hoặc tăng số lượng nếu đã có)
     */
    public function addItem($userId, $productId, $quantity = 1)
    {
        $sql = "
            INSERT INTO {$this->table} (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?
        ";
        return $this->db->query($sql, [$userId, $productId, $quantity, $quantity]);
    }

    /**
     * Cập nhật số lượng sản phẩm
     */
    public function updateQuantity($userId, $productId, $quantity)
    {
        if ($quantity <= 0) {
            return $this->removeItem($userId, $productId);
        }

        $sql = "UPDATE {$this->table} SET quantity = ? WHERE user_id = ? AND product_id = ?";
        return $this->db->query($sql, [$quantity, $userId, $productId]);
    }

    /**
     * Xóa sản phẩm khỏi giỏ
     */
    public function removeItem($userId, $productId)
    {
        $sql = "DELETE FROM {$this->table} WHERE user_id = ? AND product_id = ?";
        return $this->db->query($sql, [$userId, $productId]);
    }

    /**
     * Xóa toàn bộ giỏ hàng của user
     */
    public function clearCart($userId)
    {
        $sql = "DELETE FROM {$this->table} WHERE user_id = ?";
        return $this->db->query($sql, [$userId]);
    }

    /**
     * Đếm số lượng sản phẩm trong giỏ
     */
    public function countItems($userId)
    {
        $sql = "SELECT SUM(quantity) as total FROM {$this->table} WHERE user_id = ?";
        $result = $this->db->query($sql, [$userId])->fetch();
        return $result['total'] ?? 0;
    }

    /**
     * Tính tổng tiền giỏ hàng
     */
    public function getTotal($userId)
    {
        $sql = "
            SELECT SUM(c.quantity * p.price) as total
            FROM {$this->table} c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ";
        $result = $this->db->query($sql, [$userId])->fetch();
        return $result['total'] ?? 0;
    }

    /**
     * Merge giỏ hàng từ Session vào Database (khi đăng nhập)
     */
    public function mergeFromSession($userId, $sessionCart)
    {
        if (empty($sessionCart)) {
            return;
        }

        foreach ($sessionCart as $productId => $item) {
            $quantity = $item['quantity'] ?? 1;
            $this->addItem($userId, $productId, $quantity);
        }
    }
}
