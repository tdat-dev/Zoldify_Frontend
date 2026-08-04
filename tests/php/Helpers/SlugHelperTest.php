<?php

namespace Tests\Helpers;

use Tests\TestCase;
use App\Helpers\SlugHelper;

/**
 * Unit Tests cho SlugHelper
 *
 * @covers \App\Helpers\SlugHelper
 */
class SlugHelperTest extends TestCase
{
    // ========== toSlug() Tests ==========

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function toSlug_withVietnamese_shouldRemoveAccents(): void
    {
        // Arrange
        $text = 'Điện Thoại & Phụ Kiện';

        // Act
        $result = SlugHelper::toSlug($text);

        // Assert
        $this->assertEquals('dien-thoai-phu-kien', $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function toSlug_withSpecialChars_shouldRemove(): void
    {
        // Arrange
        $text = 'iPhone 14 Pro Max 256GB';

        // Act
        $result = SlugHelper::toSlug($text);

        // Assert
        $this->assertEquals('iphone-14-pro-max-256gb', $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function toSlug_withMultipleSpaces_shouldNormalize(): void
    {
        // Arrange
        $text = 'Áo   Thun    Nam';

        // Act
        $result = SlugHelper::toSlug($text);

        // Assert
        $this->assertEquals('ao-thun-nam', $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function toSlug_withLongText_shouldTruncate(): void
    {
        // Arrange - Text dài hơn 80 ký tự
        $text = 'Đây là một chuỗi text rất dài để kiểm tra việc cắt ngắn slug khi vượt quá giới hạn cho phép thường là tám mươi ký tự';

        // Act
        $result = SlugHelper::toSlug($text, 30);

        // Assert
        $this->assertLessThanOrEqual(30, strlen($result));
    }

    // ========== productUrl() Tests ==========

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function productUrl_shouldGenerateCorrectFormat(): void
    {
        // Arrange
        $name = 'iPhone 14 Pro Max';
        $productId = 123;

        // Act
        $result = SlugHelper::productUrl($name, $productId);

        // Assert - Format: /z/ten-san-pham.p123
        $this->assertStringStartsWith('/z/', $result);
        $this->assertStringEndsWith('.p123', $result);
        $this->assertStringContainsString('iphone-14-pro-max', $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function productUrl_withVietnamese_shouldWork(): void
    {
        // Arrange
        $name = 'Áo Thun Nam Cao Cấp';
        $productId = 456;

        // Act
        $result = SlugHelper::productUrl($name, $productId);

        // Assert
        $this->assertEquals('/z/ao-thun-nam-cao-cap.p456', $result);
    }

    // ========== categoryUrl() Tests ==========

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function categoryUrl_shouldGenerateCorrectFormat(): void
    {
        // Arrange
        $name = 'Điện Thoại';
        $categoryId = 10;

        // Act
        $result = SlugHelper::categoryUrl($name, $categoryId);

        // Assert - Format: /dm/ten-danh-muc.c123
        $this->assertStringStartsWith('/dm/', $result);
        $this->assertStringEndsWith('.c10', $result);
        $this->assertStringContainsString('dien-thoai', $result);
    }

    // ========== parseProductId() Tests ==========

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function parseProductId_withValidSlug_shouldReturnId(): void
    {
        // Arrange
        $slug = 'iphone-14-pro-max.p123';

        // Act
        $result = SlugHelper::parseProductId($slug);

        // Assert
        $this->assertEquals(123, $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function parseProductId_withFullUrl_shouldReturnId(): void
    {
        // Arrange
        $url = '/z/iphone-14-pro-max.p456';

        // Act
        $result = SlugHelper::parseProductId($url);

        // Assert
        $this->assertEquals(456, $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function parseProductId_withInvalidSlug_shouldReturnNull(): void
    {
        // Arrange - Không có .p prefix
        $slug = 'invalid-slug-no-id';

        // Act
        $result = SlugHelper::parseProductId($slug);

        // Assert
        $this->assertNull($result);
    }

    // ========== parseCategoryId() Tests ==========

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function parseCategoryId_withValidSlug_shouldReturnId(): void
    {
        // Arrange
        $slug = 'dien-thoai.c10';

        // Act
        $result = SlugHelper::parseCategoryId($slug);

        // Assert
        $this->assertEquals(10, $result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function parseCategoryId_withFullUrl_shouldReturnId(): void
    {
        // Arrange
        $url = '/dm/thoi-trang.c25';

        // Act
        $result = SlugHelper::parseCategoryId($url);

        // Assert
        $this->assertEquals(25, $result);
    }

    // ========== isProductUrl() / isCategoryUrl() Tests ==========

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function isProductUrl_withProductUrl_shouldReturnTrue(): void
    {
        // Arrange
        $url = '/z/iphone-14.p123';

        // Act
        $result = SlugHelper::isProductUrl($url);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function isProductUrl_withCategoryUrl_shouldReturnFalse(): void
    {
        // Arrange
        $url = '/dm/dien-thoai.c10';

        // Act
        $result = SlugHelper::isProductUrl($url);

        // Assert
        $this->assertFalse($result);
    }

    /**
     * @test
     * @group helpers
     * @group slug
     */
    public function isCategoryUrl_withCategoryUrl_shouldReturnTrue(): void
    {
        // Arrange
        $url = '/dm/thoi-trang.c25';

        // Act
        $result = SlugHelper::isCategoryUrl($url);

        // Assert
        $this->assertTrue($result);
    }
}
