<?php

namespace Tests\Helpers;

use Tests\TestCase;
use App\Helpers\StringHelper;

/**
 * Unit Tests cho StringHelper
 *
 * @covers \App\Helpers\StringHelper
 */
class StringHelperTest extends TestCase
{
    // ========== formatName() Tests ==========

    /**
     * @test
     * @group helpers
     */
    public function formatName_withLowercase_shouldCapitalize(): void
    {
        // Arrange
        $name = 'nguyễn văn an';

        // Act
        $result = StringHelper::formatName($name);

        // Assert
        $this->assertEquals('Nguyễn Văn An', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatName_withUppercase_shouldConvertToTitleCase(): void
    {
        // Arrange
        $name = 'TRẦN THỊ BÌNH';

        // Act
        $result = StringHelper::formatName($name);

        // Assert
        $this->assertEquals('Trần Thị Bình', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatName_withExtraSpaces_shouldNormalize(): void
    {
        // Arrange - Có nhiều khoảng trắng thừa
        $name = '  lê   hồng   ';

        // Act
        $result = StringHelper::formatName($name);

        // Assert
        $this->assertEquals('Lê Hồng', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatName_withMixedCase_shouldNormalize(): void
    {
        // Arrange
        $name = 'nGuYỄn vĂn aN';

        // Act
        $result = StringHelper::formatName($name);

        // Assert
        $this->assertEquals('Nguyễn Văn An', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatName_withVietnameseChars_shouldPreserveAccents(): void
    {
        // Arrange - Tên đầy đủ dấu tiếng Việt
        $name = 'phạm thị ánh tuyết';

        // Act
        $result = StringHelper::formatName($name);

        // Assert
        $this->assertEquals('Phạm Thị Ánh Tuyết', $result);
    }

    // ========== formatPhone() Tests ==========

    /**
     * @test
     * @group helpers
     */
    public function formatPhone_withDashes_shouldRemove(): void
    {
        // Arrange
        $phone = '0123-456-789';

        // Act
        $result = StringHelper::formatPhone($phone);

        // Assert
        $this->assertEquals('0123456789', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatPhone_withSpaces_shouldRemove(): void
    {
        // Arrange
        $phone = '0123 456 789';

        // Act
        $result = StringHelper::formatPhone($phone);

        // Assert
        $this->assertEquals('0123456789', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatPhone_withCountryCode_shouldKeepNumbers(): void
    {
        // Arrange
        $phone = '+84 912 345 678';

        // Act
        $result = StringHelper::formatPhone($phone);

        // Assert
        $this->assertEquals('84912345678', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatPhone_withParentheses_shouldRemove(): void
    {
        // Arrange
        $phone = '(0912) 345-678';

        // Act
        $result = StringHelper::formatPhone($phone);

        // Assert
        $this->assertEquals('0912345678', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatPhone_withCleanNumber_shouldReturnSame(): void
    {
        // Arrange
        $phone = '0912345678';

        // Act
        $result = StringHelper::formatPhone($phone);

        // Assert
        $this->assertEquals('0912345678', $result);
    }

    // ========== formatEmail() Tests ==========

    /**
     * @test
     * @group helpers
     */
    public function formatEmail_withUppercase_shouldLowercase(): void
    {
        // Arrange
        $email = 'TEST@EXAMPLE.COM';

        // Act
        $result = StringHelper::formatEmail($email);

        // Assert
        $this->assertEquals('test@example.com', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatEmail_withSpaces_shouldTrim(): void
    {
        // Arrange
        $email = '  test@example.com  ';

        // Act
        $result = StringHelper::formatEmail($email);

        // Assert
        $this->assertEquals('test@example.com', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatEmail_withMixedCase_shouldNormalize(): void
    {
        // Arrange
        $email = '  TeSt@ExAmPlE.CoM  ';

        // Act
        $result = StringHelper::formatEmail($email);

        // Assert
        $this->assertEquals('test@example.com', $result);
    }

    /**
     * @test
     * @group helpers
     */
    public function formatEmail_withCleanEmail_shouldReturnSame(): void
    {
        // Arrange
        $email = 'test@example.com';

        // Act
        $result = StringHelper::formatEmail($email);

        // Assert
        $this->assertEquals('test@example.com', $result);
    }
}
