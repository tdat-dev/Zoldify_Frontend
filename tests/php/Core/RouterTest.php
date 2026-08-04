<?php

namespace Tests\Core;

use Tests\TestCase;
use App\Core\Router;

/**
 * Unit Tests cho Router
 *
 * @covers \App\Core\Router
 */
class RouterTest extends TestCase
{
    private Router $router;

    protected function setUp(): void
    {
        parent::setUp();
        $this->router = new Router();
    }

    // ========== Route Registration Tests ==========

    /**
     * @test
     * @group core
     * @group router
     */
    public function get_shouldRegisterGetRoute(): void
    {
        // Arrange & Act
        $result = $this->router->get('/test', function () {
            return 'test';
        });

        // Assert - Fluent interface returns self
        $this->assertInstanceOf(Router::class, $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function post_shouldRegisterPostRoute(): void
    {
        // Arrange & Act
        $result = $this->router->post('/test', function () {
            return 'test';
        });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function put_shouldRegisterPutRoute(): void
    {
        // Arrange & Act
        $result = $this->router->put('/test', function () {
            return 'test';
        });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function patch_shouldRegisterPatchRoute(): void
    {
        // Arrange & Act
        $result = $this->router->patch('/test', function () {
            return 'test';
        });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function delete_shouldRegisterDeleteRoute(): void
    {
        // Arrange & Act
        $result = $this->router->delete('/test', function () {
            return 'test';
        });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    // ========== Middleware Tests ==========

    /**
     * @test
     * @group core
     * @group router
     */
    public function registerMiddleware_shouldStoreMiddleware(): void
    {
        // Arrange
        $middlewareHandler = function () {
            return true;
        };

        // Act
        $result = $this->router->registerMiddleware('auth', $middlewareHandler);

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function routeWithMiddleware_shouldAcceptMiddlewareArray(): void
    {
        // Arrange
        $this->router->registerMiddleware('auth', function () {
            return true;
        });

        // Act
        $result = $this->router->get('/protected', function () {
            return 'protected';
        }, ['auth']);

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    // ========== Fluent Interface Tests ==========

    /**
     * @test
     * @group core
     * @group router
     */
    public function methodChaining_shouldWork(): void
    {
        // Arrange & Act
        $result = $this->router
            ->get('/', function () {
                return 'home'; })
            ->get('/about', function () {
                return 'about'; })
            ->post('/contact', function () {
                return 'contact'; });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    // ========== Controller Callback Tests ==========

    /**
     * @test
     * @group core
     * @group router
     */
    public function routeWithControllerArray_shouldBeAccepted(): void
    {
        // Arrange & Act - Using array callback [Controller::class, 'method']
        $result = $this->router->get('/users', ['FakeController', 'index']);

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    // ========== Dynamic Route Pattern Tests ==========

    /**
     * @test
     * @group core
     * @group router
     */
    public function routeWithDynamicParam_shouldBeRegistered(): void
    {
        // Arrange & Act - Route with {id} parameter
        $result = $this->router->get('/users/{id}', function ($id) {
            return "User: {$id}";
        });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function routeWithMultipleParams_shouldBeRegistered(): void
    {
        // Arrange & Act
        $result = $this->router->get('/z/{slug}.p{productId}', function ($slug, $productId) {
            return "Product: {$productId}";
        });

        // Assert
        $this->assertInstanceOf(Router::class, $result);
    }

    // ========== matchDynamicRoute() Tests ==========

    /**
     * @test
     * @group core
     * @group router
     */
    public function matchDynamicRoute_withMatchingUrl_shouldReturnParams(): void
    {
        // Arrange
        $reflection = new \ReflectionClass($this->router);
        $method = $reflection->getMethod('matchDynamicRoute');
        $method->setAccessible(true);

        // Act
        $result = $method->invoke($this->router, 'users/{id}', 'users/123');

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(['123'], $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function matchDynamicRoute_withNonMatchingUrl_shouldReturnNull(): void
    {
        // Arrange
        $reflection = new \ReflectionClass($this->router);
        $method = $reflection->getMethod('matchDynamicRoute');
        $method->setAccessible(true);

        // Act
        $result = $method->invoke($this->router, 'users/{id}', 'products/123');

        // Assert
        $this->assertNull($result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function matchDynamicRoute_withZoldifyProductUrl_shouldExtractParams(): void
    {
        // Arrange
        $reflection = new \ReflectionClass($this->router);
        $method = $reflection->getMethod('matchDynamicRoute');
        $method->setAccessible(true);

        // Act - Zoldify style: /z/ten-san-pham.p123
        $result = $method->invoke($this->router, 'z/{slug}.p{productId}', 'z/iphone-14.p123');

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(['iphone-14', '123'], $result);
    }

    /**
     * @test
     * @group core
     * @group router
     */
    public function matchDynamicRoute_withZoldifyCategoryUrl_shouldExtractParams(): void
    {
        // Arrange
        $reflection = new \ReflectionClass($this->router);
        $method = $reflection->getMethod('matchDynamicRoute');
        $method->setAccessible(true);

        // Act - Zoldify style: /dm/ten-danh-muc.c10
        $result = $method->invoke($this->router, 'dm/{slug}.c{id}', 'dm/dien-thoai.c10');

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(['dien-thoai', '10'], $result);
    }
}
