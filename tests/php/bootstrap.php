<?php
/**
 * PHPUnit Bootstrap File
 * 
 * Loads environment và autoloader cho testing
 */

// Autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Load testing environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..', '.env.testing');
try {
    $dotenv->load();
} catch (\Exception $e) {
    // Fallback to main .env if .env.testing doesn't exist
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

// Set timezone
date_default_timezone_set('Asia/Ho_Chi_Minh');
