<?php

namespace App\Core;

use Redis;
use Exception;

/**
 * Redis Cache Helper
 * Wrapper class để dễ dàng sử dụng Redis cache
 */
class RedisCache
{
    private static $instance = null;
    private $redis;
    private $isConnected = false;

    /**
     * Singleton pattern - Chỉ tạo 1 instance duy nhất
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor - Kết nối Redis
     */
    private function __construct()
    {
        try {
            // Kiểm tra extension Redis có được cài không
            if (!extension_loaded('redis')) {
                throw new Exception('Redis extension not installed');
            }

            $this->redis = new Redis();

            // Kết nối đến Redis server (localhost:6379 là mặc định)
            $connected = $this->redis->connect('127.0.0.1', 6379, 2.5);

            if (!$connected) {
                throw new Exception('Cannot connect to Redis server');
            }

            // Ping để kiểm tra kết nối
            $this->redis->ping();
            $this->isConnected = true;

        } catch (Exception $e) {
            // Nếu lỗi, ghi log và đánh dấu không kết nối được
            error_log('Redis connection failed: ' . $e->getMessage());
            $this->isConnected = false;
        }
    }

    /**
     * Kiểm tra Redis có sẵn sàng không
     */
    public function isAvailable()
    {
        return $this->isConnected;
    }

    /**
     * Lưu dữ liệu vào cache
     * 
     * @param string $key Tên key
     * @param mixed $value Giá trị (sẽ được serialize)
     * @param int $ttl Time to live (giây), 0 = vĩnh viễn
     * @return bool
     */
    public function set($key, $value, $ttl = 0)
    {
        if (!$this->isConnected) {
            return false;
        }

        try {
            // Serialize dữ liệu (chuyển array/object thành string)
            $serialized = serialize($value);

            if ($ttl > 0) {
                // Có thời gian hết hạn
                return $this->redis->setex($key, $ttl, $serialized);
            } else {
                // Không hết hạn
                return $this->redis->set($key, $serialized);
            }
        } catch (Exception $e) {
            error_log('Redis set failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Lấy dữ liệu từ cache
     * 
     * @param string $key Tên key
     * @return mixed|null Trả về null nếu không tìm thấy
     */
    public function get($key)
    {
        if (!$this->isConnected) {
            return null;
        }

        try {
            $data = $this->redis->get($key);

            if ($data === false) {
                return null; // Key không tồn tại
            }

            // Unserialize dữ liệu
            return unserialize($data);
        } catch (Exception $e) {
            error_log('Redis get failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Xóa một key khỏi cache
     * 
     * @param string $key
     * @return bool
     */
    public function delete($key)
    {
        if (!$this->isConnected) {
            return false;
        }

        try {
            return $this->redis->del($key) > 0;
        } catch (Exception $e) {
            error_log('Redis delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Kiểm tra key có tồn tại không
     * 
     * @param string $key
     * @return bool
     */
    public function exists($key)
    {
        if (!$this->isConnected) {
            return false;
        }

        try {
            return $this->redis->exists($key) > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Xóa tất cả cache
     * 
     * @return bool
     */
    public function flush()
    {
        if (!$this->isConnected) {
            return false;
        }

        try {
            return $this->redis->flushAll();
        } catch (Exception $e) {
            error_log('Redis flush failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Lấy thời gian sống còn lại của key (giây)
     * 
     * @param string $key
     * @return int -2 = không tồn tại, -1 = không hết hạn, >0 = số giây còn lại
     */
    public function ttl($key)
    {
        if (!$this->isConnected) {
            return -2;
        }

        try {
            return $this->redis->ttl($key);
        } catch (Exception $e) {
            return -2;
        }
    }

    /**
     * Đóng kết nối (tự động gọi khi script kết thúc)
     */
    public function __destruct()
    {
        if ($this->isConnected && $this->redis) {
            try {
                $this->redis->close();
            } catch (Exception $e) {
                // Ignore
            }
        }
    }
}
