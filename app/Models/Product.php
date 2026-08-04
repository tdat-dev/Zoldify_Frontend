<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\RedisCache;

/**
 * Product Model
 * 
 * Quản lý sản phẩm trong marketplace.
 * Hỗ trợ: CRUD, search, filter, pagination, caching.
 * 
 * @package App\Models
 */
class Product extends BaseModel
{
    /** @var string */
    protected $table = 'products';

    /** @var array<string> */
    protected array $fillable = [
        'name',
        'price',
        'description',
        'user_id',
        'category_id',
        'image',
        'quantity',
        'status',
        'product_condition',
        'view_count',
        'is_freeship',
    ];



    /** @var array<string> Product statuses */
    public const STATUS_ACTIVE = 'active';
    public const STATUS_HIDDEN = 'hidden';
    public const STATUS_SOLD = 'sold';
    public const STATUS_DELETED = 'deleted';

    /** @var array<string> Product conditions */
    public const CONDITION_NEW = 'new';
    public const CONDITION_LIKE_NEW = 'like_new';
    public const CONDITION_GOOD = 'good';
    public const CONDITION_FAIR = 'fair';
    public const CONDITION_POOR = 'poor';

    /** @var int Shipping payer options */
    public const SHIP_PAYER_SELLER = 1; // Freeship
    public const SHIP_PAYER_BUYER = 0;  // Buyer pays

    /**
     * Get all product conditions with details
     * @return array
     */
    public static function getConditions(): array
    {
        return [
            self::CONDITION_NEW => [
                'label' => 'Mới 100%',
                'description' => 'Nguyên seal, chưa sử dụng',
                'icon' => 'fa-solid fa-certificate',
                'color_bg' => 'bg-blue-50',
                'color_text' => 'text-blue-500',
                'hover_bg' => 'group-hover:bg-indigo-500',
            ],
            self::CONDITION_LIKE_NEW => [
                'label' => 'Như mới',
                'description' => 'Mới 99%, mở hộp chưa dùng',
                'icon' => 'fa-solid fa-star',
                'color_bg' => 'bg-teal-50',
                'color_text' => 'text-teal-500',
                'hover_bg' => 'group-hover:bg-indigo-500',
            ],
            self::CONDITION_GOOD => [
                'label' => 'Tốt',
                'description' => 'Dùng tốt, xước nhẹ',
                'icon' => 'fa-regular fa-thumbs-up',
                'color_bg' => 'bg-green-50',
                'color_text' => 'text-green-500',
                'hover_bg' => 'group-hover:bg-indigo-500',
            ],
            self::CONDITION_FAIR => [
                'label' => 'Trung bình',
                'description' => 'Ngoại hình cũ, còn dùng tốt',
                'icon' => 'fa-solid fa-layer-group',
                'color_bg' => 'bg-orange-50',
                'color_text' => 'text-orange-500',
                'hover_bg' => 'group-hover:bg-indigo-500',
            ],
            self::CONDITION_POOR => [
                'label' => 'Xác/Linh kiện',
                'description' => 'Hỏng, bán lấy đồ',
                'icon' => 'fa-solid fa-screwdriver-wrench',
                'color_bg' => 'bg-slate-100',
                'color_text' => 'text-slate-500',
                'hover_bg' => 'group-hover:bg-slate-600',
            ],
        ];
    }

    /** @var string Cache key prefix */
    private const CACHE_PREFIX = 'products_';

    /** @var int Cache TTL in seconds */
    private const CACHE_TTL = 300;

    // =========================================================================
    // QUERY METHODS - SINGLE
    // =========================================================================

    /**
     * Lấy 1 sản phẩm theo ID với sold_count
     * 
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function find(int $id): ?array
    {
        if ($id <= 0) {
            return null;
        }

        $sql = "SELECT p.*, 
                    c.name AS category_name,
                    u.full_name AS seller_name,
                    u.avatar AS seller_avatar,
                    {$this->getSoldCountSubquery()} AS sold_count
                FROM {$this->table} p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.id = ?";

        return $this->db->fetchOne($sql, [$id]) ?: null;
    }

    /**
     * Lấy sản phẩm cơ bản (không JOIN)
     * 
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function findBasic(int $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        return $this->db->fetchOne($sql, [$id]) ?: null;
    }

    // =========================================================================
    // QUERY METHODS - LISTING
    // =========================================================================

    /**
     * Lấy sản phẩm mới nhất (có cache)
     * 
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getLatest(int $limit = 12): array
    {
        $cacheKey = self::CACHE_PREFIX . "latest_{$limit}";

        $redis = RedisCache::getInstance();
        if ($redis->isAvailable()) {
            $cached = $redis->get($cacheKey);
            if ($cached !== null) {
                return $cached;
            }
        }

        $sql = "SELECT p.*, {$this->getSoldCountSubquery()} AS sold_count
                FROM {$this->table} p
                WHERE p.status = ? AND p.quantity > 0
                ORDER BY p.id DESC 
                LIMIT ?";

        $products = $this->db->fetchAll($sql, [self::STATUS_ACTIVE, $limit]);

        if ($redis->isAvailable()) {
            $redis->set($cacheKey, $products, self::CACHE_TTL);
        }

        return $products;
    }

    /**
     * Lấy sản phẩm ngẫu nhiên
     * 
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getRandom(int $limit = 12): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status = ? AND quantity > 0
                ORDER BY RAND() 
                LIMIT ?";

        return $this->db->fetchAll($sql, [self::STATUS_ACTIVE, $limit]);
    }

    /**
     * Lấy sản phẩm phổ biến (view_count cao nhất)
     * 
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getPopular(int $limit = 12): array
    {
        $sql = "SELECT p.*, {$this->getSoldCountSubquery()} AS sold_count
                FROM {$this->table} p
                WHERE p.status = ? AND p.quantity > 0
                ORDER BY p.view_count DESC 
                LIMIT ?";

        return $this->db->fetchAll($sql, [self::STATUS_ACTIVE, $limit]);
    }

    /**
     * Lấy sản phẩm theo top keywords phổ biến
     * 
     * Tìm các sản phẩm match với keywords được tìm nhiều nhất.
     * 
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getByTopKeywords(int $limit = 6): array
    {
        // Lấy top keywords được tìm kiếm nhiều nhất (đã filter keywords xấu)
        $keywordModel = new SearchKeyword();
        $topKeywords = $keywordModel->getTopKeywords(15);

        if (empty($topKeywords)) {
            // Fallback: trả về sản phẩm phổ biến nếu chưa có ai tìm kiếm
            return $this->getPopular($limit);
        }

        $products = [];
        $foundIds = [];

        // Duyệt qua từng keyword và tìm sản phẩm match
        foreach ($topKeywords as $kw) {
            if (count($products) >= $limit) {
                break;
            }

            $keyword = trim($kw['keyword']);
            if (empty($keyword))
                continue;

            // Tìm sản phẩm có tên chứa keyword này
            $excludeClause = '';
            $params = [
                'status' => self::STATUS_ACTIVE,
                'keyword1' => '%' . $keyword . '%',
                'keyword2' => '%' . $keyword . '%',
                'limit' => 2 // Lấy tối đa 2 sản phẩm mỗi keyword để đa dạng
            ];

            if (!empty($foundIds)) {
                $placeholders = [];
                foreach ($foundIds as $i => $id) {
                    $placeholders[] = ":exclude_$i";
                    $params["exclude_$i"] = $id;
                }
                $excludeClause = "AND p.id NOT IN (" . implode(',', $placeholders) . ")";
            }

            $sql = "SELECT p.* FROM products p
                    WHERE p.status = :status
                      AND p.quantity > 0
                      AND (p.name LIKE :keyword1 OR p.description LIKE :keyword2)
                      $excludeClause
                    ORDER BY p.view_count DESC
                    LIMIT :limit";

            $matched = $this->db->fetchAll($sql, $params);

            foreach ($matched as $product) {
                if (count($products) >= $limit)
                    break;
                if (!in_array($product['id'], $foundIds)) {
                    $products[] = $product;
                    $foundIds[] = $product['id'];
                }
            }
        }

        // Nếu vẫn chưa đủ, bù thêm sản phẩm phổ biến
        if (count($products) < $limit) {
            $needed = $limit - count($products);

            $excludeClause = '';
            $params = [
                'status' => self::STATUS_ACTIVE,
                'needed' => $needed
            ];

            if (!empty($foundIds)) {
                $placeholders = [];
                foreach ($foundIds as $i => $id) {
                    $placeholders[] = ":exclude_$i";
                    $params["exclude_$i"] = $id;
                }
                $excludeClause = "AND id NOT IN (" . implode(',', $placeholders) . ")";
            }

            $sql = "SELECT * FROM products 
                    WHERE status = :status AND quantity > 0 $excludeClause 
                    ORDER BY view_count DESC 
                    LIMIT :needed";

            $moreProducts = $this->db->fetchAll($sql, $params);
            $products = array_merge($products, $moreProducts);
        }

        return $products;
    }

    /**
     * Lấy sản phẩm theo user (seller's shop)
     * 
     * @param int $userId
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId, int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT p.*, {$this->getSoldCountSubquery()} AS sold_count
                FROM {$this->table} p
                WHERE p.user_id = ? 
                ORDER BY p.created_at DESC 
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$userId, $limit, $offset]);
    }

    /**
     * Lấy sản phẩm theo category
     * 
     * @param int $categoryId
     * @param int $limit
     * @param int|null $excludeId Exclude product ID
     * @return array<int, array<string, mixed>>
     */
    public function getByCategory(int $categoryId, int $limit = 4, ?int $excludeId = null): array
    {
        $sql = "SELECT p.*, {$this->getSoldCountSubquery()} AS sold_count
                FROM {$this->table} p
                WHERE p.category_id = ? AND p.status = ?";

        $params = [$categoryId, self::STATUS_ACTIVE];

        if ($excludeId !== null) {
            $sql .= " AND p.id != ?";
            $params[] = $excludeId;
        }

        $sql .= " ORDER BY RAND() LIMIT ?";
        $params[] = $limit;

        return $this->db->fetchAll($sql, $params);
    }

    // =========================================================================
    // SEARCH & FILTER (Shopee/Lazada Style)
    // =========================================================================

    /**
     * Tìm kiếm sản phẩm với relevance scoring (giống Shopee/Lazada)
     * 
     * Features:
     * - Tìm trong cả name VÀ description
     * - Relevance scoring: exact match > word start > contains
     * - Tokenize keyword để tìm từng từ
     * - Sort by relevance mặc định
     * 
     * @param string $keyword
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function searchByKeyword(string $keyword, int $limit = 20, int $offset = 0): array
    {
        $keyword = trim($keyword);
        if (empty($keyword)) {
            return $this->getPaginated($limit, $offset);
        }

        // Thử FULLTEXT search trước (nhanh hơn 10-100x)
        $fulltextResult = $this->searchWithFulltext($keyword, $limit, $offset);
        if ($fulltextResult !== null) {
            return $fulltextResult;
        }

        // Fallback: LIKE search (chậm hơn nhưng luôn hoạt động)
        return $this->searchWithLike($keyword, $limit, $offset);
    }

    /**
     * FULLTEXT search - Cực nhanh cho text search
     * 
     * @return array|null Null nếu FULLTEXT không available
     */
    private function searchWithFulltext(string $keyword, int $limit, int $offset): ?array
    {
        try {
            // MATCH AGAINST với BOOLEAN MODE cho phép +word (phải có), -word (không có)
            $sql = "SELECT p.*, 
                        {$this->getSoldCountSubquery()} AS sold_count,
                        MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance_score
                    FROM {$this->table} p
                    WHERE p.status = ? 
                    AND MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)
                    ORDER BY relevance_score DESC, sold_count DESC
                    LIMIT ? OFFSET ?";

            return $this->db->fetchAll($sql, [$keyword, self::STATUS_ACTIVE, $keyword, $limit, $offset]);
        } catch (\Exception $e) {
            // FULLTEXT index không tồn tại → fallback về LIKE
            return null;
        }
    }

    /**
     * LIKE search - Chậm hơn nhưng luôn hoạt động
     */
    private function searchWithLike(string $keyword, int $limit, int $offset): array
    {
        $tokens = $this->tokenizeKeyword($keyword);
        $relevanceScore = $this->buildRelevanceScore($keyword, $tokens);
        $searchConditions = $this->buildSearchConditions($tokens);

        $sql = "SELECT p.*, 
                    {$this->getSoldCountSubquery()} AS sold_count,
                    ({$relevanceScore}) AS relevance_score
                FROM {$this->table} p
                WHERE p.status = ? AND ({$searchConditions['sql']})
                ORDER BY relevance_score DESC, sold_count DESC
                LIMIT ? OFFSET ?";

        $params = array_merge(
            [self::STATUS_ACTIVE],
            $searchConditions['params'],
            [$limit, $offset]
        );

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Đếm sản phẩm theo keyword (search trong name + description)
     */
    public function countByKeyword(string $keyword): int
    {
        $keyword = trim($keyword);
        if (empty($keyword)) {
            return $this->countActive();
        }

        $tokens = $this->tokenizeKeyword($keyword);
        $searchConditions = $this->buildSearchConditions($tokens);

        $sql = "SELECT COUNT(*) AS total FROM {$this->table} 
                WHERE status = ? AND ({$searchConditions['sql']})";

        $params = array_merge([self::STATUS_ACTIVE], $searchConditions['params']);
        $result = $this->db->fetchOne($sql, $params);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Lấy sản phẩm với filter nâng cao (Shopee/Lazada style)
     */
    public function getFiltered(array $filters, int $limit = 20, int $offset = 0): array
    {
        $keyword = trim($filters['keyword'] ?? '');
        $hasKeyword = !empty($keyword);

        // Tokenize keyword
        $tokens = $hasKeyword ? $this->tokenizeKeyword($keyword) : [];
        $relevanceScore = $hasKeyword ? $this->buildRelevanceScore($keyword, $tokens) : '0';
        $searchConditions = $hasKeyword ? $this->buildSearchConditions($tokens) : null;

        $sql = "SELECT p.*, 
                    {$this->getSoldCountSubquery()} AS sold_count
                    " . ($hasKeyword ? ", ({$relevanceScore}) AS relevance_score" : "") . "
                FROM {$this->table} p
                WHERE p.status = ? AND p.quantity > 0";
        $params = [self::STATUS_ACTIVE];

        // Filter by keyword (search in name + description)
        if ($searchConditions !== null) {
            $sql .= " AND ({$searchConditions['sql']})";
            $params = array_merge($params, $searchConditions['params']);
        }

        // Filter by category (include children)
        if (!empty($filters['category_id'])) {
            if (is_array($filters['category_id'])) {
                $placeholders = implode(',', array_fill(0, count($filters['category_id']), '?'));
                $sql .= " AND p.category_id IN ({$placeholders})";
                $params = array_merge($params, array_map('intval', $filters['category_id']));
            } else {
                $sql .= " AND p.category_id = ?";
                $params[] = (int) $filters['category_id'];
            }
        }

        // Filter by condition (new, like_new, good, fair)
        if (!empty($filters['product_condition'])) {
            $sql .= " AND p.product_condition = ?";
            $params[] = $filters['product_condition'];
        }

        // Filter by price range
        if (!empty($filters['price_min'])) {
            $sql .= " AND p.price >= ?";
            $params[] = (int) $filters['price_min'];
        }
        if (!empty($filters['price_max'])) {
            $sql .= " AND p.price <= ?";
            $params[] = (int) $filters['price_max'];
        }

        // Filter by minimum rating (3, 4, or 5 stars)
        if (!empty($filters['rating'])) {
            $minRating = (int) $filters['rating'];
            if ($minRating >= 1 && $minRating <= 5) {
                $sql .= " AND (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) >= ?";
                $params[] = $minRating;
            }
        }

        // Smart Sort (giống Shopee)
        $sort = $filters['sort'] ?? ($hasKeyword ? 'relevance' : 'newest');
        $sql .= $this->buildSmartSortClause($sort, $hasKeyword);

        // Pagination
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Đếm sản phẩm với filter
     */
    public function countFiltered(array $filters): int
    {
        $keyword = trim($filters['keyword'] ?? '');
        $hasKeyword = !empty($keyword);
        $tokens = $hasKeyword ? $this->tokenizeKeyword($keyword) : [];
        $searchConditions = $hasKeyword ? $this->buildSearchConditions($tokens) : null;

        $sql = "SELECT COUNT(*) AS total FROM {$this->table} p WHERE p.status = ? AND p.quantity > 0";
        $params = [self::STATUS_ACTIVE];

        if ($searchConditions !== null) {
            $sql .= " AND ({$searchConditions['sql']})";
            $params = array_merge($params, $searchConditions['params']);
        }

        if (!empty($filters['category_id'])) {
            if (is_array($filters['category_id'])) {
                $placeholders = implode(',', array_fill(0, count($filters['category_id']), '?'));
                $sql .= " AND p.category_id IN ({$placeholders})";
                $params = array_merge($params, array_map('intval', $filters['category_id']));
            } else {
                $sql .= " AND p.category_id = ?";
                $params[] = (int) $filters['category_id'];
            }
        }

        if (!empty($filters['product_condition'])) {
            $sql .= " AND p.product_condition = ?";
            $params[] = $filters['product_condition'];
        }

        if (!empty($filters['price_min'])) {
            $sql .= " AND p.price >= ?";
            $params[] = (int) $filters['price_min'];
        }
        if (!empty($filters['price_max'])) {
            $sql .= " AND p.price <= ?";
            $params[] = (int) $filters['price_max'];
        }

        $result = $this->db->fetchOne($sql, $params);
        return (int) ($result['total'] ?? 0);
    }

    // =========================================================================
    // SEARCH HELPERS (Private)
    // =========================================================================

    /**
     * Tách keyword thành các token (từ)
     * 
     * @return array<string>
     */
    private function tokenizeKeyword(string $keyword): array
    {
        // Chuẩn hóa: lowercase, remove extra spaces
        $keyword = mb_strtolower(trim($keyword));
        $keyword = preg_replace('/\s+/', ' ', $keyword);

        // Tách thành các từ
        $tokens = explode(' ', $keyword);

        // Lọc từ rỗng và stopwords tiếng Việt
        $stopwords = ['và', 'hoặc', 'của', 'cho', 'với', 'trong', 'là', 'có', 'được', 'này'];
        $tokens = array_filter($tokens, fn($t) => strlen($t) >= 2 && !in_array($t, $stopwords));

        return array_values(array_unique($tokens));
    }

    /**
     * Build relevance score SQL
     * 
     * Scoring (ưu tiên từ cao xuống thấp):
     * - Phrase match in name (cụm từ nguyên vẹn): 200 points
     * - Exact match in name: 100 points
     * - Word starts with keyword in name: 50 points
     * - Contains keyword in name: 20 points
     * - Contains keyword in description: 5 points
     */
    private function buildRelevanceScore(string $keyword, array $tokens): string
    {
        $scores = [];
        $escapedKeyword = $this->escapeString($keyword);

        // Phrase match - cụm từ nguyên vẹn trong tên (ưu tiên cao nhất)
        $scores[] = "CASE WHEN LOWER(p.name) LIKE '%{$escapedKeyword}%' THEN 200 ELSE 0 END";

        // Exact match (full keyword = tên sản phẩm)
        $scores[] = "CASE WHEN LOWER(p.name) = LOWER('{$escapedKeyword}') THEN 100 ELSE 0 END";

        // Each token contributes to score
        foreach ($tokens as $token) {
            $escaped = $this->escapeString($token);
            // Starts with token in name (50 points)
            $scores[] = "CASE WHEN LOWER(p.name) LIKE '{$escaped}%' THEN 50 ELSE 0 END";
            // Contains token in name (20 points)
            $scores[] = "CASE WHEN LOWER(p.name) LIKE '%{$escaped}%' THEN 20 ELSE 0 END";
            // Contains in description (5 points)
            $scores[] = "CASE WHEN LOWER(p.description) LIKE '%{$escaped}%' THEN 5 ELSE 0 END";
        }

        return implode(' + ', $scores);
    }

    /**
     * Build search conditions (WHERE clause)
     * 
     * Tìm trong name HOẶC description
     * Yêu cầu TẤT CẢ tokens phải match (AND logic)
     * + Bonus: ưu tiên exact phrase match
     * 
     * @return array{sql: string, params: array}
     */
    private function buildSearchConditions(array $tokens): array
    {
        if (empty($tokens)) {
            return ['sql' => '1=1', 'params' => []];
        }

        $conditions = [];
        $params = [];

        // Điều kiện 1: Exact phrase match (tìm cụm từ nguyên vẹn)
        $fullKeyword = implode(' ', $tokens);
        $phraseCondition = "(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)";

        // Điều kiện 2: TẤT CẢ tokens phải match (AND logic)
        $tokenConditions = [];
        foreach ($tokens as $token) {
            // Mỗi token phải xuất hiện trong name HOẶC description
            $tokenConditions[] = "(LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)";
            $params[] = '%' . mb_strtolower($token) . '%';
            $params[] = '%' . mb_strtolower($token) . '%';
        }

        // Dùng AND: tất cả tokens phải match
        // Ví dụ: "ba lô" → (name LIKE '%ba%' OR desc LIKE '%ba%') AND (name LIKE '%lô%' OR desc LIKE '%lô%')
        $allTokensCondition = implode(' AND ', $tokenConditions);

        return [
            'sql' => $allTokensCondition,
            'params' => $params,
        ];
    }

    /**
     * Escape string for SQL LIKE
     */
    private function escapeString(string $str): string
    {
        return addslashes(mb_strtolower($str));
    }

    /**
     * Build smart sort clause (giống Shopee)
     */
    private function buildSmartSortClause(string $sort, bool $hasKeyword = false): string
    {
        return match ($sort) {
            'relevance' => $hasKeyword ? " ORDER BY relevance_score DESC, view_count DESC" : " ORDER BY view_count DESC",
            'popular' => " ORDER BY view_count DESC",
            'best_selling' => " ORDER BY sold_count DESC",
            'price_asc' => " ORDER BY p.price ASC",
            'price_desc' => " ORDER BY p.price DESC",
            'newest' => " ORDER BY p.created_at DESC",
            default => $hasKeyword ? " ORDER BY relevance_score DESC" : " ORDER BY p.id DESC",
        };
    }

    /**
     * Đếm số sản phẩm ACTIVE của một user (để hiển thị trên shop profile)
     */
    public function countActiveByUserId($userId): int
    {
        $sql = "SELECT COUNT(*) as total FROM products WHERE user_id = :user_id AND status = '" . self::STATUS_ACTIVE . "'";
        $result = $this->db->fetchOne($sql, ['user_id' => (int) $userId]);
        return $result['total'] ?? 0;
    }

    /**
     * Tăng lượt xem sản phẩm
     */
    public function incrementViews(int $id): bool
    {
        $sql = "UPDATE {$this->table} SET view_count = view_count + 1 WHERE id = ?";
        return $this->db->execute($sql, [$id]) !== false;
    }

    // =========================================================================
    // CRUD METHODS
    // =========================================================================

    /**
     * Tạo sản phẩm mới
     * 
     * @param array{
     *     name: string,
     *     price: float,
     *     description: string,
     *     user_id: int,
     *     category_id: int,
     *     image: string,
     *     quantity?: int
     * } $data
     * @return int Product ID
     */
    public function createProduct(array $data): int
    {
        $sql = "INSERT INTO {$this->table} 
                (name, price, description, user_id, category_id, image, quantity, status, product_condition) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $id = $this->db->insert($sql, [
            $data['name'],
            $data['price'],
            $data['description'],
            $data['user_id'],
            $data['category_id'],
            $data['image'],
            $data['quantity'] ?? 1,
            self::STATUS_ACTIVE,
            $data['product_condition'] ?? self::CONDITION_GOOD,
        ]);

        $this->clearCache();
        return $id;
    }

    /**
     * Cập nhật sản phẩm
     * 
     * @param int $id
     * @param array<string, mixed> $data
     * @return bool
     */
    public function updateProduct(int $id, array $data): bool
    {
        $allowedFields = ['name', 'price', 'quantity', 'description', 'category_id', 'status', 'image', 'product_condition'];

        $sets = [];
        $params = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "{$field} = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($sets)) {
            return false;
        }

        $params[] = $id;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE id = ?";

        $result = $this->db->execute($sql, $params) !== false;

        if ($result) {
            $this->clearCache();
        }

        return $result;
    }

    /**
     * Ẩn sản phẩm (soft delete)
     * 
     * @param int $id
     * @return bool
     */
    public function hideProduct(int $id): bool
    {
        return $this->updateProduct($id, ['status' => self::STATUS_HIDDEN]);
    }

    /**
     * Xóa sản phẩm (hard delete)
     * 
     * @param int $id
     * @return bool
     */
    public function deleteProduct(int $id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $result = $this->db->execute($sql, [$id]) !== false;

        if ($result) {
            $this->clearCache();
        }

        return $result;
    }

    // =========================================================================
    // INVENTORY MANAGEMENT
    // =========================================================================

    /**
     * Giảm số lượng tồn kho
     * 
     * @param int $id
     * @param int $amount
     * @return bool
     */
    public function decreaseQuantity(int $id, int $amount): bool
    {
        $sql = "UPDATE {$this->table} 
                SET quantity = quantity - ? 
                WHERE id = ? AND quantity >= ?";

        return $this->db->execute($sql, [$amount, $id, $amount]) > 0;
    }

    /**
     * Tăng số lượng tồn kho
     * 
     * @param int $id
     * @param int $amount
     * @return bool
     */
    public function increaseQuantity(int $id, int $amount): bool
    {
        $sql = "UPDATE {$this->table} SET quantity = quantity + ? WHERE id = ?";
        return $this->db->execute($sql, [$amount, $id]) !== false;
    }

    /**
     * Kiểm tra còn hàng không
     * 
     * @param int $id
     * @param int $quantity
     * @return bool
     */
    public function hasStock(int $id, int $quantity = 1): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE id = ? AND quantity >= ? AND status = ?";
        return $this->db->fetchOne($sql, [$id, $quantity, self::STATUS_ACTIVE]) !== null;
    }

    // =========================================================================
    // ADMIN METHODS
    // =========================================================================

    /**
     * Lấy tất cả products cho admin (có phân trang)
     * 
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getAllForAdmin(int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT p.*, 
                    c.name AS category_name, 
                    u.full_name AS seller_name,
                    u.email AS seller_email
                FROM {$this->table} p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [$limit, $offset]);
    }

    /**
     * Kiểm tra sản phẩm có đơn hàng không
     * 
     * @param int $id
     * @return bool
     */
    public function hasAnyOrder(int $id): bool
    {
        $sql = "SELECT 1 FROM order_details WHERE product_id = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$id]) !== null;
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    /**
     * Đếm sản phẩm active
     * 
     * @return int
     */
    public function countActive(): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE status = ?";
        $result = $this->db->fetchOne($sql, [self::STATUS_ACTIVE]);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Đếm sản phẩm của user
     * 
     * @param int $userId
     * @return int
     */
    public function countByUserId(int $userId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE user_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Đếm sản phẩm theo category
     * 
     * @param int $categoryId
     * @return int
     */
    public function countByCategory(int $categoryId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} 
                WHERE category_id = ? AND status = ?";
        $result = $this->db->fetchOne($sql, [$categoryId, self::STATUS_ACTIVE]);
        return (int) ($result['total'] ?? 0);
    }

    // =========================================================================
    // PAGINATION HELPERS
    // =========================================================================

    /**
     * Lấy sản phẩm theo phân trang
     * 
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function getPaginated(int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE status = ?
                ORDER BY id DESC 
                LIMIT ? OFFSET ?";

        return $this->db->fetchAll($sql, [self::STATUS_ACTIVE, $limit, $offset]);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Subquery để tính sold_count
     */
    private function getSoldCountSubquery(): string
    {
        return "(SELECT COALESCE(SUM(od.quantity), 0) 
                 FROM order_details od 
                 JOIN orders o ON od.order_id = o.id 
                 WHERE od.product_id = p.id AND o.status != 'cancelled')";
    }

    /**
     * Build sort clause
     */
    private function buildSortClause(string $sort): string
    {
        return match ($sort) {
            'price_asc' => " ORDER BY p.price ASC",
            'price_desc' => " ORDER BY p.price DESC",
            'bestseller' => " ORDER BY sold_count DESC",
            'popular', 'newest' => " ORDER BY p.id DESC",
            default => " ORDER BY p.id DESC",
        };
    }

    /**
     * Clear product cache
     */
    private function clearCache(): void
    {
        $redis = RedisCache::getInstance();
        if ($redis->isAvailable()) {
            // Clear các cache keys phổ biến
            $redis->delete(self::CACHE_PREFIX . 'latest_12');
            $redis->delete(self::CACHE_PREFIX . 'latest_20');
        }
    }

    // =========================================================================
    // LEGACY COMPATIBILITY
    // =========================================================================

    /**
     * @deprecated Use createProduct() instead
     */
    public function create(array $data): int
    {
        return $this->createProduct($data);
    }

    /**
     * @deprecated Use updateProduct() instead
     */
    public function update(int $id, array $data): bool
    {
        return $this->updateProduct($id, $data);
    }

    /**
     * @deprecated Use deleteProduct() instead
     */
    public function delete(int $id): bool
    {
        return $this->deleteProduct($id);
    }

    /**
     * @deprecated Use countActive() instead
     */
    public function countAll(): int
    {
        return $this->countActive();
    }
}