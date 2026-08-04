<?php

declare(strict_types=1);

namespace App\Models;

/**
 * UserAddress Model
 * 
 * Quản lý địa chỉ giao hàng của users.
 * Mỗi user có thể có nhiều địa chỉ và 1 địa chỉ mặc định.
 * 
 * @package App\Models
 */
class UserAddress extends BaseModel
{
    /** @var string */
    protected $table = 'user_addresses';

    /** @var array<string> */
    protected array $fillable = [
        'user_id',
        'label',
        'recipient_name',
        'phone_number',
        'province',
        'district',
        'ward',
        'street_address',
        'full_address',
        'latitude',
        'longitude',
        'here_place_id',
        'is_default',
        // GHN address codes (required for shipping)
        'ghn_province_id',
        'ghn_district_id',
        'ghn_ward_code',
    ];

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy tất cả địa chỉ của user
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? 
                ORDER BY is_default DESC, created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Lấy địa chỉ mặc định của user
     * 
     * @param int $userId
     * @return array<string, mixed>|null
     */
    public function getDefaultAddress(int $userId): ?array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? AND is_default = 1 
                LIMIT 1";

        return $this->db->fetchOne($sql, [$userId]) ?: null;
    }

    /**
     * Lấy địa chỉ theo ID với kiểm tra ownership
     * 
     * @param int $id
     * @param int|null $userId Nếu có, kiểm tra địa chỉ thuộc về user này
     * @return array<string, mixed>|null
     */
    public function findById(int $id, ?int $userId = null): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $params = [$id];

        if ($userId !== null) {
            $sql .= " AND user_id = ?";
            $params[] = $userId;
        }

        return $this->db->fetchOne($sql, $params) ?: null;
    }

    /**
     * Đếm số địa chỉ của user
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

    // =========================================================================
    // CREATE/UPDATE METHODS
    // =========================================================================

    /**
     * Tạo địa chỉ mới
     * 
     * @param array<string, mixed> $data
     * @return int Address ID
     */
    public function createAddress(array $data): int
    {
        $userId = (int) $data['user_id'];

        // Nếu đây là địa chỉ đầu tiên hoặc được đặt mặc định
        if (!empty($data['is_default'])) {
            $this->clearDefaultAddress($userId);
        }

        // Nếu chưa có địa chỉ nào, tự động đặt mặc định
        if ($this->countByUserId($userId) === 0) {
            $data['is_default'] = 1;
        }

        // Tạo full_address nếu chưa có
        if (empty($data['full_address'])) {
            $data['full_address'] = $this->buildFullAddress($data);
        }

        return parent::create($data);
    }

    /**
     * Cập nhật địa chỉ với kiểm tra ownership
     * 
     * @param int $id
     * @param array<string, mixed> $data
     * @param int|null $userId
     * @return bool
     */
    public function updateAddress(int $id, array $data, ?int $userId = null): bool
    {
        // Kiểm tra ownership nếu cần
        if ($userId !== null) {
            $address = $this->findById($id, $userId);
            if ($address === null) {
                return false;
            }
        }

        // Xử lý is_default
        if (!empty($data['is_default']) && $userId !== null) {
            $this->clearDefaultAddress($userId);
        }

        // Cập nhật full_address nếu có thay đổi địa chỉ
        if ($this->hasAddressFieldChanged($data)) {
            $current = $this->findById($id);
            if ($current !== null) {
                $merged = array_merge($current, $data);
                $data['full_address'] = $this->buildFullAddress($merged);
            }
        }

        return parent::update($id, $data);
    }

    /**
     * Xóa địa chỉ với kiểm tra ownership
     * 
     * @param int $id
     * @param int|null $userId
     * @return bool
     */
    public function deleteAddress(int $id, ?int $userId = null): bool
    {
        $address = $this->findById($id, $userId);
        if ($address === null) {
            return false;
        }

        $wasDefault = (bool) $address['is_default'];
        $addressUserId = (int) $address['user_id'];

        $result = parent::delete($id);

        // Nếu xóa địa chỉ mặc định, đặt địa chỉ khác làm mặc định
        if ($result && $wasDefault) {
            $this->setFirstAsDefault($addressUserId);
        }

        return $result;
    }

    // =========================================================================
    // DEFAULT ADDRESS MANAGEMENT
    // =========================================================================

    /**
     * Đặt địa chỉ làm mặc định
     * 
     * @param int $id
     * @param int $userId
     * @return bool
     */
    public function setAsDefault(int $id, int $userId): bool
    {
        // Kiểm tra địa chỉ thuộc về user
        $address = $this->findById($id, $userId);
        if ($address === null) {
            return false;
        }

        // Bỏ default của các địa chỉ khác
        $this->clearDefaultAddress($userId);

        // Đặt địa chỉ này làm default
        $sql = "UPDATE {$this->table} SET is_default = 1 WHERE id = ? AND user_id = ?";
        return $this->db->execute($sql, [$id, $userId]) !== false;
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Bỏ flag default của tất cả địa chỉ user
     */
    private function clearDefaultAddress(int $userId): void
    {
        $sql = "UPDATE {$this->table} SET is_default = 0 WHERE user_id = ?";
        $this->db->execute($sql, [$userId]);
    }

    /**
     * Đặt địa chỉ đầu tiên làm mặc định
     */
    private function setFirstAsDefault(int $userId): void
    {
        $sql = "UPDATE {$this->table} 
                SET is_default = 1 
                WHERE user_id = ? 
                ORDER BY created_at ASC 
                LIMIT 1";
        $this->db->execute($sql, [$userId]);
    }

    /**
     * Kiểm tra có thay đổi trường địa chỉ không
     */
    private function hasAddressFieldChanged(array $data): bool
    {
        $addressFields = ['street_address', 'ward', 'district', 'province'];
        foreach ($addressFields as $field) {
            if (isset($data[$field])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Tạo full_address từ các thành phần
     */
    private function buildFullAddress(array $data): string
    {
        $parts = array_filter([
            $data['street_address'] ?? '',
            $data['ward'] ?? '',
            $data['district'] ?? '',
            $data['province'] ?? '',
        ]);

        return implode(', ', $parts);
    }
}