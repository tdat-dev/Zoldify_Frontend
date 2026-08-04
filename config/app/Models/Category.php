<?php
namespace App\Models;

use App\Core\RedisCache;

class Category extends BaseModel
{
    protected $table = 'categories';

    public function getAll()
    {
        $cacheKey = 'categories_all';
        $cacheTTL = 300; // 5 phút (categories ít thay đổi)

        // Thử dùng Redis cache
        $redis = RedisCache::getInstance();

        if ($redis->isAvailable()) {
            $categories = $redis->get($cacheKey);

            if ($categories === null) {
                // Cache miss → Query DB
                $categories = $this->db->query("SELECT * FROM " . $this->table)->fetchAll();

                // Lưu vào Redis
                $redis->set($cacheKey, $categories, $cacheTTL);
            }

            return $categories;
        }

        // Fallback: Redis không khả dụng → Query trực tiếp
        return $this->db->query("SELECT * FROM " . $this->table)->fetchAll();
    }
}
