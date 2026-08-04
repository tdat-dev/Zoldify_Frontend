<?php
/**
 * Script dọn dẹp keywords xấu khỏi database
 * Chạy: php scripts/cleanup_keywords.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\SearchKeyword;

$model = new SearchKeyword();
$deleted = $model->cleanupInvalidKeywords();

echo "✅ Đã xóa $deleted keywords xấu khỏi database\n";
