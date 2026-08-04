<?php

namespace App\Helpers;

class TimeHelper
{
    public static function timeAgo($datetime)
    {
        $time = strtotime($datetime);
        $time_difference = time() - $time;

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

        return date('d/m/Y', $time);
    }
}
