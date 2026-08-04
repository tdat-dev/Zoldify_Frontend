<?php
/**
 * Stress Test Script - Seed 10,000 Products + Benchmark Queries
 * 
 * Mục đích: Simulate database với nhiều dữ liệu để thấy sự khác biệt về performance
 * 
 * Cách chạy: php scripts/stress_test.php
 */

declare(strict_types=1);

// Load config
require_once __DIR__ . '/../config/database.php';

// Colors for console
define('GREEN', "\033[32m");
define('RED', "\033[31m");
define('YELLOW', "\033[33m");
define('BLUE', "\033[34m");
define('RESET', "\033[0m");

/**
 * Kết nối database
 */
function getConnection(): PDO
{
    $config = require __DIR__ . '/../config/database.php';
    $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

/**
 * ⭐ Seed Random Products
 */
function seedProducts(PDO $pdo, int $count = 10000): void
{
    echo BLUE . "\n📦 Seeding {$count} products..." . RESET . "\n";

    // Lấy user và category IDs có sẵn
    $userIds = $pdo->query("SELECT id FROM users WHERE role IN ('seller', 'admin')")->fetchAll(PDO::FETCH_COLUMN);
    $categoryIds = $pdo->query("SELECT id FROM categories")->fetchAll(PDO::FETCH_COLUMN);

    if (empty($userIds) || empty($categoryIds)) {
        die("❌ Cần có users và categories trước!");
    }

    $conditions = ['new', 'like_new', 'good', 'fair', 'poor'];
    $statuses = ['active', 'active', 'active', 'active', 'hidden', 'sold']; // 67% active

    // Các từ khóa ngẫu nhiên để tạo tên sản phẩm
    $prefixes = ['iPhone', 'Samsung', 'Laptop', 'Sách', 'Áo', 'Quần', 'Giày', 'Tai nghe', 'Chuột', 'Bàn phím', 'MacBook', 'Dell', 'Asus', 'HP', 'Lenovo', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei'];
    $suffixes = ['mới 99%', 'like new', 'fullbox', 'còn bảo hành', '2nd hand', 'xách tay', 'chính hãng', 'giá rẻ', 'sale off', 'freeship'];

    $startTime = microtime(true);
    $batchSize = 1000;
    $inserted = 0;

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (user_id, category_id, name, description, price, quantity, status, product_condition, view_count, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() - INTERVAL FLOOR(RAND() * 365) DAY)
        ");

        for ($i = 0; $i < $count; $i++) {
            $name = $prefixes[array_rand($prefixes)] . ' ' . $suffixes[array_rand($suffixes)] . ' #' . ($i + 1);
            $description = "Sản phẩm chất lượng cao, giao hàng nhanh. Liên hệ để biết thêm chi tiết. Mã sản phẩm: SP" . str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT);
            $price = rand(10000, 50000000); // 10k - 50M
            $quantity = rand(0, 100);

            $stmt->execute([
                $userIds[array_rand($userIds)],
                $categoryIds[array_rand($categoryIds)],
                $name,
                $description,
                $price,
                $quantity,
                $statuses[array_rand($statuses)],
                $conditions[array_rand($conditions)],
                rand(0, 10000) // view_count
            ]);

            $inserted++;

            if ($inserted % $batchSize === 0) {
                $pdo->commit();
                $pdo->beginTransaction();
                echo "  → Inserted {$inserted}/{$count}...\n";
            }
        }

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

    $elapsed = microtime(true) - $startTime;
    echo GREEN . "✅ Seeded {$count} products in " . round($elapsed, 2) . " seconds" . RESET . "\n";
}

/**
 * ⭐ Benchmark Query
 */
function benchmark(PDO $pdo, string $name, string $sql, array $params = []): array
{
    // Warm up (chạy 1 lần trước để cache)
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $stmt->fetchAll();

    // Chạy 5 lần và tính trung bình
    $times = [];
    for ($i = 0; $i < 5; $i++) {
        $start = microtime(true);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        $times[] = (microtime(true) - $start) * 1000; // ms
    }

    $avg = array_sum($times) / count($times);
    $rowCount = count($results);

    // Color based on time
    $color = $avg < 50 ? GREEN : ($avg < 200 ? YELLOW : RED);

    echo sprintf(
        "  %s%-40s%s: %s%.2fms%s (%d rows)\n",
        BLUE,
        $name,
        RESET,
        $color,
        $avg,
        RESET,
        $rowCount
    );

    return ['name' => $name, 'avg_ms' => $avg, 'rows' => $rowCount];
}

/**
 * ⭐ Run All Benchmarks
 */
function runBenchmarks(PDO $pdo): void
{
    echo BLUE . "\n🔍 Running Benchmarks...\n" . RESET;
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $results = [];

    // 1. Count total products
    $total = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    echo YELLOW . "📊 Total products: {$total}\n" . RESET;
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // 2. LIKE Search (BAD - Full Table Scan)
    echo YELLOW . "📌 LIKE Search (No Index)" . RESET . "\n";
    $results[] = benchmark(
        $pdo,
        "LIKE '%laptop%'",
        "SELECT * FROM products WHERE name LIKE ? LIMIT 20",
        ['%laptop%']
    );
    $results[] = benchmark(
        $pdo,
        "LIKE '%iphone%'",
        "SELECT * FROM products WHERE name LIKE ? LIMIT 20",
        ['%iphone%']
    );

    echo "\n";

    // 3. FULLTEXT Search (GOOD - Uses Index)
    echo YELLOW . "📌 FULLTEXT Search (Uses Index)" . RESET . "\n";
    $results[] = benchmark(
        $pdo,
        "FULLTEXT 'laptop'",
        "SELECT * FROM products WHERE MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE) LIMIT 20",
        ['laptop']
    );
    $results[] = benchmark(
        $pdo,
        "FULLTEXT 'iphone'",
        "SELECT * FROM products WHERE MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE) LIMIT 20",
        ['iphone']
    );

    echo "\n";

    // 4. Category Filter (Uses Index)
    echo YELLOW . "📌 Category Filter (Uses Index)" . RESET . "\n";
    $results[] = benchmark(
        $pdo,
        "Category ID = 2",
        "SELECT * FROM products WHERE status = 'active' AND category_id = 2 LIMIT 20",
        []
    );

    echo "\n";

    // 5. Subquery (Sold Count) - SLOW
    echo YELLOW . "📌 Subquery (Sold Count)" . RESET . "\n";
    $results[] = benchmark(
        $pdo,
        "With Sold Count Subquery",
        "SELECT p.*, 
            (SELECT COALESCE(SUM(od.quantity), 0) 
             FROM order_details od 
             JOIN orders o ON od.order_id = o.id 
             WHERE od.product_id = p.id 
             AND o.status IN ('completed', 'received')) AS sold_count
         FROM products p 
         WHERE p.status = 'active' 
         LIMIT 50",
        []
    );

    echo "\n";

    // 6. Pagination Offset
    echo YELLOW . "📌 Pagination Offset Performance" . RESET . "\n";
    $results[] = benchmark(
        $pdo,
        "Page 1 (OFFSET 0)",
        "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 20 OFFSET 0",
        []
    );
    $results[] = benchmark(
        $pdo,
        "Page 100 (OFFSET 1980)",
        "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 20 OFFSET 1980",
        []
    );
    $results[] = benchmark(
        $pdo,
        "Page 500 (OFFSET 9980)",
        "SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT 20 OFFSET 9980",
        []
    );

    echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo GREEN . "✅ Benchmark complete!\n" . RESET;

    // Summary
    echo "\n" . BLUE . "📋 SUMMARY:" . RESET . "\n";
    echo "  • < 50ms = " . GREEN . "GOOD" . RESET . "\n";
    echo "  • 50-200ms = " . YELLOW . "WARNING" . RESET . "\n";
    echo "  • > 200ms = " . RED . "SLOW" . RESET . "\n";
}

/**
 * ⭐ Show EXPLAIN Results
 */
function showExplain(PDO $pdo): void
{
    echo BLUE . "\n🔬 EXPLAIN Analysis...\n" . RESET;
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $queries = [
        "LIKE Search (BAD)" => "EXPLAIN SELECT * FROM products WHERE name LIKE '%laptop%'",
        "FULLTEXT (GOOD)" => "EXPLAIN SELECT * FROM products WHERE MATCH(name, description) AGAINST('laptop')",
        "Index Filter (GOOD)" => "EXPLAIN SELECT * FROM products WHERE status = 'active' AND category_id = 2",
    ];

    foreach ($queries as $name => $sql) {
        echo YELLOW . "\n📌 {$name}:\n" . RESET;
        $result = $pdo->query($sql)->fetch();

        echo "  type: " . ($result['type'] === 'ALL' ? RED : GREEN) . $result['type'] . RESET . "\n";
        echo "  key: " . ($result['key'] ? GREEN . $result['key'] : RED . "NULL (no index!)") . RESET . "\n";
        echo "  rows: " . $result['rows'] . "\n";
        echo "  Extra: " . ($result['Extra'] ?? 'NULL') . "\n";
    }
}

/**
 * ⭐ Cleanup (remove seeded data)
 */
function cleanup(PDO $pdo): void
{
    echo YELLOW . "\n🧹 Cleaning up seeded data...\n" . RESET;

    // Delete products với name có pattern "SP" (seeded products)
    $deleted = $pdo->exec("DELETE FROM products WHERE description LIKE '%Mã sản phẩm: SP%'");
    echo GREEN . "✅ Deleted {$deleted} seeded products\n" . RESET;
}

// =====================================================================
// MAIN SCRIPT
// =====================================================================

echo "\n" . BLUE . "════════════════════════════════════════════════════════════" . RESET;
echo "\n" . BLUE . "  🚀 ZOLDIFY STRESS TEST & EXPLAIN DEMO" . RESET;
echo "\n" . BLUE . "════════════════════════════════════════════════════════════\n" . RESET;

$pdo = getConnection();

// Menu
echo "\nChọn hành động:\n";
echo "  1. Seed 10,000 products + Run benchmarks\n";
echo "  2. Run benchmarks only (không seed)\n";
echo "  3. Show EXPLAIN analysis\n";
echo "  4. Cleanup (xóa dữ liệu seed)\n";
echo "  5. Full test (seed + benchmark + explain)\n";
echo "\nNhập số (1-5): ";

$choice = trim(fgets(STDIN) ?: '5');

switch ($choice) {
    case '1':
        seedProducts($pdo, 10000);
        runBenchmarks($pdo);
        break;
    case '2':
        runBenchmarks($pdo);
        break;
    case '3':
        showExplain($pdo);
        break;
    case '4':
        cleanup($pdo);
        break;
    case '5':
    default:
        seedProducts($pdo, 10000);
        runBenchmarks($pdo);
        showExplain($pdo);
        break;
}

echo "\n" . GREEN . "Done! 🎉\n" . RESET;
