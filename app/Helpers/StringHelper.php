<?php
namespace App\Helpers;

class StringHelper
{
    /**
     * Chuẩn hóa họ tên theo format chuẩn
     * VD: "nguyễn văn an" -> "Nguyễn Văn An"
     *     "TRẦN THỊ BÌNH" -> "Trần Thị Bình"
     *     "  lê   hồng   " -> "Lê Hồng"
     */
    public static function formatName(string $name): string
    {
        // 1. Trim và loại bỏ khoảng trắng thừa
        $name = trim($name);
        $name = preg_replace('/\s+/', ' ', $name);

        // 2. Chuyển về lowercase trước (hỗ trợ UTF-8)
        $name = mb_strtolower($name, 'UTF-8');

        // 3. Viết hoa chữ đầu mỗi từ (hỗ trợ UTF-8 tiếng Việt)
        $name = mb_convert_case($name, MB_CASE_TITLE, 'UTF-8');

        return $name;
    }

    /**
     * Chuẩn hóa số điện thoại (loại bỏ ký tự không phải số)
     * VD: "0123-456-789" -> "0123456789"
     *     "+84 912 345 678" -> "84912345678"
     */
    public static function formatPhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }

    /**
     * Chuẩn hóa email (lowercase, trim)
     */
    public static function formatEmail(string $email): string
    {
        return strtolower(trim($email));
    }
}