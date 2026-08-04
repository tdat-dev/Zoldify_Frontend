<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\Follow;
use App\Core\Database;

/**
 * Unit Tests cho Follow Model
 *
 * @covers \App\Models\Follow
 */
class FollowTest extends TestCase
{
    private Follow $follow;
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockDatabase = $this->createMock(Database::class);
        $this->follow = new Follow();

        $reflection = new \ReflectionClass($this->follow);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->follow, $this->mockDatabase);
    }

    // ========== follow() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function follow_withValidUsers_shouldReturnTrue(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->follow->follow(1, 2);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group models
     * @group follow
     */
    public function follow_selfFollow_shouldReturnFalse(): void
    {
        // Arrange - Không thể tự follow chính mình

        // Act
        $result = $this->follow->follow(1, 1);

        // Assert
        $this->assertFalse($result);
    }

    // ========== unfollow() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function unfollow_shouldDeleteFollow(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->follow->unfollow(1, 2);

        // Assert
        $this->assertTrue($result);
    }

    // ========== isFollowing() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function isFollowing_whenFollowing_shouldReturnTrue(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['1' => '1']); // Record exists

        // Act
        $result = $this->follow->isFollowing(1, 2);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group models
     * @group follow
     */
    public function isFollowing_whenNotFollowing_shouldReturnFalse(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->follow->isFollowing(1, 2);

        // Assert
        $this->assertFalse($result);
    }

    // ========== getFollowers() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function getFollowers_shouldReturnFollowersList(): void
    {
        // Arrange
        $mockFollowers = [
            ['id' => 1, 'full_name' => 'Follower 1', 'avatar' => null],
            ['id' => 2, 'full_name' => 'Follower 2', 'avatar' => null]
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockFollowers);

        // Act
        $result = $this->follow->getFollowers(3);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== getFollowing() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function getFollowing_shouldReturnFollowingList(): void
    {
        // Arrange
        $mockFollowing = [
            ['id' => 4, 'full_name' => 'Following 1', 'avatar' => null],
            ['id' => 5, 'full_name' => 'Following 2', 'avatar' => null]
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockFollowing);

        // Act
        $result = $this->follow->getFollowing(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== getFollowerCount() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function getFollowerCount_shouldReturnCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 100]);

        // Act
        $result = $this->follow->getFollowerCount(1);

        // Assert
        $this->assertEquals(100, $result);
    }

    // ========== getFollowingCount() Tests ==========

    /**
     * @test
     * @group models
     * @group follow
     */
    public function getFollowingCount_shouldReturnCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 50]);

        // Act
        $result = $this->follow->getFollowingCount(1);

        // Assert
        $this->assertEquals(50, $result);
    }
}
