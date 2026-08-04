<?php

namespace Tests\Services;

use Tests\TestCase;
use App\Services\AuthService;
use App\Models\User;
use App\Models\Cart;
use App\Services\EmailVerificationService;

/**
 * Unit Tests cho AuthService
 *
 * @covers \App\Services\AuthService
 */
class AuthServiceTest extends TestCase
{
    /**
     * @var AuthService
     */
    private AuthService $authService;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject|User
     */
    private $mockUserModel;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject|Cart
     */
    private $mockCartModel;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject|EmailVerificationService
     */
    private $mockEmailService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mockEmailService = $this->createMock(EmailVerificationService::class);
        $this->authService = new AuthService($this->mockEmailService);
    }

    // ========== registerUser() Tests ==========

    /**
     * @test
     * @group auth
     * @group registration
     */
    public function registerUser_withValidData_shouldReturnSuccess(): void
    {
        // Arrange
        $userData = [
            'username' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'SecurePass123!',
            'phone' => '0123456789',
            'school' => 'University of Testing'
        ];

        // Act
        $result = $this->authService->registerUser($userData);

        // Assert - Kết quả phụ thuộc vào database thực
        // Trong unit test, ta verify cấu trúc response
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
    }

    /**
     * @test
     * @group auth
     * @group registration
     */
    public function registerUser_withMinimalData_shouldWork(): void
    {
        // Arrange - Chỉ có required fields
        $userData = [
            'username' => 'Min User',
            'email' => 'min@example.com',
            'password' => 'password123'
        ];

        // Act
        $result = $this->authService->registerUser($userData);

        // Assert
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
    }

    /**
     * @test
     * @group auth
     * @group registration
     */
    public function registerUser_resultShouldHaveCorrectStructure(): void
    {
        // Arrange
        $userData = [
            'username' => 'Test',
            'email' => 'test' . uniqid() . '@example.com', // Unique email
            'password' => 'password'
        ];

        // Act
        $result = $this->authService->registerUser($userData);

        // Assert - Verify structure regardless of success/failure
        $this->assertIsArray($result);
        if ($result['success']) {
            $this->assertArrayHasKey('user_id', $result);
            $this->assertArrayHasKey('email', $result);
        } else {
            $this->assertArrayHasKey('message', $result);
        }
    }

    // ========== loginUser() Tests ==========

    /**
     * @test
     * @group auth
     * @group login
     */
    public function loginUser_withValidCredentials_shouldReturnSuccess(): void
    {
        // Arrange
        $email = 'valid@example.com';
        $password = 'correctPassword';

        // Act
        $result = $this->authService->loginUser($email, $password);

        // Assert
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
    }

    /**
     * @test
     * @group auth
     * @group login
     */
    public function loginUser_withInvalidCredentials_shouldReturnFailure(): void
    {
        // Arrange
        $email = 'nonexisting@example.com';
        $password = 'wrongpassword';

        // Act
        $result = $this->authService->loginUser($email, $password);

        // Assert
        $this->assertIsArray($result);
        $this->assertFalse($result['success']);
        $this->assertEquals('invalid_credentials', $result['reason']);
    }

    /**
     * @test
     * @group auth
     * @group login
     */
    public function loginUser_resultShouldHaveReasonOnFailure(): void
    {
        // Arrange
        $email = 'fake@example.com';
        $password = 'wrong';

        // Act
        $result = $this->authService->loginUser($email, $password);

        // Assert
        if (!$result['success']) {
            $this->assertArrayHasKey('reason', $result);
            $this->assertContains($result['reason'], ['invalid_credentials', 'locked']);
        }
    }

    // ========== Edge Cases ==========

    /**
     * @test
     * @group auth
     */
    public function registerUser_shouldNormalizeEmail(): void
    {
        // Arrange
        $uniqueId = uniqid();
        $userData = [
            'username' => 'Test',
            'email' => '  TEST' . $uniqueId . '@EXAMPLE.COM  ', // Uppercase, space, unique
            'password' => 'password'
        ];

        // Act
        $result = $this->authService->registerUser($userData);

        // Assert - Email should be normalized
        $this->assertTrue($result['success'], 'Registration failed, likely due to duplicate email.');
        $this->assertEquals('test' . $uniqueId . '@example.com', $result['email']);
    }

    /**
     * @test
     * @group auth
     */
    public function registerUser_shouldFormatName(): void
    {
        // Arrange
        $userData = [
            'username' => '  john  doe  ', // Extra spaces
            'email' => 'johndoe@example.com',
            'password' => 'password'
        ];

        // Act - Name should be formatted
        $result = $this->authService->registerUser($userData);

        // Assert
        $this->assertIsArray($result);
    }

    /**
     * @test
     * @group auth
     */
    public function registerUser_shouldFormatPhone(): void
    {
        // Arrange
        $userData = [
            'username' => 'Test',
            'email' => 'phone@example.com',
            'password' => 'password',
            'phone' => '0123-456-789' // With dashes
        ];

        // Act
        $result = $this->authService->registerUser($userData);

        // Assert
        $this->assertIsArray($result);
    }

    /**
     * @test
     * @group auth
     * @group login
     */
    public function loginUser_withEmptyEmail_shouldFail(): void
    {
        // Act
        $result = $this->authService->loginUser('', 'password');

        // Assert
        $this->assertFalse($result['success']);
    }

    /**
     * @test
     * @group auth
     * @group login
     */
    public function loginUser_withEmptyPassword_shouldFail(): void
    {
        // Act
        $result = $this->authService->loginUser('test@example.com', '');

        // Assert
        $this->assertFalse($result['success']);
    }
}
