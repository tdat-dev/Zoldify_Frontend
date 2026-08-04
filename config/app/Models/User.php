<?php

namespace App\Models;

use App\Core\Database;

class User extends BaseModel
{
	// Đăng ký tài khoản mới
	public function register($data)
	{
		$sql = "INSERT INTO users (full_name, email, password, phone_number, address, email_verified) VALUES (:full_name, :email, :password, :phone_number, :address, :email_verified)";
		return $this->db->insert($sql, [
			'full_name' => $data['full_name'],
			'email' => $data['email'],
			'password' => password_hash($data['password'], PASSWORD_DEFAULT),
			'phone_number' => $data['phone_number'] ?? null,
			'address' => $data['address'] ?? null,
			'email_verified' => $data['email_verified'] ?? 0, // Mặc định là 0 (chưa verify)
		]);
	}

	// Kiểm tra email đã tồn tại chưa
	public function checkEmailExists($email)
	{
		$sql = "SELECT id FROM users WHERE email = :email";
		$user = $this->db->fetchOne($sql, ['email' => $email]);
		return $user ? true : false;
	}

	// Đăng nhập: kiểm tra email và password
	public function login($email, $password)
	{
		$sql = "SELECT * FROM users WHERE email = :email";  // Đã lấy tất cả cột rồi, OK!
		$user = $this->db->fetchOne($sql, ['email' => $email]);
		if ($user && password_verify($password, $user['password'])) {
			return $user;
		}
		return false;
	}
	// Lấy thông tin user theo ID
	public function find($id)
	{
		$sql = "SELECT id, full_name, email, phone_number, address, role, created_at FROM users WHERE id = :id";
		return $this->db->fetchOne($sql, ['id' => $id]);
	}

	// Lấy thông tin user theo email (cho Google OAuth)
	public function findByEmail($email)
	{
		$sql = "SELECT id, full_name, email, phone_number, address, role, created_at FROM users WHERE email = :email";
		return $this->db->fetchOne($sql, ['email' => $email]);
	}

	// Lưu token xác minh
	public function saveVerificationToken(int $userId, string $token, string $expiresAt): bool
	{
		$sql = "UPDATE users SET 
            email_verification_token = :token, 
            email_verification_expires_at = :expires_at 
            WHERE id = :id";
		return $this->db->execute($sql, [
			'token' => $token,
			'expires_at' => $expiresAt,
			'id' => $userId
		]);
	}

	// Tìm user theo token (cho verify bằng link)
	public function findByVerificationToken(string $token): ?array
	{
		$sql = "SELECT * FROM users WHERE email_verification_token LIKE :token";
		return $this->db->fetchOne($sql, ['token' => $token . '%']) ?: null;
	}

	// Tìm user theo email để verify (lấy cả token)
	public function findByEmailForVerification(string $email): ?array
	{
		$sql = "SELECT id, full_name, email, email_verified, email_verification_token, email_verification_expires_at 
            FROM users WHERE email = :email";
		return $this->db->fetchOne($sql, ['email' => $email]) ?: null;
	}

	// Đánh dấu đã xác minh
	public function markAsVerified(int $userId): bool
	{
		$sql = "UPDATE users SET 
            email_verified = 1, 
            email_verification_token = NULL, 
            email_verification_expires_at = NULL 
            WHERE id = :id";
		return $this->db->execute($sql, ['id' => $userId]);
	}

	// Đếm tổng số users
	public function count(): int
	{
		$sql = "SELECT COUNT(*) as total FROM users";
		$result = $this->db->fetchOne($sql);
		return $result['total'] ?? 0;
	}
}
