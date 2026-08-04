<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\UserAddress;
use App\Core\Database;

/**
 * Unit Tests cho UserAddress Model
 *
 * @covers \App\Models\UserAddress
 */
class UserAddressTest extends TestCase
{
    private UserAddress $address;
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockDatabase = $this->createMock(Database::class);
        $this->address = new UserAddress();

        $reflection = new \ReflectionClass($this->address);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->address, $this->mockDatabase);
    }

    // ========== getByUserId() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function getByUserId_shouldReturnUserAddresses(): void
    {
        // Arrange
        $mockAddresses = [
            ['id' => 1, 'user_id' => 1, 'is_default' => 1, 'full_address' => 'Address 1'],
            ['id' => 2, 'user_id' => 1, 'is_default' => 0, 'full_address' => 'Address 2']
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($mockAddresses);

        // Act
        $result = $this->address->getByUserId(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== getDefaultAddress() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function getDefaultAddress_withDefaultSet_shouldReturnAddress(): void
    {
        // Arrange
        $mockAddress = ['id' => 1, 'user_id' => 1, 'is_default' => 1];

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockAddress);

        // Act
        $result = $this->address->getDefaultAddress(1);

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(1, $result['is_default']);
    }

    /**
     * @test
     * @group models
     * @group address
     */
    public function getDefaultAddress_withNoDefault_shouldReturnNull(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->address->getDefaultAddress(1);

        // Assert
        $this->assertNull($result);
    }

    // ========== findById() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function findById_withOwnership_shouldCheckUserOwnership(): void
    {
        // Arrange
        $mockAddress = ['id' => 1, 'user_id' => 1];

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockAddress);

        // Act
        $result = $this->address->findById(1, 1);

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(1, $result['user_id']);
    }

    /**
     * @test
     * @group models
     * @group address
     */
    public function findById_withWrongOwner_shouldReturnNull(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->address->findById(1, 999);

        // Assert
        $this->assertNull($result);
    }

    // ========== countByUserId() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function countByUserId_shouldReturnAddressCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 3]);

        // Act
        $result = $this->address->countByUserId(1);

        // Assert
        $this->assertEquals(3, $result);
    }

    // ========== createAddress() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function createAddress_firstAddress_shouldAutoSetDefault(): void
    {
        // Arrange - User chưa có địa chỉ nào
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 0]); // countByUserId returns 0

        $this->mockDatabase
            ->method('insert')
            ->willReturn(1);

        $addressData = [
            'user_id' => 1,
            'street_address' => '123 Test St',
            'ward' => 'Ward 1',
            'district' => 'District 1',
            'province' => 'City'
        ];

        // Act
        $result = $this->address->createAddress($addressData);

        // Assert
        $this->assertEquals(1, $result);
    }

    // ========== updateAddress() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function updateAddress_withValidOwner_shouldUpdate(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['id' => 1, 'user_id' => 1]);

        $this->mockDatabase
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->address->updateAddress(1, ['street_address' => 'New Address'], 1);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group models
     * @group address
     */
    public function updateAddress_withInvalidOwner_shouldReturnFalse(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null); // Address not found for this user

        // Act
        $result = $this->address->updateAddress(1, ['street_address' => 'New'], 999);

        // Assert
        $this->assertFalse($result);
    }

    // ========== deleteAddress() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function deleteAddress_withValidOwner_shouldDelete(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['id' => 1, 'user_id' => 1, 'is_default' => 0]);

        $this->mockDatabase
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->address->deleteAddress(1, 1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== setAsDefault() Tests ==========

    /**
     * @test
     * @group models
     * @group address
     */
    public function setAsDefault_shouldClearOthersAndSetNew(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['id' => 2, 'user_id' => 1]);

        $this->mockDatabase
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->address->setAsDefault(2, 1);

        // Assert
        $this->assertTrue($result);
    }

    /**
     * @test
     * @group models
     * @group address
     */
    public function setAsDefault_withWrongOwner_shouldReturnFalse(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->address->setAsDefault(1, 999);

        // Assert
        $this->assertFalse($result);
    }
}
