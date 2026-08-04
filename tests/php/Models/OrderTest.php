<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\Order;
use App\Core\Database;

/**
 * Unit Tests cho Order Model
 *
 * @covers \App\Models\Order
 */
class OrderTest extends TestCase
{
    private Order $order;
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockDatabase = $this->createMock(Database::class);
        $this->order = new Order();

        $reflection = new \ReflectionClass($this->order);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->order, $this->mockDatabase);
    }

    // ========== createOrder() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function createOrder_withValidData_shouldReturnOrderId(): void
    {
        // Arrange
        $orderData = [
            'buyer_id' => 1,
            'seller_id' => 2,
            'total_amount' => 500000,
            'shipping_address' => '123 Test St',
            'shipping_phone' => '0912345678',
            'payment_method' => 'cod'
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->willReturn(1);

        // Act
        $result = $this->order->createOrder($orderData);

        // Assert
        $this->assertEquals(1, $result);
    }

    // ========== findWithDetails() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function findWithDetails_withExistingOrder_shouldReturnOrderWithBuyerSeller(): void
    {
        // Arrange
        $mockOrder = $this->createOrderData([
            'id' => 1,
            'buyer_name' => 'Buyer Name',
            'seller_name' => 'Seller Name'
        ]);

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockOrder);

        // Act
        $result = $this->order->findWithDetails(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertArrayHasKey('buyer_name', $result);
        $this->assertArrayHasKey('seller_name', $result);
    }

    /**
     * @test
     * @group models
     * @group order
     */
    public function findWithDetails_withNonExistingOrder_shouldReturnNull(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->order->findWithDetails(99999);

        // Assert
        $this->assertNull($result);
    }

    // ========== getByBuyerId() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function getByBuyerId_shouldReturnBuyerOrders(): void
    {
        // Arrange
        $mockOrders = [
            $this->createOrderData(['id' => 1, 'buyer_id' => 1]),
            $this->createOrderData(['id' => 2, 'buyer_id' => 1])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockOrders);

        // Act
        $result = $this->order->getByBuyerId(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== getBySellerId() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function getBySellerId_shouldReturnSellerOrders(): void
    {
        // Arrange
        $mockOrders = [
            $this->createOrderData(['id' => 1, 'seller_id' => 2]),
            $this->createOrderData(['id' => 2, 'seller_id' => 2])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockOrders);

        // Act
        $result = $this->order->getBySellerId(2);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== updateStatus() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function updateStatus_shouldChangeOrderStatus(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->order->updateStatus(1, 'shipping');

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group models
     * @group order
     */
    public function updateStatus_withCancelReason_shouldStoreReason(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->order->updateStatus(1, 'cancelled', 'Buyer cancelled');

        // Assert
        $this->assertTrue($result);
    }

    // ========== markAsPaid() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function markAsPaid_shouldUpdateStatusToPaid(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->order->markAsPaid(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== confirmReceived() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function confirmReceived_shouldUpdateStatusToReceived(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->order->confirmReceived(1, 3);

        // Assert
        $this->assertTrue($result);
    }

    // ========== markAsCompleted() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function markAsCompleted_shouldUpdateStatusToCompleted(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->order->markAsCompleted(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== getOrderItems() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function getOrderItems_shouldReturnOrderProducts(): void
    {
        // Arrange
        $mockItems = [
            ['id' => 1, 'order_id' => 1, 'product_id' => 10, 'quantity' => 2, 'price' => 100000],
            ['id' => 2, 'order_id' => 1, 'product_id' => 20, 'quantity' => 1, 'price' => 200000]
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockItems);

        // Act
        $result = $this->order->getOrderItems(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== countByStatus() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function countByStatus_shouldReturnStatusCounts(): void
    {
        // Arrange
        $mockCounts = [
            ['status' => 'pending', 'count' => 5],
            ['status' => 'paid', 'count' => 10],
            ['status' => 'completed', 'count' => 20]
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockCounts);

        // Act
        $result = $this->order->countByStatus();

        // Assert
        $this->assertIsArray($result);
    }

    // ========== getTotalRevenue() Tests ==========

    /**
     * @test
     * @group models
     * @group order
     */
    public function getTotalRevenue_shouldReturnTotalAmount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 10000000]);

        // Act
        $result = $this->order->getTotalRevenue();

        // Assert
        $this->assertEquals(10000000, $result);
    }
}
