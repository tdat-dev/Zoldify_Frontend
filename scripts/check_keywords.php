<?php
/**
 * Script kiểm tra keywords trong database
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\SearchKeyword;

$model = new SearchKeyword();

// Kiểm tra trending
echo "=== Trending keywords (7 ngày) ===\n";
$trending = $model->getTrending(7, 10);
if (empty($trending)) {
    echo "Không có trending\n";
} else {
    foreach ($trending as $kw) {
        echo "- {$kw['keyword']} ({$kw['search_count']})\n";
    }
}

echo "\n=== Top keywords ===\n";
$top = $model->getTopKeywords(10);
foreach ($top as $kw) {
    echo "- {$kw['keyword']} ({$kw['search_count']})\n";
}
