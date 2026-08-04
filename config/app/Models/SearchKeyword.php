<?php

namespace App\Models;

class SearchKeyword extends BaseModel
{
    // Lưu hoặc tăng count cho keyword
    public function trackKeyword($keyword)
    {
        $keyword = trim(strtolower($keyword));
        if (empty($keyword))
            return;

        // Kiểm tra keyword đã tồn tại chưa
        $existing = $this->db->fetchOne(
            "SELECT * FROM search_keywords WHERE keyword = :keyword",
            ['keyword' => $keyword]
        );

        if ($existing) {
            // Đã có → Tăng count
            $this->db->execute(
                "UPDATE search_keywords SET search_count = search_count + 1 WHERE keyword = :keyword",
                ['keyword' => $keyword]
            );
        } else {
            // Chưa có → Thêm mới
            $this->db->insert(
                "INSERT INTO search_keywords (keyword) VALUES (:keyword)",
                ['keyword' => $keyword]
            );
        }
    }

    // Lấy top keywords phổ biến
    public function getTopKeywords($limit = 6)
    {
        return $this->db->fetchAll(
            "SELECT * FROM search_keywords ORDER BY search_count DESC LIMIT $limit"
        );
    }
}