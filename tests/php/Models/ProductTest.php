<?php

namespace Tests\Models;

use Tests\TestCase;
use App\Models\Product;
use App\Core\Database;

/**
 * Unit Tests cho Product Model
 *
 * @covers \App\Models\Product
 */
class ProductTest extends TestCase
{
    /**
     * @var Product
     */
    private Product $product;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject|Database
     */
    private $mockDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockDatabase = $this->createMock(Database::class);
        $this->product = new Product();

        // Inject mock database
        $reflection = new \ReflectionClass($this->product);
        $property = $reflection->getProperty('db');
        $property->setAccessible(true);
        $property->setValue($this->product, $this->mockDatabase);
    }

    // ========== all() Tests ==========

    /**
     * @test
     * @group product
     */
    public function all_shouldReturnAllProducts(): void
    {
        // Arrange
        $products = [
            $this->createProductData(['id' => 1]),
            $this->createProductData(['id' => 2])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->all();

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== find() Tests ==========

    /**
     * @test
     * @group product
     */
    public function find_withExistingId_shouldReturnProduct(): void
    {
        // Arrange
        $mockProduct = $this->createProductData(['id' => 42, 'name' => 'Test Product']);

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn($mockProduct);

        // Act
        $result = $this->product->find(42);

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(42, $result['id']);
        $this->assertEquals('Test Product', $result['name']);
    }

    /**
     * @test
     * @group product
     */
    public function find_withNonExistingId_shouldReturnNull(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(null);

        // Act
        $result = $this->product->find(99999);

        // Assert
        $this->assertNull($result);
    }

    // ========== create() Tests ==========

    /**
     * @test
     * @group product
     */
    public function create_withValidData_shouldReturnInsertId(): void
    {
        // Arrange
        $productData = [
            'user_id' => 1,
            'category_id' => 5,
            'name' => 'New Product',
            'description' => 'Product description',
            'price' => 299000,
            'quantity' => 10,
            'condition' => 'new'
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('insert')
            ->willReturn(123);

        // Act
        $result = $this->product->create($productData);

        // Assert
        $this->assertEquals(123, $result);
    }

    // ========== getLatest() Tests ==========

    /**
     * @test
     * @group product
     */
    public function getLatest_shouldReturnLimitedProducts(): void
    {
        // Arrange
        $products = array_fill(0, 12, $this->createProductData());

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getLatest(12);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(12, $result);
    }

    /**
     * @test
     * @group product
     */
    public function getLatest_withCustomLimit_shouldRespectLimit(): void
    {
        // Arrange
        $products = array_fill(0, 5, $this->createProductData());

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getLatest(5);

        // Assert
        $this->assertCount(5, $result);
    }

    // ========== getRandom() Tests ==========

    /**
     * @test
     * @group product
     */
    public function getRandom_shouldReturnRandomProducts(): void
    {
        // Arrange
        $products = array_fill(0, 6, $this->createProductData());

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getRandom(6);

        // Assert
        $this->assertIsArray($result);
    }

    // ========== countAll() Tests ==========

    /**
     * @test
     * @group product
     */
    public function countAll_shouldReturnTotalCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 500]);

        // Act
        $result = $this->product->countAll();

        // Assert
        $this->assertEquals(500, $result);
    }

    // ========== count() Tests ==========

    /**
     * @test
     * @group product
     */
    public function count_shouldReturnTotalProducts(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 250]);

        // Act
        $result = $this->product->count();

        // Assert
        $this->assertEquals(250, $result);
    }

    // ========== getByUserId() Tests ==========

    /**
     * @test
     * @group product
     */
    public function getByUserId_shouldReturnUserProducts(): void
    {
        // Arrange
        $products = [
            $this->createProductData(['user_id' => 5]),
            $this->createProductData(['user_id' => 5])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getByUserId(5);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    // ========== countByUserId() Tests ==========

    /**
     * @test
     * @group product
     */
    public function countByUserId_shouldReturnUserProductCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 15]);

        // Act
        $result = $this->product->countByUserId(5);

        // Assert
        $this->assertEquals(15, $result);
    }

    // ========== searchByKeyword() Tests ==========

    /**
     * @test
     * @group product
     * @group search
     */
    public function searchByKeyword_shouldReturnMatchingProducts(): void
    {
        // Arrange
        $products = [
            $this->createProductData(['name' => 'iPhone 15']),
            $this->createProductData(['name' => 'iPhone 14'])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->searchByKeyword('iPhone', 10, 0);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    /**
     * @test
     * @group product
     * @group search
     */
    public function searchByKeyword_withNoResults_shouldReturnEmptyArray(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn([]);

        // Act
        $result = $this->product->searchByKeyword('xyz123abc', 10, 0);

        // Assert
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // ========== countByKeyword() Tests ==========

    /**
     * @test
     * @group product
     * @group search
     */
    public function countByKeyword_shouldReturnMatchCount(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 45]);

        // Act
        $result = $this->product->countByKeyword('laptop');

        // Assert
        $this->assertEquals(45, $result);
    }

    // ========== getByCategory() Tests ==========

    /**
     * @test
     * @group product
     */
    public function getByCategory_shouldReturnCategoryProducts(): void
    {
        // Arrange
        $products = [
            $this->createProductData(['category_id' => 3])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getByCategory(3, 4);

        // Assert
        $this->assertIsArray($result);
    }

    /**
     * @test
     * @group product
     */
    public function getByCategory_withExcludeId_shouldExcludeProduct(): void
    {
        // Arrange
        $products = [
            $this->createProductData(['id' => 2]),
            $this->createProductData(['id' => 3])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act - exclude product ID 1
        $result = $this->product->getByCategory(3, 4, 1);

        // Assert
        $this->assertIsArray($result);
    }

    // ========== update() Tests ==========

    /**
     * @test
     * @group product
     */
    public function update_withValidData_shouldReturnTrue(): void
    {
        // Arrange
        $updateData = [
            'name' => 'Updated Product',
            'price' => 399000,
            'quantity' => 5
        ];

        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->product->update(1, $updateData);

        // Assert
        $this->assertTrue($result);
    }

    // ========== delete() Tests ==========

    /**
     * @test
     * @group product
     */
    public function delete_shouldDeleteProduct(): void
    {
        // Arrange
        $this->mockDatabase
            ->expects($this->once())
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->product->delete(1);

        // Assert
        $this->assertTrue($result);
    }

    // ========== decreaseQuantity() Tests ==========

    /**
     * @test
     * @group product
     * @group inventory
     */
    public function decreaseQuantity_shouldDecreaseStock(): void
    {
        // Arrange
        $this->mockDatabase
            ->method('execute')
            ->willReturn(1);

        // Act
        $result = $this->product->decreaseQuantity(1, 2);

        // Assert
        $this->assertTrue($result);
    }

    // ========== getFiltered() Tests ==========

    /**
     * @test
     * @group product
     * @group filter
     */
    public function getFiltered_withCategoryFilter_shouldFilterByCategory(): void
    {
        // Arrange
        $filters = ['category_id' => 5];
        $products = [
            $this->createProductData(['category_id' => 5])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getFiltered($filters, 10, 0);

        // Assert
        $this->assertIsArray($result);
    }

    /**
     * @test
     * @group product
     * @group filter
     */
    public function getFiltered_withPriceRange_shouldFilterByPrice(): void
    {
        // Arrange
        $filters = [
            'min_price' => 100000,
            'max_price' => 500000
        ];
        $products = [
            $this->createProductData(['price' => 200000])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getFiltered($filters, 10, 0);

        // Assert
        $this->assertIsArray($result);
    }

    /**
     * @test
     * @group product
     * @group filter
     */
    public function getFiltered_withKeywordFilter_shouldSearchByKeyword(): void
    {
        // Arrange
        $filters = ['keyword' => 'samsung'];
        $products = [
            $this->createProductData(['name' => 'Samsung Galaxy S24'])
        ];

        $this->mockDatabase
            ->method('fetchAll')
            ->willReturn($products);

        // Act
        $result = $this->product->getFiltered($filters, 10, 0);

        // Assert
        $this->assertIsArray($result);
    }

    // ========== countFiltered() Tests ==========

    /**
     * @test
     * @group product
     * @group filter
     */
    public function countFiltered_shouldReturnFilteredCount(): void
    {
        // Arrange
        $filters = ['category_id' => 3];

        $this->mockDatabase
            ->method('fetchOne')
            ->willReturn(['total' => 25]);

        // Act
        $result = $this->product->countFiltered($filters);

        // Assert
        $this->assertEquals(25, $result);
    }
}
