# HƯỚNG DẪN CÀI ĐẶT REDIS CHO UNIMARKET

## 📋 YÊU CẦU

- Windows 10/11
- Laragon (hoặc XAMPP/WAMP)
- PHP 8.3.x

---

## 🚀 BƯỚC 1: CÀI ĐẶT REDIS SERVER

### Cách 1: Dùng Laragon (Khuyên dùng)

1. Mở Laragon
2. Menu → Quick add → Redis
3. Chọn phiên bản mới nhất
4. Laragon sẽ tự động download và cài đặt
5. Start Redis từ Laragon menu

### Cách 2: Cài thủ công

1. Download Redis for Windows:

   - Link: https://github.com/tporadowski/redis/releases
   - File: `Redis-x64-5.0.14.1.msi` (hoặc mới hơn)

2. Cài đặt:

   - Chạy file .msi
   - ✅ Chọn "Add Redis to PATH"
   - ✅ Chọn "Install as Windows Service"
   - Click "Install"

3. Kiểm tra:
   ```bash
   redis-cli ping
   # Kết quả mong đợi: PONG
   ```

---

## 🔧 BƯỚC 2: CÀI ĐẶT PHP REDIS EXTENSION

### 2.1. Kiểm tra phiên bản PHP

```bash
php -v
# Ghi nhớ: PHP version (VD: 8.3.26), Thread Safety (TS/NTS), Architecture (x64/x86)
```

### 2.2. Download Redis Extension

1. Vào: https://windows.php.net/downloads/pecl/releases/redis/
2. Chọn folder phiên bản mới nhất (VD: `6.0.2`)
3. Download file phù hợp với PHP của bạn:
   - **PHP 8.3, Thread Safe, x64**: `php_redis-6.0.2-8.3-ts-vs16-x64.zip`
   - **PHP 8.3, Non-Thread Safe, x64**: `php_redis-6.0.2-8.3-nts-vs16-x64.zip`

### 2.3. Cài đặt Extension

**Trong Laragon:**

1. Giải nén file zip vừa download
2. Copy file `php_redis.dll` vào:

   ```
   D:\laragon\bin\php\php-8.3.x\ext\
   ```

   (Thay `8.3.x` bằng phiên bản PHP thực tế)

3. Mở file `php.ini`:

   - Laragon → Menu → PHP → php.ini
   - Hoặc: `D:\laragon\bin\php\php-8.3.x\php.ini`

4. Thêm dòng này vào cuối file:

   ```ini
   extension=redis
   ```

5. Lưu file và restart Laragon

### 2.4. Kiểm tra

```bash
php -m | findstr redis
# Kết quả mong đợi: redis
```

Hoặc:

```bash
php -r "echo extension_loaded('redis') ? 'Redis OK' : 'Redis NOT installed';"
# Kết quả mong đợi: Redis OK
```

---

## ✅ BƯỚC 3: TEST REDIS

### 3.1. Test Redis Server

```bash
redis-cli ping
# Kết quả: PONG
```

### 3.2. Test PHP Redis Extension

Tạo file `test_redis.php`:

```php
<?php
try {
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);

    // Test set/get
    $redis->set('test_key', 'Hello Redis!');
    $value = $redis->get('test_key');

    echo "✅ Redis hoạt động!\n";
    echo "Value: $value\n";

    // Xóa test key
    $redis->del('test_key');

} catch (Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
}
```

Chạy:

```bash
php test_redis.php
# Kết quả mong đợi: ✅ Redis hoạt động!
```

---

## 🎯 BƯỚC 4: TEST TRONG UNIMARKET

### 4.1. Test RedisCache Helper

Tạo file `test_redis_cache.php` trong root project:

```php
<?php
require_once 'app/Core/RedisCache.php';

use App\Core\RedisCache;

$redis = RedisCache::getInstance();

if ($redis->isAvailable()) {
    echo "✅ Redis đã kết nối thành công!\n\n";

    // Test set
    $redis->set('test', ['name' => 'UniMarket', 'version' => '1.0'], 60);
    echo "✅ Đã lưu cache\n";

    // Test get
    $data = $redis->get('test');
    echo "✅ Đã lấy cache: " . json_encode($data) . "\n";

    // Test TTL
    $ttl = $redis->ttl('test');
    echo "✅ TTL còn lại: $ttl giây\n";

    // Test delete
    $redis->delete('test');
    echo "✅ Đã xóa cache\n";

} else {
    echo "❌ Redis không khả dụng. Hệ thống sẽ dùng Session cache.\n";
}
```

Chạy:

```bash
php test_redis_cache.php
```

### 4.2. Test trên Web

1. Mở trình duyệt
2. Vào: `http://localhost/UniMarket`
3. Mở DevTools → Network → Reload trang
4. Kiểm tra:
   - Lần 1: Chậm hơn (query DB)
   - Lần 2-N: Nhanh hơn (dùng cache)

---

## 🔍 TROUBLESHOOTING

### Lỗi: "Redis extension not installed"

**Nguyên nhân:** PHP chưa load extension

**Giải pháp:**

1. Kiểm tra file `php_redis.dll` đã copy đúng chỗ chưa
2. Kiểm tra `php.ini` đã thêm `extension=redis` chưa
3. Restart Laragon/Apache

### Lỗi: "Cannot connect to Redis server"

**Nguyên nhân:** Redis server chưa chạy

**Giải pháp:**

1. Mở Task Manager → Services → Tìm "Redis"
2. Nếu không chạy → Start service
3. Hoặc chạy thủ công: `redis-server`

### Lỗi: "Class 'Redis' not found"

**Nguyên nhân:** Extension chưa được load

**Giải pháp:**

```bash
php -m | findstr redis
# Nếu không thấy "redis" → Extension chưa cài đúng
```

---

## 📊 SO SÁNH HIỆU NĂNG

### Session Cache:

- 1000 users → 1000 bản cache riêng
- RAM usage: ~50MB (mỗi user ~50KB)
- Query DB: 1000 lần (mỗi user 1 lần)

### Redis Cache:

- 1000 users → 1 bản cache chung
- RAM usage: ~50KB (chỉ 1 bản)
- Query DB: 1 lần (sau đó dùng cache)

**Kết luận:** Redis tiết kiệm **99% RAM** và **99.9% queries**!

---

## 🎓 KIẾN THỨC BỔ SUNG

### Redis GUI Tools (Tùy chọn)

Để xem dữ liệu trong Redis dễ hơn:

1. **RedisInsight** (Khuyên dùng)

   - Download: https://redis.com/redis-enterprise/redis-insight/
   - Free, giao diện đẹp

2. **Another Redis Desktop Manager**
   - Download: https://github.com/qishibo/AnotherRedisDesktopManager
   - Open source

### Redis Commands hữu ích

```bash
# Xem tất cả keys
redis-cli KEYS *

# Xem giá trị của key
redis-cli GET top_keywords

# Xem TTL của key
redis-cli TTL top_keywords

# Xóa tất cả cache
redis-cli FLUSHALL

# Xem thông tin server
redis-cli INFO
```

---

## 📝 CHECKLIST

- [ ] Redis server đã cài và chạy
- [ ] PHP Redis extension đã cài
- [ ] `php -m | findstr redis` hiển thị "redis"
- [ ] `redis-cli ping` trả về "PONG"
- [ ] Test file `test_redis_cache.php` chạy thành công
- [ ] Trang web load nhanh hơn (cache hoạt động)

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:

1. **Error log:**

   - Laragon: `D:\laragon\bin\apache\logs\error.log`
   - PHP: `D:\laragon\bin\php\php-8.3.x\logs\php_error.log`

2. **Redis log:**

   - Windows: Event Viewer → Windows Logs → Application

3. **Test từng bước:**
   - Redis server OK?
   - PHP extension OK?
   - RedisCache class OK?
   - Web application OK?

---

**Chúc em cài đặt thành công! 🎉**
