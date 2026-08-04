<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\SearchKeyword;

/**
 * AnalyticsController - Thống kê và Phân tích cho Admin
 */
class AnalyticsController extends AdminBaseController
{
    private SearchKeyword $keywordModel;

    public function __construct()
    {
        parent::__construct();
        $this->keywordModel = new SearchKeyword();
    }

    /**
     * Thống kê từ khóa tìm kiếm
     */
    public function search()
    {
        // Top keywords all time
        $topKeywords = $this->keywordModel->getTopKeywords(20);

        // Trending keywords (7 days)
        $trendingKeywords = $this->keywordModel->getTrending(7, 10);

        $this->view('analytics/search', [
            'title' => 'Phân tích Tìm kiếm',
            'topKeywords' => $topKeywords,
            'trendingKeywords' => $trendingKeywords
        ]);
    }
}
