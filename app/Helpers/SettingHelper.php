<?php

namespace App\Helpers;

use App\Models\Setting;

class SettingHelper
{
    private static $settings = null;

    /**
     * Lấy tất cả settings (cache trong memory)
     */
    public static function all()
    {
        if (self::$settings === null) {
            $model = new Setting();
            self::$settings = $model->getAll();
        }
        return self::$settings;
    }

    /**
     * Lấy 1 setting theo key
     * Cú pháp: SettingHelper::get('site_name') hoặc SettingHelper::get('general.site_name')
     */
    public static function get($key, $default = '')
    {
        $all = self::all();

        // Nếu có dấu chấm (group.key)
        if (strpos($key, '.') !== false) {
            list($group, $key) = explode('.', $key, 2);
            return $all[$group][$key] ?? $default;
        }

        // Tìm trong tất cả groups
        foreach ($all as $group => $settings) {
            if (isset($settings[$key])) {
                return $settings[$key];
            }
        }

        return $default;
    }
}