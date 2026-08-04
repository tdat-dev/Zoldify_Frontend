# 🚀 REDIS CACHE - HƯỚNG DẪN NÂNG CAO

## ✅ ĐÃ HOÀN THÀNH

### **1. Cache Top Keywords** ✓

- Location: `BaseController::getTopKeywords()`
- TTL: 5 phút (300s)
- Cache key: `top_keywords`

### **2. Cache Categories** ✓

- Location: `Category::getAll()`
- TTL: 10 phút (600s)
- Cache key: `categories_all`

### **3. Cache Latest Products** ✓

- Location: `Product::getLatest()`
- TTL: 5 phút (300s)
- Cache key: `latest_products_{limit}`

---

## 📊 HIỆU NĂNG ĐẠT ĐƯỢC

### **Trước khi có Redis:**

```
Mỗi lần load trang chủ:
- Query categories: ~10ms
- Query latest products: ~20ms
- Query top keywords: ~15ms
Total: ~45ms (chỉ queries)
```

### **Sau khi có Redis:**

```
Lần đầu (cache miss):
- Query + Cache: ~50ms

Lần 2+ (cache hit):
- Get from Redis: ~2ms
Total: ~2ms (giảm 95%!)
```

---

## 🎯 PHẦN 2: DÙNG REDIS CHO SESSION

### **Tại sao nên dùng Redis cho Session?**

**Ưu điểm:**

- ✅ Session được lưu trong RAM → Nhanh hơn file
- ✅ Dễ scale (nhiều server dùng chung Redis)
- ✅ Tự động xóa session hết hạn (TTL)
- ✅ Giảm tải ổ đĩa

**Nhược điểm:**

- ❌ Nếu Redis crash → Mất hết session
- ❌ Cần setup backup/persistence

### **Cách 1: Cấu hình trong php.ini (Toàn hệ thống)**

**Bước 1: Mở php.ini**

Laragon → Menu → PHP → php.ini

**Bước 2: Tìm và sửa**

```ini
; Tìm dòng này (khoảng dòng 1400-1500)
session.save_handler = files

; Sửa thành:
session.save_handler = redis
session.save_path = "tcp://127.0.0.1:6379"

; Tùy chọn: Thêm prefix để dễ quản lý
session.save_path = "tcp://127.0.0.1:6379?prefix=unimarket_sess:"
```

**Bước 3: Restart Apache/PHP-FPM**

Laragon → Menu → Apache → Restart

**Bước 4: Test**

```php
<?php
// test_session_redis.php
session_start();
$_SESSION['test'] = 'Hello Redis Session!';
echo "Session ID: " . session_id() . "\n";
echo "Session data: " . $_SESSION['test'];
```

Kiểm tra trong Redis:

```bash
redis-cli KEYS "unimarket_sess:*"
```

### **Cách 2: Cấu hình Runtime (Chỉ cho UniMarket)**

**Tạo file:** `app/Core/SessionHandler.php`

```php
<?php
namespace App\Core;

class SessionHandler
{
    public static function init()
    {
        // Kiểm tra Redis có khả dụng không
        $redis = RedisCache::getInstance();

        if ($redis->isAvailable()) {
            // Dùng Redis cho session
            ini_set('session.save_handler', 'redis');
            ini_set('session.save_path', 'tcp://127.0.0.1:6379?prefix=unimarket_sess:');
        }
        // Nếu Redis không khả dụng → Dùng file (mặc định)

        // Start session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
}
```

**Sử dụng:**

Trong `public/index.php` (đầu file):

```php
<?php
require_once __DIR__ . '/../app/Core/SessionHandler.php';
App\Core\SessionHandler::init();
// ... code khác
```

---

## 🎯 PHẦN 3: MONITORING REDIS

### **3.1. Cài RedisInsight (GUI Tool)**

**Download:**

- Link: https://redis.com/redis-enterprise/redis-insight/
- Chọn: Windows Installer
- Cài đặt bình thường

**Kết nối:**

1. Mở RedisInsight
2. Add Database
3. Host: `127.0.0.1`
4. Port: `6379`
5. Name: `UniMarket Local`
6. Connect

**Tính năng:**

- ✅ Xem tất cả keys
- ✅ Xem giá trị của key
- ✅ Xóa/Sửa keys
- ✅ Monitor real-time
- ✅ Memory analysis
- ✅ Slow log

### **3.2. Monitor bằng Command Line**

**Xem tất cả keys:**

```bash
redis-cli KEYS "*"
```

**Xem keys theo pattern:**

```bash
redis-cli KEYS "top_*"
redis-cli KEYS "latest_*"
redis-cli KEYS "categories_*"
```

**Xem giá trị:**

```bash
redis-cli GET top_keywords
```

**Xem TTL:**

```bash
redis-cli TTL top_keywords
```

**Monitor real-time:**

```bash
redis-cli MONITOR
# Sau đó load trang web → Xem commands được gọi
```

**Xem memory usage:**

```bash
redis-cli INFO memory
```

**Xem stats:**

```bash
redis-cli INFO stats
```

### **3.3. Track Hit/Miss Rate**

**Tạo file:** `app/Core/CacheStats.php`

```php
<?php
namespace App\Core;

class CacheStats
{
    private static $hits = 0;
    private static $misses = 0;

    public static function recordHit()
    {
        self::$hits++;
    }

    public static function recordMiss()
    {
        self::$misses++;
    }

    public static function getStats()
    {
        $total = self::$hits + self::$misses;
        $hitRate = $total > 0 ? (self::$hits / $total) * 100 : 0;

        return [
            'hits' => self::$hits,
            'misses' => self::$misses,
            'total' => $total,
            'hit_rate' => round($hitRate, 2) . '%'
        ];
    }

    public static function display()
    {
        $stats = self::getStats();
        echo "\n=== CACHE STATS ===\n";
        echo "Hits: {$stats['hits']}\n";
        echo "Misses: {$stats['misses']}\n";
        echo "Total: {$stats['total']}\n";
        echo "Hit Rate: {$stats['hit_rate']}\n";
        echo "==================\n";
    }
}
```

**Sử dụng:**

Trong `RedisCache.php`, sửa method `get()`:

```php
public function get($key)
{
    if (!$this->isConnected) {
        return null;
    }

    try {
        $data = $this->redis->get($key);

        if ($data === false) {
            \App\Core\CacheStats::recordMiss(); // ← Thêm
            return null;
        }

        \App\Core\CacheStats::recordHit(); // ← Thêm
        return unserialize($data);
    } catch (Exception $e) {
        error_log('Redis get failed: ' . $e->getMessage());
        return null;
    }
}
```

**Hiển thị stats:**

Cuối file `index.php` (trong development):

```php
if ($_ENV['APP_ENV'] === 'development') {
    \App\Core\CacheStats::display();
}
```

---

## 📝 CACHE STRATEGY

### **Khi nào nên cache?**

✅ **NÊN cache:**

- Dữ liệu ít thay đổi (categories, settings)
- Dữ liệu được truy vấn nhiều (top keywords, popular products)
- Query phức tạp, chậm
- Dữ liệu giống nhau cho nhiều user

❌ **KHÔNG NÊN cache:**

- Dữ liệu thay đổi liên tục (cart, order status)
- Dữ liệu riêng tư của từng user
- Dữ liệu real-time (stock quantity)

### **TTL (Time To Live) nên set bao nhiêu?**

| Loại dữ liệu    | TTL        | Lý do                        |
| --------------- | ---------- | ---------------------------- |
| Categories      | 10-30 phút | Rất ít thay đổi              |
| Top Keywords    | 5 phút     | Cập nhật theo xu hướng       |
| Latest Products | 2-5 phút   | Có sản phẩm mới thường xuyên |
| Product Detail  | 10 phút    | Ít thay đổi                  |
| User Profile    | 15 phút    | Ít thay đổi                  |
| Settings        | 1 giờ      | Rất ít thay đổi              |

### **Cache Invalidation (Xóa cache khi cần)**

**Khi thêm/sửa/xóa dữ liệu → Xóa cache liên quan:**

```php
// Ví dụ: Khi thêm category mới
public function create($data)
{
    // Insert vào DB
    $result = $this->db->insert(...);

    // Xóa cache categories
    $redis = RedisCache::getInstance();
    $redis->delete('categories_all');

    return $result;
}
```

---

## 🎓 BEST PRACTICES

### **1. Namespace cho cache keys**

```php
// ❌ Không tốt
$cacheKey = 'products';

// ✅ Tốt
$cacheKey = 'unimarket:products:latest:12';
```

### **2. Serialize phức tạp**

```php
// ✅ Redis tự động serialize (qua RedisCache helper)
$redis->set('key', ['name' => 'value', 'nested' => [...]]);
```

### **3. Error handling**

```php
// ✅ Luôn có fallback
if ($redis->isAvailable()) {
    // Dùng cache
} else {
    // Query DB trực tiếp
}
```

### **4. Monitor và optimize**

- Xem memory usage định kỳ
- Track hit/miss rate
- Adjust TTL dựa trên usage pattern

---

## 📊 DASHBOARD (TÙY CHỌN)

**Tạo trang admin để xem cache stats:**

`resources/views/admin/cache-dashboard.php`:

```php
<?php
$redis = \App\Core\RedisCache::getInstance();

if ($redis->isAvailable()) {
    // Lấy tất cả keys
    $keys = $redis->redis->keys('*');

    echo "<h1>Cache Dashboard</h1>";
    echo "<table>";
    echo "<tr><th>Key</th><th>TTL</th><th>Size</th></tr>";

    foreach ($keys as $key) {
        $ttl = $redis->ttl($key);
        $size = strlen(serialize($redis->get($key)));

        echo "<tr>";
        echo "<td>$key</td>";
        echo "<td>$ttl s</td>";
        echo "<td>" . number_format($size) . " bytes</td>";
        echo "</tr>";
    }

    echo "</table>";
}
```

---

**Chúc em tối ưu hóa thành công! 🎉**
