<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Notification Model
 * 
 * Quản lý thông báo cho users.
 * 
 * @package App\Models
 */
class Notification extends BaseModel
{
    /** @var string */
    protected $table = 'notifications';

    /** @var array<string> */
    protected array $fillable = [
        'user_id',
        'content',
        'type',
        'is_read',
    ];

    // =========================================================================
    // CREATE NOTIFICATIONS
    // =========================================================================

    /**
     * Tạo thông báo mới
     * 
     * @param int $userId
     * @param string $content
     * @param string $type Loại thông báo (order, message, system, etc.)
     * @return int ID của notification
     */
    public function createNotification(int $userId, string $content, string $type = 'system'): int
    {
        $sql = "INSERT INTO {$this->table} (user_id, content, type) VALUES (?, ?, ?)";
        return $this->db->insert($sql, [$userId, $content, $type]);
    }

    /**
     * Tạo thông báo hàng loạt cho nhiều users (bulk insert)
     * 
     * @param array<int> $userIds Array of user IDs
     * @param string $content Nội dung thông báo
     * @param string $type Loại thông báo
     * @param int $batchSize Số records mỗi lần insert
     * @return int Số thông báo đã tạo
     */
    public function createBulkNotifications(array $userIds, string $content, string $type = 'system', int $batchSize = 1000): int
    {
        if (empty($userIds)) {
            return 0;
        }

        $total = 0;
        $chunks = array_chunk($userIds, $batchSize);

        foreach ($chunks as $chunk) {
            $placeholders = [];
            $values = [];

            foreach ($chunk as $userId) {
                $placeholders[] = '(?, ?, ?)';
                $values[] = $userId;
                $values[] = $content;
                $values[] = $type;
            }

            $sql = "INSERT INTO {$this->table} (user_id, content, type) VALUES " . implode(', ', $placeholders);
            
            try {
                $this->db->execute($sql, $values);
                $total += count($chunk);
            } catch (\Exception $e) {
                error_log("Bulk notification insert failed: " . $e->getMessage());
            }
        }

        return $total;
    }

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy thông báo chưa đọc
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getUnread(int $userId): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? AND is_read = 0 
                ORDER BY created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Lấy tất cả thông báo của user
     * 
     * @param int $userId
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getByUserId(int $userId, int $limit = 20): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?";

        return $this->db->fetchAll($sql, [$userId, $limit]);
    }

    /**
     * Đếm số thông báo chưa đọc
     * 
     * @param int $userId
     * @return int
     */
    public function countUnread(int $userId): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE user_id = ? AND is_read = 0";
        $result = $this->db->fetchOne($sql, [$userId]);

        return (int) ($result['total'] ?? 0);
    }

    // =========================================================================
    // UPDATE METHODS
    // =========================================================================

    /**
     * Đánh dấu đã đọc 1 notification
     * 
     * @param int $id Notification ID
     * @param int $userId User ID (để đảm bảo ownership)
     * @return bool
     */
    public function markAsRead(int $id, int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = 1 WHERE id = ? AND user_id = ?";
        return $this->db->execute($sql, [$id, $userId]) !== false;
    }

    /**
     * Đánh dấu tất cả đã đọc
     * 
     * @param int $userId
     * @return bool
     */
    public function markAllAsRead(int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = 1 WHERE user_id = ? AND is_read = 0";
        return $this->db->execute($sql, [$userId]) !== false;
    }

    /**
     * Xóa notification cũ (cleanup job)
     * 
     * @param int $daysOld Xóa notifications cũ hơn X ngày
     * @return int Số records đã xóa
     */
    public function deleteOld(int $daysOld = 30): int
    {
        $sql = "DELETE FROM {$this->table} WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
        return $this->db->execute($sql, [$daysOld]);
    }
}
