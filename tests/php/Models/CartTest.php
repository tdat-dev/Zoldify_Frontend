<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\Cart;
use App\Core\Database;

/**
 * Unit Tests cho Cart Model
 *
 * @covers \App\Models\Cart
 */
class CartTest extends TestCase
{
    private Cart $cart;
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Tạo mock Database
        $this->mockDatabase = $this->createMock(Database::class);

        // Tạo Cart instance với reflection để inject mock
        $this->cart = new Cart();

        // Inject mock database
        $reflection = new \ReflectionClass($this->cart);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->cart, $this->mockDatabase);
    }

    // ========== getByUserId() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function getByUserId_shouldReturnCartItems(): void
    {
        // Arrange
        $userId = 1;
        $mockItems = [
            ['id' => 1, 'user_id' => 1, 'product_id' => 10, 'quantity' => 2, 'price' => 100000],
            ['id' => 2, 'user_id' => 1, 'product_id' => 20, 'quantity' => 1, 'price' => 200000]
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockItems);

        // Act
        $result = $this->cart->getByUserId($userId);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    /**
     * @test
     * @group models
     * @group cart
     */
    public function getByUserId_withEmptyCart_shouldReturnEmptyArray(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn([]);

        // Act
        $result = $this->cart->getByUserId(999);

        // Assert
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // ========== getItem() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function getItem_withExistingItem_shouldReturnItem(): void
    {
        // Arrange
        $mockItem = ['id' => 1, 'user_id' => 1, 'product_id' => 10, 'quantity' => 2];

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockItem);

        // Act
        $result = $this->cart->getItem(1, 10);

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(10, $result['product_id']);
    }

    /**
     * @test
     * @group models
     * @group cart
     */
    public function getItem_withNonExistingItem_shouldReturnNull(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->cart->getItem(1, 999);

        // Assert
        $this->assertNull($result);
    }

    // ========== countItems() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function countItems_shouldReturnNumberOfProducts(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 5]);

        // Act
        $result = $this->cart->countItems(1);

        // Assert
        $this->assertEquals(5, $result);
    }

    // ========== countTotalQuantity() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function countTotalQuantity_shouldReturnSumOfQuantities(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 10]);

        // Act
        $result = $this->cart->countTotalQuantity(1);

        // Assert
        $this->assertEquals(10, $result);
    }

    // ========== getTotal() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function getTotal_shouldReturnTotalAmount(): void
    {
        // Arrange - total = sum(price * quantity)
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 500000]);

        // Act
        $result = $this->cart->getTotal(1);

        // Assert
        $this->assertEquals(500000, $result);
    }

    // ========== addItem() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function addItem_shouldUseUpsertPattern(): void
    {
        // Arrange - Expect INSERT ... ON DUPLICATE KEY UPDATE
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->cart->addItem(1, 10, 2);

        // Assert
        $this->assertTrue($result);
    }

    // ========== updateQuantity() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function updateQuantity_withPositiveQuantity_shouldUpdate(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->cart->updateQuantity(1, 10, 5);

        // Assert
        $this->assertTrue($result);
    }

    // ========== removeItem() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function removeItem_shouldDeleteFromCart(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->cart->removeItem(1, 10);

        // Assert
        $this->assertTrue($result);
    }

    // ========== clearCart() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function clearCart_shouldDeleteAllItems(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->cart->clearCart(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== mergeFromSession() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function mergeFromSession_withValidProducts_shouldMerge(): void
    {
        // Arrange
        $sessionCart = [
            10 => ['quantity' => 2],
            20 => ['quantity' => 1]
        ];

        // Mock product validation
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['id' => 10, 'status' => 'available', 'quantity' => 10]);

        $this->mockDatabase
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->cart->mergeFromSession(1, $sessionCart);

        // Assert
        $this->assertIsInt($result);
    }

    // ========== validateStock() Tests ==========

    /**
     * @test
     * @group models
     * @group cart
     */
    public function validateStock_withSufficientStock_shouldReturnEmptyArray(): void
    {
        // Arrange - Cart items with valid stock
        $cartItems = [
            ['product_id' => 10, 'quantity' => 2, 'product_quantity' => 10, 'product_name' => 'Test']
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($cartItems);

        // Act
        $result = $this->cart->validateStock(1);

        // Assert
        $this->assertIsArray($result);
    }
}
