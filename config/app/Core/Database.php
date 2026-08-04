<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection;

    // Constructor - Kết nối database khi khởi tạo
    private function __construct()
    {
        $config = require __DIR__ . '/../../config/database.php';

        try {
            $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Bật báo lỗi
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Trả về mảng associative
                PDO::ATTR_EMULATE_PREPARES => false, // Dùng prepared statement thật
            ];

            $this->connection = new PDO($dsn, $config['username'], $config['password'], $options);

        } catch (PDOException $ex) {
            die("Database Connection Failed: " . $ex->getMessage());
        }
    }

    // Lấy instance duy nhất (Singleton)
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Lấy PDO connection
    public function getConnection()
    {
        return $this->connection;
    }

    // Thực thi query với prepared statement
    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            throw new PDOException("Query Failed: " . $e->getMessage());
        }
    }

    // SELECT nhiều dòng
    public function fetchAll($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    // SELECT 1 dòng
    public function fetchOne($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    // INSERT và trả về ID
    public function insert($sql, $params = [])
    {
        $this->query($sql, $params);
        return $this->connection->lastInsertId();
    }

    // UPDATE/DELETE và trả về số dòng affected
    public function execute($sql, $params = [])
    {
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    // Bắt đầu transaction
    public function beginTransaction()
    {
        return $this->connection->beginTransaction();
    }

    // Commit transaction
    public function commit()
    {
        return $this->connection->commit();
    }

    // Rollback transaction
    public function rollback()
    {
        return $this->connection->rollback();
    }

    // Ngăn clone object
    private function __clone()
    {
    }

    // Ngăn unserialize
    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize singleton");
    }
}
?>