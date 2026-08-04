<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Setting Model
 * 
 * Quản lý cài đặt website dạng key-value với support groups.
 * Có thể cache settings để tối ưu performance.
 * 
 * @package App\Models
 */
class Setting extends BaseModel
{
    /** @var string */
    protected $table = 'settings';

    /** @var array<string> */
    protected array $fillable = [
        'setting_key',
        'setting_value',
        'setting_group',
    ];

    /** @var array<string, mixed>|null Cache settings trong memory */
    private static ?array $cache = null;

    // =========================================================================
    // GET METHODS
    // =========================================================================

    /**
     * Lấy giá trị setting theo key
     * 
     * @param string $key
     * @param mixed $default Giá trị mặc định nếu không tìm thấy
     * @return mixed
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $sql = "SELECT setting_value FROM {$this->table} WHERE setting_key = ?";
        $result = $this->db->fetchOne($sql, [$key]);

        return $result ? $result['setting_value'] : $default;
    }

    /**
     * Lấy nhiều settings cùng lúc
     * 
     * @param array<string> $keys
     * @return array<string, mixed>
     */
    public function getMultiple(array $keys): array
    {
        if (empty($keys)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($keys), '?'));
        $sql = "SELECT setting_key, setting_value FROM {$this->table} WHERE setting_key IN ({$placeholders})";
        $results = $this->db->fetchAll($sql, $keys);

        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        return $settings;
    }

    /**
     * Lấy settings theo group
     * 
     * @param string $group
     * @return array<string, mixed>
     */
    public function getByGroup(string $group): array
    {
        $sql = "SELECT setting_key, setting_value FROM {$this->table} WHERE setting_group = ?";
        $results = $this->db->fetchAll($sql, [$group]);

        $settings = [];
        foreach ($results as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        return $settings;
    }

    /**
     * Lấy tất cả settings dạng key-value flat
     * 
     * @return array<string, mixed>
     */
    public function getAll(): array
    {
        return $this->loadAll();
    }

    /**
     * Lấy tất cả settings, nhóm theo group
     * 
     * @return array<string, array<string, mixed>>
     */
    public function getAllGrouped(): array
    {
        $sql = "SELECT setting_key, setting_value, setting_group 
                FROM {$this->table} 
                ORDER BY setting_group, id";
        $results = $this->db->fetchAll($sql);

        $grouped = [];
        foreach ($results as $row) {
            $grouped[$row['setting_group']][$row['setting_key']] = $row['setting_value'];
        }

        return $grouped;
    }

    // =========================================================================
    // SET METHODS
    // =========================================================================

    /**
     * Cập nhật hoặc tạo setting (UPSERT)
     * 
     * @param string $key
     * @param string $value
     * @param string $group
     * @return bool
     */
    public function set(string $key, string $value, string $group = 'general'): bool
    {
        $sql = "INSERT INTO {$this->table} (setting_key, setting_value, setting_group) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE setting_value = ?";

        $result = $this->db->execute($sql, [$key, $value, $group, $value]);

        // Clear cache
        self::$cache = null;

        return $result !== false;
    }

    /**
     * Cập nhật nhiều settings cùng lúc
     * 
     * @param array<string, string> $settings ['key' => 'value', ...]
     * @param string $group
     * @return bool
     */
    public function setMultiple(array $settings, string $group = 'general'): bool
    {
        foreach ($settings as $key => $value) {
            $this->set($key, (string) $value, $group);
        }

        return true;
    }

    // =========================================================================
    // DELETE METHODS
    // =========================================================================

    /**
     * Xóa setting
     * 
     * @param string $key
     * @return bool
     */
    public function remove(string $key): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE setting_key = ?";
        $result = $this->db->execute($sql, [$key]);

        self::$cache = null;

        return $result !== false;
    }

    // =========================================================================
    // CACHE HELPERS
    // =========================================================================

    /**
     * Load tất cả settings vào cache (cho performance)
     * 
     * @return array<string, mixed>
     */
    public function loadAll(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $sql = "SELECT setting_key, setting_value FROM {$this->table}";
        $results = $this->db->fetchAll($sql);

        self::$cache = [];
        foreach ($results as $row) {
            self::$cache[$row['setting_key']] = $row['setting_value'];
        }

        return self::$cache;
    }

    /**
     * Lấy từ cache (nhanh hơn query từng key)
     * 
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getCached(string $key, mixed $default = null): mixed
    {
        $cache = $this->loadAll();
        return $cache[$key] ?? $default;
    }

    /**
     * Clear cache (khi settings thay đổi từ bên ngoài)
     */
    public function clearCache(): void
    {
        self::$cache = null;
    }
}