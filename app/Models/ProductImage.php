<?php

declare(strict_types=1);

namespace App\Models;

/**
 * ProductImage Model
 * 
 * Quản lý ảnh sản phẩm (multi-image support).
 * Mỗi product có thể có nhiều ảnh, 1 ảnh chính (is_primary).
 * 
 * @package App\Models
 */
class ProductImage extends BaseModel
{
    /** @var string */
    protected $table = 'product_images';

    /** @var array<string> */
    protected array $fillable = [
        'product_id',
        'image_path',
        'is_primary',
        'sort_order',
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy tất cả ảnh của sản phẩm
     * 
     * @param int $productId
     * @return array<int, array<string, mixed>>
     */
    public function getByProductId(int $productId): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE product_id = ? 
                ORDER BY is_primary DESC, sort_order ASC";

        return $this->db->fetchAll($sql, [$productId]);
    }

    /**
     * Lấy ảnh chính của sản phẩm
     * 
     * @param int $productId
     * @return array<string, mixed>|null
     */
    public function getPrimary(int $productId): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE product_id = ? AND is_primary = 1 LIMIT 1";
        return $this->db->fetchOne($sql, [$productId]) ?: null;
    }

    /**
     * Lấy đường dẫn ảnh chính
     * 
     * @param int $productId
     * @return string|null
     */
    public function getPrimaryPath(int $productId): ?string
    {
        $primary = $this->getPrimary($productId);
        return $primary['image_path'] ?? null;
    }

    /**
     * Đếm số ảnh của sản phẩm
     * 
     * @param int $productId
     * @return int
     */
    public function countByProductId(int $productId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE product_id = ?";
        $result = $this->db->fetchOne($sql, [$productId]);

        return (int) ($result['total'] ?? 0);
    }

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Thêm ảnh cho sản phẩm
     * 
     * @param int $productId
     * @param string $imagePath
     * @param bool $isPrimary
     * @param int $sortOrder
     * @return int Image ID
     */
    public function addImage(int $productId, string $imagePath, bool $isPrimary = false, int $sortOrder = 0): int
    {
        $sql = "INSERT INTO {$this->table} (product_id, image_path, is_primary, sort_order) 
                VALUES (?, ?, ?, ?)";

        return $this->db->insert($sql, [$productId, $imagePath, $isPrimary ? 1 : 0, $sortOrder]);
    }

    /**
     * Thêm nhiều ảnh cùng lúc
     * 
     * Ảnh đầu tiên sẽ là ảnh chính nếu chưa có ảnh nào.
     * 
     * @param int $productId
     * @param array<string> $imagePaths
     * @return void
     */
    public function addMultiple(int $productId, array $imagePaths): void
    {
        if (empty($imagePaths)) {
            return;
        }

        // Kiểm tra xem đã có ảnh chính chưa
        $hasPrimary = $this->getPrimary($productId) !== null;

        foreach ($imagePaths as $index => $path) {
            $isPrimary = !$hasPrimary && $index === 0;
            $this->addImage($productId, $path, $isPrimary, $index);
        }
    }

    // =========================================================================
    // UPDATE METHODS
    // =========================================================================

    /**
     * Đặt ảnh làm ảnh chính
     * 
     * @param int $productId
     * @param int $imageId
     * @return bool
     */
    public function setPrimary(int $productId, int $imageId): bool
    {
        // Bỏ primary cũ
        $this->db->execute(
            "UPDATE {$this->table} SET is_primary = 0 WHERE product_id = ?",
            [$productId]
        );

        // Set primary mới
        $sql = "UPDATE {$this->table} SET is_primary = 1 WHERE id = ? AND product_id = ?";
        return $this->db->execute($sql, [$imageId, $productId]) !== false;
    }

    /**
     * Cập nhật thứ tự ảnh
     * 
     * @param int $imageId
     * @param int $sortOrder
     * @return bool
     */
    public function updateSortOrder(int $imageId, int $sortOrder): bool
    {
        $sql = "UPDATE {$this->table} SET sort_order = ? WHERE id = ?";
        return $this->db->execute($sql, [$sortOrder, $imageId]) !== false;
    }

    // =========================================================================
    // DELETE METHODS
    // =========================================================================

    /**
     * Xóa ảnh theo ID
     * 
     * @param int $imageId
     * @param int|null $productId Optional: kiểm tra ownership
     * @return bool
     */
    public function deleteImage(int $imageId, ?int $productId = null): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $params = [$imageId];

        if ($productId !== null) {
            $sql .= " AND product_id = ?";
            $params[] = $productId;
        }

        return $this->db->execute($sql, $params) !== false;
    }

    /**
     * Xóa tất cả ảnh của sản phẩm
     * 
     * @param int $productId
     * @return bool
     */
    public function deleteByProductId(int $productId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE product_id = ?";
        return $this->db->execute($sql, [$productId]) !== false;
    }
}
