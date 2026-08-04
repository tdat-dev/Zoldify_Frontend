<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\User;
use App\Core\Database;

/**
 * Unit Tests cho User Model
 *
 * @covers \App\Models\User
 */
class UserTest extends TestCase
{
    /**
     * @var User
     */
    private User $user;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject|Database
     */
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Tạo mock Database
        $this->mockDatabase = $this->createMock(Database::class);

        // Tạo User instance với reflection để inject mock
        $this->user = new User();

        // Inject mock database
        $reflection = new \ReflectionClass($this->user);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->user, $this->mockDatabase);
    }

    // ========== register() Tests ==========

    /**
     * @test
     * @group user
     * @group registration
     */
    public function register_withValidData_shouldInsertAndReturnId(): void
    {
        // Arrange
        $userData = [
            'full_name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone_number' => '0123456789',
            'address' => '123 Main St'
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->willReturn(1);

        // Act
        $result = $this->user->register($userData);

        // Assert
        $this->assertEquals(1, $result);
    }

    /**
     * @test
     * @group user
     * @group registration
     */
    public function register_shouldHashPassword(): void
    {
        // Arrange
        $userData = [
            'full_name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'PlainPassword'
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->with(
                $this->anything(),
                $this->callback(function ($params) {
                    // Params is indexed array: [0=>name, 1=>email, 2=>password, ...]
                    return isset($params[2])
                        && $params[2] !== 'PlainPassword'
                        && password_verify('PlainPassword', $params[2]);
                })
            )
            ->willReturn(1);

        // Act
        $this->user->register($userData);
    }

    /**
     * @test
     * @group user
     * @group registration
     */
    public function register_withNullPhoneAndAddress_shouldUseNullDefaults(): void
    {
        // Arrange
        $userData = [
            'full_name' => 'Minimal User',
            'email' => 'minimal@example.com',
            'password' => 'password'
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->with(
                $this->anything(),
                $this->callback(function ($params) {
                    // Padding is indexed: 3=>phone, 4=>address
                    return ($params[3] ?? null) === null
                        && ($params[4] ?? null) === null;
                })
            )
            ->willReturn(1);

        // Act
        $this->user->register($userData);
    }

    // ========== checkEmailExists() Tests ==========

    /**
     * @test
     * @group user
     */
    public function checkEmailExists_withExistingEmail_shouldReturnTrue(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['id' => 1]);

        // Act
        $result = $this->user->checkEmailExists('existing@example.com');

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group user
     */
    public function checkEmailExists_withNonExistingEmail_shouldReturnFalse(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->user->checkEmailExists('new@example.com');

        // Assert
        $this->assertFalse($result);
    }

    // ========== login() Tests ==========

    /**
     * @test
     * @group user
     * @group authentication
     */
    public function login_withValidCredentials_shouldReturnUser(): void
    {
        // Arrange
        $hashedPassword = password_hash('correctpassword', PASSWORD_DEFAULT);
        $mockUser = $this->createUserData([
            'email' => 'user@example.com',
            'password' => $hashedPassword
        ]);

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockUser);

        // Act
        $result = $this->user->login('user@example.com', 'correctpassword');

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals('user@example.com', $result['email']);
    }

    /**
     * @test
     * @group user
     * @group authentication
     */
    public function login_withWrongPassword_shouldReturnFalse(): void
    {
        // Arrange
        $hashedPassword = password_hash('correctpassword', PASSWORD_DEFAULT);
        $mockUser = $this->createUserData([
            'password' => $hashedPassword
        ]);

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockUser);

        // Act
        $result = $this->user->login('user@example.com', 'wrongpassword');

        // Assert
        $this->assertNull($result);
    }

    /**
     * @test
     * @group user
     * @group authentication
     */
    public function login_withNonExistingEmail_shouldReturnFalse(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->user->login('nonexisting@example.com', 'anypassword');

        // Assert
        $this->assertNull($result);
    }

    // ========== find() Tests ==========

    /**
     * @test
     * @group user
     */
    public function find_withExistingId_shouldReturnUser(): void
    {
        // Arrange
        $mockUser = $this->createUserData(['id' => 42]);

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockUser);

        // Act
        $result = $this->user->find(42);

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(42, $result['id']);
    }

    /**
     * @test
     * @group user
     */
    public function find_withNonExistingId_shouldReturnNull(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->user->find(99999);

        // Assert
        $this->assertNull($result);
    }

    // ========== findByEmail() Tests ==========

    /**
     * @test
     * @group user
     */
    public function findByEmail_withExistingEmail_shouldReturnUser(): void
    {
        // Arrange
        $mockUser = $this->createUserData(['email' => 'found@example.com']);

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockUser);

        // Act
        $result = $this->user->findByEmail('found@example.com');

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals('found@example.com', $result['email']);
    }

    // ========== saveVerificationToken() Tests ==========

    /**
     * @test
     * @group user
     * @group verification
     */
    public function saveVerificationToken_shouldUpdateUserWithToken(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->user->saveVerificationToken(1, 'abc123', '2026-01-01 00:00:00');

        // Assert
        $this->assertTrue($result);
    }

    // ========== markAsVerified() Tests ==========

    /**
     * @test
     * @group user
     * @group verification
     */
    public function markAsVerified_shouldSetVerifiedAndClearToken(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->user->markAsVerified(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== count() Tests ==========

    /**
     * @test
     * @group user
     */
    public function count_shouldReturnTotalUsers(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 150]);

        // Act
        $result = $this->user->count();

        // Assert
        $this->assertEquals(150, $result);
    }

    /**
     * @test
     * @group user
     */
    public function count_withNoUsers_shouldReturnZero(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 0]);

        // Act
        $result = $this->user->count();

        // Assert
        $this->assertEquals(0, $result);
    }

    // ========== getAll() Tests ==========

    /**
     * @test
     * @group user
     * @group admin
     */
    public function getAll_shouldReturnAllUsers(): void
    {
        // Arrange
        $users = [
            $this->createUserData(['id' => 1]),
            $this->createUserData(['id' => 2]),
            $this->createUserData(['id' => 3])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($users);

        // Act
        $result = $this->user->getAll();

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(3, $result);
    }

    // ========== update() Tests ==========

    /**
     * @test
     * @group user
     * @group admin
     */
    public function update_withValidData_shouldReturnTrue(): void
    {
        // Arrange
        $updateData = [
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'phone_number' => '0999888777',
            'role' => 'admin',
            'email_verified' => 1
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->user->update(1, $updateData);

        // Assert
        $this->assertTrue($result);
    }

    // ========== updateProfile() Tests ==========

    /**
     * @test
     * @group user
     */
    public function updateProfile_withAllowedFields_shouldUpdate(): void
    {
        // Arrange
        $profileData = [
            'full_name' => 'New Name',
            'phone_number' => '0111222333'
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->user->updateProfile(1, $profileData);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group user
     */
    public function updateProfile_withEmptyData_shouldReturnFalse(): void
    {
        // Arrange
        $profileData = [];

        // Act
        $result = $this->user->updateProfile(1, $profileData);

        // Assert
        $this->assertFalse($result);
    }

    /**
     * @test
     * @group user
     */
    public function updateProfile_shouldIgnoreDisallowedFields(): void
    {
        // Arrange: Cố update role (không được phép từ user profile)
        $profileData = [
            'full_name' => 'Name',
            'role' => 'admin', // Không được phép
            'email_verified' => 1 // Không được phép
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->with(
                $this->anything(),
                $this->callback(function ($params) {
                    // Chỉ có full_name và id, không có role hay email_verified
                    // $params is indexed: [0 => 'New Name', 1 => $id] (params depends on allowedFields order)
                    // We only updated full_name, so param 0 should be the name.
                    // We cannot easily check keys, but we can verify param count and content of known fields.
                    // If 'role' was included, it would add another param, but updateProfile filters fields before creating SQL.
                    // So we mainly rely on checking that the params passed are correct for the allowed fields.
                    return count($params) === 2 && $params[0] === 'Name';
                })
            )
            ->willReturn(1);

        // Act
        $this->user->updateProfile(1, $profileData);
    }

    // ========== toggleLock() Tests ==========

    /**
     * @test
     * @group user
     * @group admin
     */
    public function toggleLock_withUnlockedUser_shouldLock(): void
    {
        // Arrange: User hiện đang unlocked
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($this->createUserData(['is_locked' => 0]));

        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->with(
                $this->anything(),
                $this->callback(function ($params) {
                    // $params is indexed: [0 => new_status, 1 => id]
                    return $params[0] === 1; // Lock
                })
            )
            ->willReturn(1);

        // Act
        $result = $this->user->toggleLock(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== toggleVerified() Tests ==========

    /**
     * @test
     * @group user
     * @group admin
     */
    public function toggleVerified_shouldToggleEmailVerifiedStatus(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->user->toggleVerified(1);

        // Assert
        $this->assertTrue($result);
    }
}
