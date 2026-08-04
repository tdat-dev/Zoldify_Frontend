<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\Notification;
use App\Core\Database;

/**
 * Unit Tests cho Notification Model
 *
 * @covers \App\Models\Notification
 */
class NotificationTest extends TestCase
{
    private Notification $notification;
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockDatabase = $this->createMock(Database::class);
        $this->notification = new Notification();

        $reflection = new \ReflectionClass($this->notification);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->notification, $this->mockDatabase);
    }

    // ========== createNotification() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function createNotification_shouldReturnNotificationId(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->willReturn(1);

        // Act
        $result = $this->notification->createNotification(1, 'Đơn hàng mới!', 'order');

        // Assert
        $this->assertEquals(1, $result);
    }

    /**
     * @test
     * @group models
     * @group notification
     */
    public function createNotification_withDefaultType_shouldUseSystem(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->with(
                $this->anything(),
                $this->callback(function ($params) {
                    return $params[2] === 'system';
                })
            )
            ->willReturn(1);

        // Act
        $this->notification->createNotification(1, 'Thông báo hệ thống');

        // Assert is implicit (expectation in mock)
    }

    // ========== getUnread() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function getUnread_shouldReturnUnreadNotifications(): void
    {
        // Arrange
        $mockNotifications = [
            ['id' => 1, 'content' => 'Notification 1', 'is_read' => 0],
            ['id' => 2, 'content' => 'Notification 2', 'is_read' => 0]
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockNotifications);

        // Act
        $result = $this->notification->getUnread(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== getByUserId() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function getByUserId_shouldReturnAllNotifications(): void
    {
        // Arrange
        $mockNotifications = [
            ['id' => 1, 'content' => 'Notification 1'],
            ['id' => 2, 'content' => 'Notification 2'],
            ['id' => 3, 'content' => 'Notification 3']
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockNotifications);

        // Act
        $result = $this->notification->getByUserId(1, 20);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(3, $result);
    }

    // ========== countUnread() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function countUnread_shouldReturnUnreadCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 5]);

        // Act
        $result = $this->notification->countUnread(1);

        // Assert
        $this->assertEquals(5, $result);
    }

    /**
     * @test
     * @group models
     * @group notification
     */
    public function countUnread_withNoUnread_shouldReturnZero(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 0]);

        // Act
        $result = $this->notification->countUnread(1);

        // Assert
        $this->assertEquals(0, $result);
    }

    // ========== markAsRead() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function markAsRead_shouldUpdateNotification(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->notification->markAsRead(1, 1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== markAllAsRead() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function markAllAsRead_shouldUpdateAllUnreadNotifications(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->notification->markAllAsRead(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== deleteOld() Tests ==========

    /**
     * @test
     * @group models
     * @group notification
     */
    public function deleteOld_shouldDeleteOldNotifications(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(10);

        // Act
        $result = $this->notification->deleteOld(30);

        // Assert
        $this->assertEquals(10, $result);
    }
}
