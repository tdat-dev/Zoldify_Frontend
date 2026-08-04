<?php

namespace App\Models;

use App\Core\Database;

abstract class BaseModel  // abstract = không tạo object trực tiếp, chỉ để kế thừa
{
    protected $db;  // biến $db sẽ chứa Database instance

    public function __construct()
    {
        // Lấy instance duy nhất của Database (Singleton)
        $this->db = Database::getInstance();
    }
}