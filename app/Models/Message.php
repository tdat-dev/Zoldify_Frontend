<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Message Model
 * 
 * Quản lý tin nhắn giữa các users.
 * 
 * @package App\Models
 */
class Message extends BaseModel
{
    /** @var string */
    protected $table = 'messages';

    /** @var array<string> */
    protected array $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
    ];

    // =========================================================================
    // CREATE METHODS
    // =========================================================================

    /**
     * Gửi tin nhắn mới
     * 
     * @param int $senderId
     * @param int $receiverId
     * @param string $content
     * @return int Message ID
     */
    public function send(int $senderId, int $receiverId, string $content): int
    {
        $sql = "INSERT INTO {$this->table} (sender_id, receiver_id, content) VALUES (?, ?, ?)";
        return $this->db->insert($sql, [$senderId, $receiverId, $content]);
    }

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Lấy conversation giữa 2 users
     * 
     * @param int $user1Id
     * @param int $user2Id
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getConversation(int $user1Id, int $user2Id, int $limit = 50): array
    {
        $sql = "SELECT m.*, 
                    s.full_name AS sender_name, 
                    s.avatar AS sender_avatar
                FROM {$this->table} m
                JOIN users s ON m.sender_id = s.id
                WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                   OR (m.sender_id = ? AND m.receiver_id = ?)
                ORDER BY m.created_at ASC
                LIMIT ?";

        return $this->db->fetchAll($sql, [$user1Id, $user2Id, $user2Id, $user1Id, $limit]);
    }

    /**
     * Lấy danh sách conversations gần đây (tối ưu - 1 query)
     * 
     * Sử dụng subquery để lấy last message, tránh N+1 problem.
     * 
     * @param int $userId
     * @param int $limit
     * @return array<int, array<string, mixed>>
     */
    public function getRecentConversations(int $userId, int $limit = 20): array
    {
        // Subquery để lấy partner_id và last message time
        $sql = "SELECT 
                    partner.id AS partner_id,
                    partner.full_name AS partner_name,
                    partner.avatar AS partner_avatar,
                    last_msg.id AS last_message_id,
                    last_msg.content AS last_message_content,
                    last_msg.sender_id AS last_message_sender_id,
                    last_msg.created_at AS last_message_at,
                    last_msg.is_read AS last_message_is_read,
                    (SELECT COUNT(*) FROM {$this->table} 
                     WHERE sender_id = partner.id 
                     AND receiver_id = ? 
                     AND is_read = 0) AS unread_count
                FROM (
                    SELECT DISTINCT
                        CASE 
                            WHEN sender_id = ? THEN receiver_id 
                            ELSE sender_id 
                        END AS partner_id,
                        MAX(id) AS last_message_id
                    FROM {$this->table}
                    WHERE sender_id = ? OR receiver_id = ?
                    GROUP BY partner_id
                ) AS conversations
                JOIN users partner ON partner.id = conversations.partner_id
                JOIN {$this->table} last_msg ON last_msg.id = conversations.last_message_id
                ORDER BY last_msg.created_at DESC
                LIMIT ?";

        return $this->db->fetchAll($sql, [$userId, $userId, $userId, $userId, $limit]);
    }

    /**
     * Đếm tin nhắn chưa đọc
     * 
     * @param int $userId
     * @return int
     */
    public function countUnread(int $userId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE receiver_id = ? AND is_read = 0";
        $result = $this->db->fetchOne($sql, [$userId]);

        return (int) ($result['total'] ?? 0);
    }

    /**
     * Đếm tin nhắn chưa đọc từ một user cụ thể
     * 
     * @param int $userId
     * @param int $senderId
     * @return int
     */
    public function countUnreadFrom(int $userId, int $senderId): int
    {
        $sql = "SELECT COUNT(*) AS total FROM {$this->table} 
                WHERE receiver_id = ? AND sender_id = ? AND is_read = 0";
        $result = $this->db->fetchOne($sql, [$userId, $senderId]);

        return (int) ($result['total'] ?? 0);
    }

    // =========================================================================
    // UPDATE METHODS
    // =========================================================================

    /**
     * Đánh dấu tin nhắn đã đọc
     * 
     * @param int $messageId
     * @param int $userId Receiver ID (để đảm bảo ownership)
     * @return bool
     */
    public function markAsRead(int $messageId, int $userId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = 1 WHERE id = ? AND receiver_id = ?";
        return $this->db->execute($sql, [$messageId, $userId]) !== false;
    }

    /**
     * Đánh dấu tất cả tin nhắn từ một user là đã đọc
     * 
     * @param int $receiverId
     * @param int $senderId
     * @return bool
     */
    public function markConversationAsRead(int $receiverId, int $senderId): bool
    {
        $sql = "UPDATE {$this->table} SET is_read = 1 
                WHERE receiver_id = ? AND sender_id = ? AND is_read = 0";
        return $this->db->execute($sql, [$receiverId, $senderId]) !== false;
    }

    // =========================================================================
    // DELETE METHODS
    // =========================================================================

    /**
     * Xóa conversation (soft delete hoặc hard delete tùy business logic)
     * 
     * @param int $user1Id
     * @param int $user2Id
     * @return bool
     */
    public function deleteConversation(int $user1Id, int $user2Id): bool
    {
        $sql = "DELETE FROM {$this->table} 
                WHERE (sender_id = ? AND receiver_id = ?) 
                   OR (sender_id = ? AND receiver_id = ?)";
        return $this->db->execute($sql, [$user1Id, $user2Id, $user2Id, $user1Id]) !== false;
    }
}
