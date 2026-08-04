<?php

declare(strict_types=1);

namespace App\Models;

/**
 * User Model
 * 
 * Quản lý tất cả operations liên quan đến users.
 * Bao gồm: authentication, profile, email verification, password reset.
 * 
 * @package App\Models
 */
class User extends BaseModel
{
	/** @var string */
	protected $table = 'users';

	/** @var array<string> */
	protected array $fillable = [
		'full_name',
		'email',
		'password',
		'phone_number',
		'phone_verified',
		'address',
		'avatar',
		'role',
		'gender',
		'email_verified',
	];

	/** @var array<string> */
	protected array $hidden = ['password'];

	/** @var array<string> User roles */
	public const ROLE_USER = 'user';
	public const ROLE_ADMIN = 'admin';

	/** @var int Password reset token expiry in seconds */
	private const PASSWORD_RESET_EXPIRY = 900; // 15 minutes

	/** @var int Max reset attempts before lockout */
	private const MAX_RESET_ATTEMPTS = 5;

	// =========================================================================
	// AUTHENTICATION
	// =========================================================================

	/**
	 * Register a new user
	 * 
	 * @param array{
	 *     full_name: string,
	 *     email: string,
	 *     password: string,
	 *     phone_number?: string,
	 *     address?: string,
	 *     email_verified?: int
	 * } $data
	 * @return int New user ID
	 */
	public function register(array $data): int
	{
		$sql = "INSERT INTO {$this->table} 
                (full_name, email, password, phone_number, address, email_verified) 
                VALUES (?, ?, ?, ?, ?, ?)";

		return $this->db->insert($sql, [
			$data['full_name'],
			$data['email'],
			password_hash($data['password'], PASSWORD_DEFAULT),
			$data['phone_number'] ?? null,
			$data['address'] ?? null,
			$data['email_verified'] ?? 0,
		]);
	}

	/**
	 * Attempt to login with email and password
	 * 
	 * @param string $email
	 * @param string $password
	 * @return array<string, mixed>|null User data or null on failure
	 */
	public function login(string $email, string $password): ?array
	{
		$user = $this->findByEmailFull($email);

		if ($user === null) {
			return null;
		}

		// Check if user is locked
		if (!empty($user['is_locked'])) {
			return null;
		}

		if (!password_verify($password, $user['password'])) {
			return null;
		}

		unset($user['password']);
		return $user;
	}

	/**
	 * Check if email already exists
	 * 
	 * @param string $email
	 * @return bool
	 */
	public function emailExists(string $email): bool
	{
		$sql = "SELECT 1 FROM {$this->table} WHERE email = ? LIMIT 1";
		return $this->db->fetchOne($sql, [$email]) !== null;
	}

	/**
	 * Verify user password by ID
	 * 
	 * @param int $id
	 * @param string $password
	 * @return bool
	 */
	public function verifyPassword(int $id, string $password): bool
	{
		$sql = "SELECT password FROM {$this->table} WHERE id = ?";
		$user = $this->db->fetchOne($sql, [$id]);

		return $user !== null && password_verify($password, $user['password']);
	}

	/**
	 * Update password
	 * 
	 * @param int $userId
	 * @param string $newPassword
	 * @return bool
	 */
	public function updatePassword(int $userId, string $newPassword): bool
	{
		$hash = password_hash($newPassword, PASSWORD_DEFAULT);
		$sql = "UPDATE {$this->table} SET password = ? WHERE id = ?";

		return $this->db->execute($sql, [$hash, $userId]) > 0;
	}

	// =========================================================================
	// FIND METHODS
	// =========================================================================

	/**
	 * Find user by ID (without password)
	 * 
	 * @param int $id
	 * @return array<string, mixed>|null
	 */
	public function find(int $id): ?array
	{
		$sql = "SELECT id, full_name, email, phone_number, phone_verified, address, role, gender, 
                       created_at, balance, avatar, email_verified, is_locked 
                FROM {$this->table} WHERE id = ?";

		return $this->db->fetchOne($sql, [$id]) ?: null;
	}

	/**
	 * Find user by email (without password)
	 * 
	 * @param string $email
	 * @return array<string, mixed>|null
	 */
	public function findByEmail(string $email): ?array
	{
		$sql = "SELECT id, full_name, email, phone_number, phone_verified, address, role, gender,
                       created_at, balance, avatar, email_verified 
                FROM {$this->table} WHERE email = ?";

		return $this->db->fetchOne($sql, [$email]) ?: null;
	}

	/**
	 * Find user by email with all fields (for internal use)
	 * 
	 * @param string $email
	 * @return array<string, mixed>|null
	 */
	public function findByEmailFull(string $email): ?array
	{
		$sql = "SELECT * FROM {$this->table} WHERE email = ?";
		return $this->db->fetchOne($sql, [$email]) ?: null;
	}

	// =========================================================================
	// EMAIL VERIFICATION
	// =========================================================================

	/**
	 * Save email verification token
	 * 
	 * @param int $userId
	 * @param string $token
	 * @param string $expiresAt
	 * @return bool
	 */
	public function saveVerificationToken(int $userId, string $token, string $expiresAt): bool
	{
		$sql = "UPDATE {$this->table} SET 
                email_verification_token = ?, 
                email_verification_expires_at = ? 
                WHERE id = ?";

		return $this->db->execute($sql, [$token, $expiresAt, $userId]) > 0;
	}

	/**
	 * Find user by verification token
	 * 
	 * @param string $token
	 * @return array<string, mixed>|null
	 */
	public function findByVerificationToken(string $token): ?array
	{
		$sql = "SELECT * FROM {$this->table} WHERE email_verification_token LIKE ?";
		return $this->db->fetchOne($sql, [$token . '%']) ?: null;
	}

	/**
	 * Find user by email for verification purposes
	 * 
	 * @param string $email
	 * @return array<string, mixed>|null
	 */
	public function findByEmailForVerification(string $email): ?array
	{
		$sql = "SELECT id, full_name, email, email_verified, 
                       email_verification_token, email_verification_expires_at 
                FROM {$this->table} WHERE email = ?";

		return $this->db->fetchOne($sql, [$email]) ?: null;
	}

	/**
	 * Mark user as verified
	 * 
	 * @param int $userId
	 * @return bool
	 */
	public function markAsVerified(int $userId): bool
	{
		$sql = "UPDATE {$this->table} SET 
                email_verified = 1, 
                email_verification_token = NULL, 
                email_verification_expires_at = NULL 
                WHERE id = ?";

		return $this->db->execute($sql, [$userId]) > 0;
	}

	// =========================================================================
	// PHONE VERIFICATION
	// =========================================================================

	/**
	 * Check if user's phone is verified
	 * 
	 * @param int $userId
	 * @return bool
	 */
	public function isPhoneVerified(int $userId): bool
	{
		$user = $this->find($userId);
		return !empty($user['phone_verified']);
	}

	/**
	 * Mark phone as verified and update phone number
	 * 
	 * Firebase Phone Auth đã xác minh OTP phía client,
	 * backend chỉ cần lưu trạng thái và số điện thoại.
	 * 
	 * @param int $userId
	 * @param string $phoneNumber Số điện thoại đã xác minh
	 * @return bool
	 */
	public function markPhoneAsVerified(int $userId, string $phoneNumber): bool
	{
		$sql = "UPDATE {$this->table} SET 
                phone_number = ?, 
                phone_verified = 1 
                WHERE id = ?";

		return $this->db->execute($sql, [$phoneNumber, $userId]) > 0;
	}

	// =========================================================================
	// PASSWORD RESET
	// =========================================================================

	/**
	 * Save password reset token
	 * 
	 * @param int $userId
	 * @param string $token
	 * @return bool
	 */
	public function savePasswordResetToken(int $userId, string $token): bool
	{
		$expiresAt = date('Y-m-d H:i:s', time() + self::PASSWORD_RESET_EXPIRY);

		$sql = "UPDATE {$this->table} SET 
                password_reset_token = ?, 
                password_reset_expires_at = ?,
                password_reset_attempts = 0,
                password_reset_locked_until = NULL
                WHERE id = ?";

		return $this->db->execute($sql, [$token, $expiresAt, $userId]) > 0;
	}

	/**
	 * Increment reset attempts and lock if exceeded
	 * 
	 * @param int $userId
	 * @return bool True if account is now locked
	 */
	public function incrementResetAttempts(int $userId): bool
	{
		$sql = "UPDATE {$this->table} SET password_reset_attempts = password_reset_attempts + 1 WHERE id = ?";
		$this->db->execute($sql, [$userId]);

		$sqlGet = "SELECT password_reset_attempts FROM {$this->table} WHERE id = ?";
		$result = $this->db->fetchOne($sqlGet, [$userId]);
		$attempts = (int) ($result['password_reset_attempts'] ?? 0);

		if ($attempts >= self::MAX_RESET_ATTEMPTS) {
			$lockedUntil = date('Y-m-d H:i:s', strtotime('+5 minutes'));
			$sqlLock = "UPDATE {$this->table} SET password_reset_locked_until = ? WHERE id = ?";
			$this->db->execute($sqlLock, [$lockedUntil, $userId]);
			return true;
		}

		return false;
	}

	/**
	 * Clear password reset token
	 * 
	 * @param int $userId
	 * @return bool
	 */
	public function clearPasswordResetToken(int $userId): bool
	{
		$sql = "UPDATE {$this->table} SET 
                password_reset_token = NULL, 
                password_reset_expires_at = NULL, 
                password_reset_attempts = 0, 
                password_reset_locked_until = NULL 
                WHERE id = ?";

		return $this->db->execute($sql, [$userId]) > 0;
	}

	// =========================================================================
	// PROFILE METHODS
	// =========================================================================

	/**
	 * Update user profile (safe fields only)
	 * 
	 * @param int $id
	 * @param array<string, mixed> $data
	 * @return bool
	 */
	public function updateProfile(int $id, array $data): bool
	{
		$allowedFields = ['full_name', 'phone_number', 'address', 'avatar', 'gender'];

		$fields = [];
		$params = [];

		foreach ($allowedFields as $field) {
			if (array_key_exists($field, $data)) {
				$fields[] = "{$field} = ?";
				$params[] = $data[$field];
			}
		}

		if (empty($fields)) {
			return false;
		}

		$params[] = $id;
		$sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";

		return $this->db->execute($sql, $params) > 0;
	}

	// =========================================================================
	// ADMIN METHODS
	// =========================================================================

	/**
	 * Get all users for admin panel
	 * 
	 * @param int $limit
	 * @param int $offset
	 * @return array<int, array<string, mixed>>
	 */
	public function getAllForAdmin(int $limit = 50, int $offset = 0): array
	{
		$sql = "SELECT id, full_name, email, phone_number, address, role, 
                       created_at, email_verified, is_locked, avatar 
                FROM {$this->table} 
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?";

		return $this->db->fetchAll($sql, [$limit, $offset]);
	}

	/**
	 * Update user by admin (full access)
	 * 
	 * @param int $id
	 * @param array<string, mixed> $data
	 * @return bool
	 */
	public function updateByAdmin(int $id, array $data): bool
	{
		$sql = "UPDATE {$this->table} SET 
                full_name = ?,
                email = ?,
                phone_number = ?,
                role = ?,
                email_verified = ?
                WHERE id = ?";

		return $this->db->execute($sql, [
			$data['full_name'],
			$data['email'],
			$data['phone_number'] ?? null,
			$data['role'],
			$data['email_verified'],
			$id,
		]) > 0;
	}

	/**
	 * Toggle user lock status
	 * 
	 * @param int $id
	 * @return bool
	 */
	public function toggleLock(int $id): bool
	{
		$user = $this->find($id);
		if ($user === null) {
			return false;
		}

		$newStatus = empty($user['is_locked']) ? 1 : 0;
		$sql = "UPDATE {$this->table} SET is_locked = ? WHERE id = ?";

		return $this->db->execute($sql, [$newStatus, $id]) > 0;
	}

	/**
	 * Toggle email verified status
	 * 
	 * @param int $id
	 * @return bool
	 */
	public function toggleVerified(int $id): bool
	{
		$sql = "UPDATE {$this->table} SET email_verified = NOT email_verified WHERE id = ?";
		return $this->db->execute($sql, [$id]) > 0;
	}

	// =========================================================================
	// STATISTICS
	// =========================================================================

	/**
	 * Get user statistics
	 * 
	 * @return array{total: int, verified: int, locked: int, admins: int}
	 */
	public function getStats(): array
	{
		$sql = "SELECT 
                    COUNT(*) AS total,
                    SUM(email_verified) AS verified,
                    SUM(is_locked) AS locked,
                    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
                FROM {$this->table}";

		$result = $this->db->fetchOne($sql);

		return [
			'total' => (int) ($result['total'] ?? 0),
			'verified' => (int) ($result['verified'] ?? 0),
			'locked' => (int) ($result['locked'] ?? 0),
			'admins' => (int) ($result['admins'] ?? 0),
		];
	}

	// =========================================================================
	// LEGACY COMPATIBILITY (Deprecated)
	// =========================================================================

	/**
	 * @deprecated Use emailExists() instead
	 */
	public function checkEmailExists(string $email): bool
	{
		return $this->emailExists($email);
	}

	/**
	 * @deprecated Use getAllForAdmin() instead
	 */
	public function getAll(): array
	{
		return $this->getAllForAdmin();
	}

	// =========================================================================
	// ROLE METHODS (cho Notification Broadcasting)
	// =========================================================================

	/**
	 * Đếm users theo role
	 * 
	 * @param string $role buyer|seller|admin
	 * @return int
	 */
	public function countByRole(string $role): int
	{
		$sql = "SELECT COUNT(*) AS total FROM {$this->table} WHERE role = ?";
		$result = $this->db->fetchOne($sql, [$role]);
		return (int) ($result['total'] ?? 0);
	}

	/**
	 * Lấy users theo role
	 * 
	 * @param string $role buyer|seller|admin
	 * @return array<int, array<string, mixed>>
	 */
	public function getByRole(string $role): array
	{
		$sql = "SELECT id, full_name, email FROM {$this->table} WHERE role = ?";
		return $this->db->fetchAll($sql, [$role]);
	}

	/**
	 * Lấy tất cả user IDs (không giới hạn, cho broadcast)
	 * 
	 * @return array<int> Array of user IDs
	 */
	public function getAllUserIds(): array
	{
		$sql = "SELECT id FROM {$this->table}";
		$results = $this->db->fetchAll($sql);
		return array_column($results, 'id');
	}

	/**
	 * Lấy user IDs theo role (không giới hạn, cho broadcast)
	 * 
	 * @param string $role buyer|seller|admin
	 * @return array<int> Array of user IDs
	 */
	public function getUserIdsByRole(string $role): array
	{
		$sql = "SELECT id FROM {$this->table} WHERE role = ?";
		$results = $this->db->fetchAll($sql, [$role]);
		return array_column($results, 'id');
	}
}
