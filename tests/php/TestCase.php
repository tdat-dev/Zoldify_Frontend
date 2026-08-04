<?php

namespace Tests;

use PHPUnit\Framework\TestCase as BaseTestCase;

/**
 * Base TestCase cho tất cả PHP tests
 * 
 * Cung cấp:
 * - Mock Database connection
 * - Helper methods cho testing
 * - Setup/Teardown hooks
 */
abstract class TestCase extends BaseTestCase
{
    /**
     * Mock PDO connection
     */
    protected $mockPdo;

    /**
     * Mock Database instance
     */
    protected $mockDb;

    /**
     * Setup trước mỗi test
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Tạo mock PDO
        $this->mockPdo = $this->createMock(\PDO::class);
    }

    /**
     * Teardown sau mỗi test
     */
    protected function tearDown(): void
    {
        parent::tearDown();
        $this->mockPdo = null;
        $this->mockDb = null;
    }

    /**
     * Tạo mock PDOStatement
     *
     * @param mixed $returnValue Giá trị execute() trả về
     * @param mixed $fetchValue Giá trị fetch() trả về
     * @return \PDOStatement
     */
    protected function createMockStatement($returnValue = true, $fetchValue = null)
    {
        $stmt = $this->createMock(\PDOStatement::class);
        $stmt->method('execute')->willReturn($returnValue);
        $stmt->method('fetch')->willReturn($fetchValue);
        $stmt->method('fetchAll')->willReturn($fetchValue ? [$fetchValue] : []);
        $stmt->method('rowCount')->willReturn($returnValue ? 1 : 0);
        return $stmt;
    }

    /**
     * Helper: Tạo mock user data
     *
     * @param array $overrides Các field muốn override
     * @return array
     */
    protected function createUserData(array $overrides = []): array
    {
        return array_merge([
            'id' => 1,
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT),
            'phone_number' => '0123456789',
            'address' => '123 Test Street',
            'role' => 'user',
            'email_verified' => 1,
            'is_locked' => 0,
            'avatar' => null,
            'balance' => 0,
            'created_at' => date('Y-m-d H:i:s')
        ], $overrides);
    }

    /**
     * Helper: Tạo mock product data
     *
     * @param array $overrides Các field muốn override
     * @return array
     */
    protected function createProductData(array $overrides = []): array
    {
        return array_merge([
            'id' => 1,
            'user_id' => 1,
            'category_id' => 1,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'This is a test product description.',
            'price' => 100000,
            'quantity' => 10,
            'condition' => 'new',
            'status' => 'available',
            'created_at' => date('Y-m-d H:i:s')
        ], $overrides);
    }

    /**
     * Helper: Tạo mock order data
     *
     * @param array $overrides Các field muốn override
     * @return array
     */
    protected function createOrderData(array $overrides = []): array
    {
        return array_merge([
            'id' => 1,
            'user_id' => 1,
            'seller_id' => 2,
            'total_amount' => 150000,
            'status' => 'pending',
            'shipping_address' => '456 Delivery St',
            'shipping_phone' => '0987654321',
            'payment_method' => 'cod',
            'created_at' => date('Y-m-d H:i:s')
        ], $overrides);
    }

    /**
     * Assert that an array has specific keys
     *
     * @param array $keys Keys expected
     * @param array $array Array to check
     */
    protected function assertArrayHasKeys(array $keys, array $array): void
    {
        foreach ($keys as $key) {
            $this->assertArrayHasKey($key, $array, "Array missing expected key: {$key}");
        }
    }
}
