<?php

namespace App\Helpers;

use DateTime;
use DateTimeZone;

class TimeHelper
{
    /**
     * Lấy timezone hiển thị cho user (mặc định Việt Nam)
     */
    private static function getDisplayTimezone(): string
    {
        return $_ENV['DISPLAY_TIMEZONE'] ?? 'Asia/Ho_Chi_Minh';
    }

    /**
     * Lấy timezone lưu trong DB (mặc định UTC)
     */
    private static function getAppTimezone(): string
    {
        return $_ENV['APP_TIMEZONE'] ?? 'UTC';
    }

    /**
     * Chuyển đổi datetime từ DB timezone sang timezone user
     * 
     * @param string $datetime Thời gian từ database
     * @return DateTime Object với timezone user
     */
    public static function toUserTimezone(string $datetime): DateTime
    {
        $dt = new DateTime($datetime, new DateTimeZone(self::getAppTimezone()));
        $dt->setTimezone(new DateTimeZone(self::getDisplayTimezone()));
        return $dt;
    }

    /**
     * Format datetime với timezone user
     * 
     * @param string $datetime Thời gian từ database
     * @param string $format Format output (mặc định d/m/Y H:i)
     * @return string Thời gian đã format theo timezone user
     */
    public static function format(string $datetime, string $format = 'd/m/Y H:i'): string
    {
        return self::toUserTimezone($datetime)->format($format);
    }

    /**
     * Format datetime đầy đủ: 19/01/2026 16:04
     */
    public static function formatDatetime(?string $datetime): string
    {
        if (!$datetime)
            return '';
        return self::format($datetime, 'd/m/Y H:i');
    }

    /**
     * Format chỉ ngày: 19/01/2026
     */
    public static function formatDate(?string $datetime): string
    {
        if (!$datetime)
            return '';
        return self::format($datetime, 'd/m/Y');
    }

    /**
     * Format chỉ giờ: 16:04
     */
    public static function formatTime(?string $datetime): string
    {
        if (!$datetime)
            return '';
        return self::format($datetime, 'H:i');
    }

    /**
     * Hiển thị thời gian dạng "X phút/giờ/ngày trước"
     * 
     * @param string $datetime Thời gian từ database
     * @return string Thời gian relative (VD: "5 phút trước")
     */
    public static function timeAgo($datetime): string
    {
        // Convert sang timezone user trước khi tính
        $userTime = self::toUserTimezone($datetime);
        $now = new DateTime('now', new DateTimeZone(self::getDisplayTimezone()));

        $time_difference = $now->getTimestamp() - $userTime->getTimestamp();

        if ($time_difference < 1) {
            return 'Vừa xong';
        }

        $condition = array(
            12 * 30 * 24 * 60 * 60 => 'năm',
            30 * 24 * 60 * 60 => 'tháng',
            24 * 60 * 60 => 'ngày',
            60 * 60 => 'giờ',
            60 => 'phút',
            1 => 'giây'
        );

        foreach ($condition as $secs => $str) {
            $d = $time_difference / $secs;

            if ($d >= 1) {
                $t = round($d);
                return $t . ' ' . $str . ' trước';
            }
        }

        return self::formatDate($datetime);
    }
}
