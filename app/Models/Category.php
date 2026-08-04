<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\RedisCache;

/**
 * Category Model
 * 
 * Quản lý danh mục sản phẩm với hỗ trợ cấu trúc cây (parent-child).
 * Sử dụng Redis cache để tối ưu performance cho dữ liệu ít thay đổi.
 * 
 * @package App\Models
 */
class Category extends BaseModel
{
    /** @var string */
    protected $table = 'categories';

    /** @var string Cache key prefix */
    private const CACHE_KEY = 'categories_all_v2';

    /** @var int Cache TTL in seconds (5 minutes) */
    private const CACHE_TTL = 300;

    /** @var array<string> Các cột được phép mass-assign */
    protected array $fillable = [
        'name',
        'icon',
        'description',
        'parent_id',
        'sort_order'
    ];

    // =========================================================================
    // PUBLIC QUERY METHODS
    // =========================================================================

    /**
     * Lấy tất cả categories với Redis cache
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getAll(): array
    {
        $redis = RedisCache::getInstance();

        if ($redis->isAvailable()) {
            $cached = $redis->get(self::CACHE_KEY);
            if ($cached !== null) {
                return $cached;
            }
        }

        $categories = $this->fetchAllOrdered();

        if ($redis->isAvailable()) {
            $redis->set(self::CACHE_KEY, $categories, self::CACHE_TTL);
        }

        return $categories;
    }

    /**
     * Lấy cấu trúc cây danh mục (parent → children)
     * 
     * Sử dụng HashMap lookup để đạt O(n) thay vì O(n²)
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getTree(): array
    {
        $all = $this->getAll();

        // Indexed lookup map - O(1) access
        $parentMap = [];
        $orphanChildren = [];

        foreach ($all as $category) {
            $category['children'] = [];
            $id = (int) $category['id'];
            $parentId = $category['parent_id'];

            if (empty($parentId)) {
                $parentMap[$id] = $category;
            } else {
                $orphanChildren[] = $category;
            }
        }

        // Assign children to parents - O(n) với HashMap lookup
        foreach ($orphanChildren as $child) {
            $parentId = (int) $child['parent_id'];
            if (isset($parentMap[$parentId])) {
                $parentMap[$parentId]['children'][] = $child;
            }
        }

        return array_values($parentMap);
    }

    /**
     * Lấy các danh mục cha (root categories)
     * 
     * @param int $limit Số lượng tối đa
     * @return array<int, array<string, mixed>>
     */
    public function getParents(int $limit = 20): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE parent_id IS NULL 
                ORDER BY sort_order ASC, id DESC 
                LIMIT ?";

        return $this->db->fetchAll($sql, [$limit]);
    }

    /**
     * Lấy danh sách ID của danh mục và tất cả danh mục con
     * 
     * Hữu ích để filter sản phẩm theo danh mục (bao gồm cả sub-categories)
     * 
     * @param int $parentId ID danh mục cha
     * @return array<int> Mảng các ID
     */
    public function getChildrenIds(int $parentId): array
    {
        $all = $this->getAll();
        $ids = [$parentId];

        foreach ($all as $category) {
            if (isset($category['parent_id']) && (int) $category['parent_id'] === $parentId) {
                $ids[] = (int) $category['id'];
            }
        }

        return array_unique($ids);
    }

    /**
     * Lấy danh mục con trực tiếp của một category
     * 
     * @param int $parentId
     * @return array<int, array<string, mixed>>
     */
    public function getChildren(int $parentId): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE parent_id = ? 
                ORDER BY sort_order ASC, name ASC";

        return $this->db->fetchAll($sql, [$parentId]);
    }

    /**
     * Lấy tất cả categories với thông tin children (cho sidebar)
     * 
     * @return array<int, array<string, mixed>>
     */
    public function getWithChildren(): array
    {
        return $this->getTree();
    }

    /**
     * Đếm số sản phẩm trong một category
     * 
     * @param int $categoryId
     * @return int
     */
    public function countProducts(int $categoryId): int
    {
        $sql = "SELECT COUNT(*) as total FROM products WHERE category_id = ?";
        $result = $this->db->fetchOne($sql, [$categoryId]);

        return (int) ($result['total'] ?? 0);
    }

    // =========================================================================
    // CRUD OPERATIONS (Override để xử lý cache)
    // =========================================================================

    /**
     * Tạo category mới
     * 
     * @param array<string, mixed> $data
     * @return int ID của category mới
     */
    public function create(array $data): int
    {
        $id = parent::create($data);
        $this->clearCache();

        return $id;
    }

    /**
     * Cập nhật category
     * 
     * @param int $id
     * @param array<string, mixed> $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $result = parent::update($id, $data);

        if ($result) {
            $this->clearCache();
        }

        return $result;
    }

    /**
     * Xóa category
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $result = parent::delete($id);

        if ($result) {
            $this->clearCache();
        }

        return $result;
    }

    // =========================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================

    /**
     * Fetch tất cả categories từ DB với ordering
     * 
     * @return array<int, array<string, mixed>>
     */
    private function fetchAllOrdered(): array
    {
        $sql = "SELECT * FROM {$this->table} ORDER BY sort_order ASC, id ASC";
        return $this->db->fetchAll($sql);
    }

    /**
     * Xóa cache khi dữ liệu thay đổi
     */
    private function clearCache(): void
    {
        $redis = RedisCache::getInstance();

        if ($redis->isAvailable()) {
            $redis->delete(self::CACHE_KEY);
        }
    }
}