<?php

namespace App\Core;

/**
 * Logger - Centralized logging utility
 * 
 * Tự động điều khiển log theo môi trường:
 * - local/development: Log tất cả (debug, info, warning, error)
 * - staging: Log info, warning, error (không debug)
 * - production: Chỉ log warning và error
 * 
 * @author Zoldify Team
 */
class Logger
{
    /**
     * Log levels
     */
    public const DEBUG = 'debug';
    public const INFO = 'info';
    public const WARNING = 'warning';
    public const ERROR = 'error';

    /**
     * Kiểm tra có nên log level này không dựa trên APP_ENV
     */
    private static function shouldLog(string $level): bool
    {
        $env = $_ENV['APP_ENV'] ?? 'local';
        $debug = filter_var($_ENV['APP_DEBUG'] ?? true, FILTER_VALIDATE_BOOLEAN);

        // Production: chỉ warning và error
        if ($env === 'production') {
            return in_array($level, [self::WARNING, self::ERROR]);
        }

        // Staging: info, warning, error (không debug)
        if ($env === 'staging') {
            return in_array($level, [self::INFO, self::WARNING, self::ERROR]);
        }

        // Local/Development: log tất cả nếu APP_DEBUG=true
        return $debug;
    }

    /**
     * Log message với level và context
     */
    public static function log(string $level, string $message, array $context = []): void
    {
        if (!self::shouldLog($level)) {
            return;
        }

        $env = $_ENV['APP_ENV'] ?? 'local';
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';

        $formattedMessage = "[{$timestamp}] [{$env}] [{$level}] {$message}{$contextStr}";

        error_log($formattedMessage);
    }

    /**
     * Debug log - chỉ hiển thị ở local khi APP_DEBUG=true
     */
    public static function debug(string $message, array $context = []): void
    {
        self::log(self::DEBUG, $message, $context);
    }

    /**
     * Info log - hiển thị ở local và staging
     */
    public static function info(string $message, array $context = []): void
    {
        self::log(self::INFO, $message, $context);
    }

    /**
     * Warning log - hiển thị tất cả môi trường
     */
    public static function warning(string $message, array $context = []): void
    {
        self::log(self::WARNING, $message, $context);
    }

    /**
     * Error log - hiển thị tất cả môi trường
     */
    public static function error(string $message, array $context = []): void
    {
        self::log(self::ERROR, $message, $context);
    }

    /**
     * Kiểm tra môi trường hiện tại
     */
    public static function isProduction(): bool
    {
        return ($_ENV['APP_ENV'] ?? 'local') === 'production';
    }

    public static function isStaging(): bool
    {
        return ($_ENV['APP_ENV'] ?? 'local') === 'staging';
    }

    public static function isDevelopment(): bool
    {
        $env = $_ENV['APP_ENV'] ?? 'local';
        return in_array($env, ['local', 'development']);
    }
}
