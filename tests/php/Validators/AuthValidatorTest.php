<?php

namespace Tests\Validators;

use Tests\TestCase;
use App\Validators\AuthValidator;

/**
 * Unit Tests cho AuthValidator
 *
 * @covers \App\Validators\AuthValidator
 */
class AuthValidatorTest extends TestCase
{
    private AuthValidator $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new AuthValidator();
    }

    // ========== validateRegister() Tests ==========

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withValidData_shouldReturnEmptyErrors(): void
    {
        // Arrange
        $data = [
            'username' => 'Nguyễn Văn An',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertEmpty($errors);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withEmptyUsername_shouldReturnError(): void
    {
        // Arrange
        $data = [
            'username' => '',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('username', $errors);
        $this->assertEquals('Vui lòng nhập họ tên', $errors['username']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withSingleWordName_shouldReturnError(): void
    {
        // Arrange - Tên chỉ có 1 từ
        $data = [
            'username' => 'An',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('username', $errors);
        $this->assertEquals('Vui lòng nhập đầy đủ họ và tên', $errors['username']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withSpecialCharactersInName_shouldReturnError(): void
    {
        // Arrange - Tên có ký tự đặc biệt
        $data = [
            'username' => 'Nguyễn Văn @123',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('username', $errors);
        $this->assertEquals('Họ tên chỉ được chứa chữ cái và khoảng trắng', $errors['username']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withTooShortName_shouldReturnError(): void
    {
        // Arrange - Tên quá ngắn (< 2 ký tự)
        $data = [
            'username' => 'A',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('username', $errors);
        $this->assertEquals('Họ tên phải từ 2 đến 100 ký tự', $errors['username']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withEmptyEmail_shouldReturnError(): void
    {
        // Arrange
        $data = [
            'username' => 'Nguyễn Văn An',
            'email' => '',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('email', $errors);
        $this->assertEquals('Vui lòng nhập email', $errors['email']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withInvalidEmail_shouldReturnError(): void
    {
        // Arrange - Email không hợp lệ
        $data = [
            'username' => 'Nguyễn Văn An',
            'email' => 'invalid-email',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('email', $errors);
        $this->assertEquals('Email không hợp lệ', $errors['email']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withEmptyPassword_shouldReturnError(): void
    {
        // Arrange
        $data = [
            'username' => 'Nguyễn Văn An',
            'email' => 'test@example.com',
            'password' => ''
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('password', $errors);
        $this->assertEquals('Vui lòng nhập mật khẩu', $errors['password']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withShortPassword_shouldReturnError(): void
    {
        // Arrange - Password < 6 ký tự
        $data = [
            'username' => 'Nguyễn Văn An',
            'email' => 'test@example.com',
            'password' => '12345'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertArrayHasKey('password', $errors);
        $this->assertEquals('Mật khẩu phải từ 6 ký tự', $errors['password']);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withVietnameseName_shouldPass(): void
    {
        // Arrange - Tên tiếng Việt đầy đủ dấu
        $data = [
            'username' => 'Trần Thị Bình',
            'email' => 'binh@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert
        $this->assertEmpty($errors);
    }

    /**
     * @test
     * @group validators
     * @group registration
     */
    public function validateRegister_withMultipleErrors_shouldReturnAllErrors(): void
    {
        // Arrange - Tất cả đều sai
        $data = [
            'username' => '',
            'email' => 'invalid',
            'password' => '123'
        ];

        // Act
        $errors = $this->validator->validateRegister($data);

        // Assert - Có ít nhất 2 lỗi (username và email hoặc password)
        $this->assertGreaterThanOrEqual(2, count($errors));
    }

    // ========== validateLogin() Tests ==========

    /**
     * @test
     * @group validators
     * @group login
     */
    public function validateLogin_withValidData_shouldReturnEmptyErrors(): void
    {
        // Arrange
        $data = [
            'username' => 'test@example.com',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateLogin($data);

        // Assert
        $this->assertEmpty($errors);
    }

    /**
     * @test
     * @group validators
     * @group login
     */
    public function validateLogin_withEmptyUsername_shouldReturnError(): void
    {
        // Arrange
        $data = [
            'username' => '',
            'password' => 'password123'
        ];

        // Act
        $errors = $this->validator->validateLogin($data);

        // Assert
        $this->assertArrayHasKey('username', $errors);
        $this->assertEquals('Thiếu email', $errors['username']);
    }

    /**
     * @test
     * @group validators
     * @group login
     */
    public function validateLogin_withEmptyPassword_shouldReturnError(): void
    {
        // Arrange
        $data = [
            'username' => 'test@example.com',
            'password' => ''
        ];

        // Act
        $errors = $this->validator->validateLogin($data);

        // Assert
        $this->assertArrayHasKey('password', $errors);
        $this->assertEquals('Thiếu mật khẩu', $errors['password']);
    }

    /**
     * @test
     * @group validators
     * @group login
     */
    public function validateLogin_withBothEmpty_shouldReturnBothErrors(): void
    {
        // Arrange
        $data = [
            'username' => '',
            'password' => ''
        ];

        // Act
        $errors = $this->validator->validateLogin($data);

        // Assert
        $this->assertArrayHasKey('username', $errors);
        $this->assertArrayHasKey('password', $errors);
        $this->assertCount(2, $errors);
    }
}
