# 🧪 Testing Guide - UniMarket

Hướng dẫn chạy và viết tests cho dự án UniMarket.

## 📋 Tổng quan

UniMarket sử dụng 2 testing frameworks:

| Framework   | Ngôn ngữ   | Thư mục      |
| ----------- | ---------- | ------------ |
| **Jest**    | JavaScript | `tests/js/`  |
| **PHPUnit** | PHP        | `tests/php/` |

---

## 🚀 Quick Start

### JavaScript Tests (Jest)

```bash
# Cài đặt dependencies (chỉ lần đầu)
npm install

# Chạy tất cả tests
npm test

# Chạy với watch mode (tự động re-run khi file thay đổi)
npm run test:watch

# Xem coverage report
npm run test:coverage
```

### PHP Tests (PHPUnit)

```bash
# Cài đặt dependencies (chỉ lần đầu)
composer install

# Chạy tất cả tests
./vendor/bin/phpunit

# Chạy với verbose output
./vendor/bin/phpunit --verbose

# Chạy một file test cụ thể
./vendor/bin/phpunit tests/php/Models/UserTest.php

# Chạy theo group
./vendor/bin/phpunit --group=auth

# Xem coverage (yêu cầu Xdebug)
./vendor/bin/phpunit --coverage-text
```

---

## 📁 Cấu trúc thư mục

```
tests/
├── js/                          # JavaScript Tests (Jest)
│   ├── chat-socket.test.js      # Tests cho ChatSocket class
│   ├── chat-page.test.js        # Tests cho Chat page handler
│   └── product-create.test.js   # Tests cho Product creation form
│
├── php/                         # PHP Tests (PHPUnit)
│   ├── bootstrap.php            # Bootstrap file cho PHPUnit
│   ├── TestCase.php             # Base TestCase class
│   ├── Models/
│   │   ├── UserTest.php         # Tests cho User model
│   │   └── ProductTest.php      # Tests cho Product model
│   └── Services/
│       └── AuthServiceTest.php  # Tests cho AuthService
│
└── security/                    # Security tests và documentation
    └── sql_injection_test.php
```

---

## 📝 Viết Tests mới

### JavaScript (Jest)

```javascript
// tests/js/example.test.js

// Mock dependencies
const mockDependency = jest.fn();
global.dependency = mockDependency;

describe("MyClass", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### PHP (PHPUnit)

```php
<?php
// tests/php/Models/ExampleTest.php

namespace Tests\Models;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Setup code
    }

    /**
     * @test
     * @group example
     */
    public function it_should_do_something(): void
    {
        // Arrange
        $input = 'test';

        // Act
        $result = $this->example->process($input);

        // Assert
        $this->assertEquals('expected', $result);
    }
}
```

---

## 🎯 Test Categories

### Jest Groups

- **socket** - WebSocket / Socket.IO tests
- **dom** - DOM manipulation tests
- **upload** - File upload tests

### PHPUnit Groups

- **auth** - Authentication tests
- **user** - User model tests
- **product** - Product model tests
- **admin** - Admin functionality tests
- **search** - Search functionality tests
- **filter** - Filter functionality tests

Chạy theo group:

```bash
# PHPUnit
./vendor/bin/phpunit --group=auth

# Jest (sử dụng test.only hoặc describe.only)
```

---

## 🔧 Mock Patterns

### Mocking Database (PHP)

```php
// Tạo mock Database
$this->mockDatabase = $this->createMock(Database::class);

// Setup expectations
$this->mockDatabase
    ->method('fetchOne')
    ->willReturn(['id' => 1, 'name' => 'Test']);

// Inject vào model
$reflection = new \ReflectionClass($this->model);
$property = $reflection->getProperty('db');
$property->setAccessible(true);
$property->setValue($this->model, $this->mockDatabase);
```

### Mocking Socket.IO (JavaScript)

```javascript
const mockSocketInstance = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

global.io = jest.fn(() => mockSocketInstance);
```

### Mocking DOM (JavaScript)

```javascript
document.getElementById = jest.fn((id) => {
  const elements = {
    "my-element": { value: "test", classList: { add: jest.fn() } },
  };
  return elements[id] || null;
});
```

---

## ✅ Best Practices

### 1. Arrange-Act-Assert Pattern

```php
// Arrange - Setup test data và mocks
$userData = ['email' => 'test@example.com'];

// Act - Thực hiện action cần test
$result = $this->user->register($userData);

// Assert - Verify kết quả
$this->assertTrue($result);
```

### 2. Một assertion chính cho mỗi test

```php
// ✅ Good - Một focus rõ ràng
public function test_login_returns_user_on_success(): void
{
    $result = $this->auth->login('user@test.com', 'password');
    $this->assertIsArray($result);
}

// ❌ Bad - Quá nhiều assertions
public function test_login(): void
{
    $result = $this->auth->login('user@test.com', 'password');
    $this->assertIsArray($result);
    $this->assertArrayHasKey('id', $result);
    $this->assertArrayHasKey('email', $result);
    $this->assertEquals('user@test.com', $result['email']);
}
```

### 3. Tên test mô tả rõ ràng

```php
// ✅ Good
public function test_register_with_duplicate_email_should_fail()

// ❌ Bad
public function test1()
```

### 4. Isolated tests

- Mỗi test phải độc lập
- Không phụ thuộc vào thứ tự chạy
- Sử dụng `setUp()` và `tearDown()` để reset state

---

## 📊 Coverage Goals

| Component   | Target Coverage |
| ----------- | --------------- |
| Models      | 80%+            |
| Services    | 70%+            |
| Controllers | 50%+            |
| JavaScript  | 60%+            |

Xem coverage:

```bash
# PHP
./vendor/bin/phpunit --coverage-html coverage/

# JavaScript
npm run test:coverage
```

---

## 🐛 Debugging Tests

### PHPUnit

```bash
# Verbose output
./vendor/bin/phpunit --verbose

# Stop on first failure
./vendor/bin/phpunit --stop-on-failure

# Debug một test cụ thể
./vendor/bin/phpunit --filter=test_login_returns_user
```

### Jest

```bash
# Verbose output
npm test -- --verbose

# Run specific test file
npm test -- chat-socket.test.js

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [PHPUnit Documentation](https://docs.phpunit.de/)
- [Testing Best Practices](https://phptherightway.com/#testing)
