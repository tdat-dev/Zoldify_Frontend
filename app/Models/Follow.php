<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Follow Model
 * 
 * Quản lý quan hệ follow giữa các users.
 * Sử dụng composite key (follower_id, following_id).
 * 
 * @package App\Models
 */
class Follow extends BaseModel
{
    /** @var string */
    protected $table = 'follows';

    /** @var array<string> */
    protected array $fillable = [
        'follower_id',
        'following_id',
    ];

    // =========================================================================
    // FOLLOW ACTIONS
    // =========================================================================

    /**
     * Follow một user
     * 
     * @param int $followerId Người follow
     * @param int $followingId Người được follow
     * @return bool
     */
    public function follow(int $followerId, int $followingId): bool
    {
        // Không thể tự follow chính mình
        if ($followerId === $followingId) {
            return false;
        }

        $sql = "INSERT IGNORE INTO {$this->table} (follower_id, following_id) VALUES (?, ?)";
        return $this->db->execute($sql, [$followerId, $followingId]) !== false;
    }

    /**
     * Unfollow một user
     * 
     * @param int $followerId Người unfollow
     * @param int $followingId Người bị unfollow
     * @return bool
     */
    public function unfollow(int $followerId, int $followingId): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE follower_id = ? AND following_id = ?";
        return $this->db->execute($sql, [$followerId, $followingId]) !== false;
    }

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Kiểm tra đã follow chưa
     * 
     * @param int $followerId
     * @param int $followingId
     * @return bool
     */
    public function isFollowing(int $followerId, int $followingId): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE follower_id = ? AND following_id = ? LIMIT 1";
        $result = $this->db->fetchOne($sql, [$followerId, $followingId]);
        return $result !== null;
    }

    /**
     * Lấy danh sách người đang follow user này (followers)
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getFollowers(int $userId): array
    {
        $sql = "SELECT u.id, u.full_name, u.avatar, u.email
                FROM users u
                JOIN {$this->table} f ON u.id = f.follower_id
                WHERE f.following_id = ?
                ORDER BY f.created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Lấy danh sách người mà user này đang follow (following)
     * 
     * @param int $userId
     * @return array<int, array<string, mixed>>
     */
    public function getFollowing(int $userId): array
    {
        $sql = "SELECT u.id, u.full_name, u.avatar, u.email
                FROM users u
                JOIN {$this->table} f ON u.id = f.following_id
                WHERE f.follower_id = ?
                ORDER BY f.created_at DESC";

        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Đếm số followers
     * 
     * @param int $userId
     * @return int
     */
    public function getFollowerCount(int $userId): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE following_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);

        return (int) ($result['total'] ?? 0);
    }

    /**
     * Đếm số người đang follow
     * 
     * @param int $userId
     * @return int
     */
    public function getFollowingCount(int $userId): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE follower_id = ?";
        $result = $this->db->fetchOne($sql, [$userId]);

        return (int) ($result['total'] ?? 0);
    }
}
