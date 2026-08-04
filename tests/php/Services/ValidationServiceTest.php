<?php

namespace Tests\Services;

use Tests\TestCase;
use App\Services\ValidationService;

/**
 * Unit Tests cho ValidationService
 *
 * @covers \App\Services\ValidationService
 */
class ValidationServiceTest extends TestCase
{
    private ValidationService $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new ValidationService();
    }

    // ========== required Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_requiredWithValue_shouldPass(): void
    {
        // Arrange
        $data = ['name' => 'John Doe'];
        $rules = ['name' => ['required']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
        $this->assertEmpty($this->validator->errors());
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_requiredWithEmpty_shouldFail(): void
    {
        // Arrange
        $data = ['name' => ''];
        $rules = ['name' => ['required']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
        $this->assertArrayHasKey('name', $this->validator->errors());
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_requiredWithNull_shouldFail(): void
    {
        // Arrange
        $data = ['name' => null];
        $rules = ['name' => ['required']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== email Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_emailWithValidEmail_shouldPass(): void
    {
        // Arrange
        $data = ['email' => 'test@example.com'];
        $rules = ['email' => ['email']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_emailWithInvalidEmail_shouldFail(): void
    {
        // Arrange
        $data = ['email' => 'invalid-email'];
        $rules = ['email' => ['email']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
        $this->assertArrayHasKey('email', $this->validator->errors());
    }

    // ========== min Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_minWithSufficientLength_shouldPass(): void
    {
        // Arrange - min:6
        $data = ['password' => 'password123'];
        $rules = ['password' => ['min:6']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_minWithShortLength_shouldFail(): void
    {
        // Arrange - min:6 but only 3 chars
        $data = ['password' => '123'];
        $rules = ['password' => ['min:6']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== max Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_maxWithAcceptableLength_shouldPass(): void
    {
        // Arrange - max:10
        $data = ['name' => 'John'];
        $rules = ['name' => ['max:10']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_maxWithExceededLength_shouldFail(): void
    {
        // Arrange - max:5 but 10 chars
        $data = ['name' => 'VeryLongName'];
        $rules = ['name' => ['max:5']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== numeric Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_numericWithNumber_shouldPass(): void
    {
        // Arrange
        $data = ['price' => '100000'];
        $rules = ['price' => ['numeric']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_numericWithNonNumber_shouldFail(): void
    {
        // Arrange
        $data = ['price' => 'abc'];
        $rules = ['price' => ['numeric']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== phone Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_phoneWithValidVietnamNumber_shouldPass(): void
    {
        // Arrange
        $data = ['phone' => '0912345678'];
        $rules = ['phone' => ['phone']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_phoneWithInvalidNumber_shouldFail(): void
    {
        // Arrange
        $data = ['phone' => '123'];
        $rules = ['phone' => ['phone']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== confirmed Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_confirmedWithMatch_shouldPass(): void
    {
        // Arrange
        $data = [
            'password' => 'secret123',
            'password_confirmation' => 'secret123'
        ];
        $rules = ['password' => ['confirmed']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_confirmedWithMismatch_shouldFail(): void
    {
        // Arrange
        $data = [
            'password' => 'secret123',
            'password_confirmation' => 'different'
        ];
        $rules = ['password' => ['confirmed']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== in Rule Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_inWithValidValue_shouldPass(): void
    {
        // Arrange
        $data = ['status' => 'active'];
        $rules = ['status' => ['in:active,inactive,pending']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_inWithInvalidValue_shouldFail(): void
    {
        // Arrange
        $data = ['status' => 'unknown'];
        $rules = ['status' => ['in:active,inactive']];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertFalse($result);
    }

    // ========== Multiple Rules Tests ==========

    /**
     * @test
     * @group services
     * @group validation
     */
    public function validate_multipleRulesAllPass_shouldSucceed(): void
    {
        // Arrange
        $data = [
            'email' => 'test@example.com',
            'password' => 'secret123'
        ];
        $rules = [
            'email' => ['required', 'email'],
            'password' => ['required', 'min:6']
        ];

        // Act
        $result = $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($result);
        $this->assertEmpty($this->validator->errors());
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function fails_afterValidation_shouldReturnCorrectState(): void
    {
        // Arrange
        $data = ['name' => ''];
        $rules = ['name' => ['required']];

        // Act
        $this->validator->validate($data, $rules);

        // Assert
        $this->assertTrue($this->validator->fails());
    }

    /**
     * @test
     * @group services
     * @group validation
     */
    public function firstError_shouldReturnFirstErrorMessage(): void
    {
        // Arrange
        $data = ['name' => '', 'email' => 'invalid'];
        $rules = [
            'name' => ['required'],
            'email' => ['email']
        ];

        // Act
        $this->validator->validate($data, $rules);

        // Assert
        $this->assertNotNull($this->validator->firstError());
    }
}
