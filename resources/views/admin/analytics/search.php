<?php
/**
 * Admin Search Analytics View
 */

/** @var array $topKeywords */
/** @var array $trendingKeywords */

$title = $title ?? 'Phân tích Tìm kiếm';
?>

<div class="p-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Keywords All Time -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <h2 class="text-lg font-semibold">
                    <i class="fa-solid fa-trophy mr-2"></i>
                    Top Từ khóa Phổ biến
                </h2>
                <p class="text-blue-100 text-sm">Tất cả thời gian</p>
            </div>

            <div class="p-4">
                <?php if (empty($topKeywords)): ?>
                    <p class="text-center text-slate-500 py-8">Chưa có dữ liệu</p>
                <?php else: ?>
                    <div class="space-y-3">
                        <?php
                        $maxCount = $topKeywords[0]['search_count'] ?? 1;
                        foreach ($topKeywords as $index => $kw):
                            $percentage = ($kw['search_count'] / $maxCount) * 100;
                            ?>
                            <div class="flex items-center gap-3">
                                <span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                <?= $index < 3 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600' ?>">
                                    <?= $index + 1 ?>
                                </span>
                                <div class="flex-1">
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="font-medium">
                                            <?= htmlspecialchars($kw['keyword']) ?>
                                        </span>
                                        <span class="text-slate-500">
                                            <?= number_format($kw['search_count']) ?> lượt
                                        </span>
                                    </div>
                                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-blue-500 rounded-full" style="width: <?= $percentage ?>%"></div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Trending This Week -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-4 border-b bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <h2 class="text-lg font-semibold">
                    <i class="fa-solid fa-fire mr-2"></i>
                    Trending Tuần này
                </h2>
                <p class="text-rose-100 text-sm">7 ngày gần đây</p>
            </div>

            <div class="p-4">
                <?php if (empty($trendingKeywords)): ?>
                    <p class="text-center text-slate-500 py-8">Chưa có dữ liệu trending</p>
                <?php else: ?>
                    <div class="flex flex-wrap gap-2">
                        <?php foreach ($trendingKeywords as $index => $kw):
                            $sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
                            $size = $sizes[min($index, 4)];
                            ?>
                            <span
                                class="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 rounded-full <?= $size ?>">
                                <i class="fa-solid fa-arrow-trend-up text-xs text-rose-500"></i>
                                <?= htmlspecialchars($kw['keyword']) ?>
                                <span class="text-xs text-rose-400 ml-1">
                                    <?= $kw['search_count'] ?>
                                </span>
                            </span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Info -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
            <i class="fa-solid fa-lightbulb text-blue-500 text-xl mt-0.5"></i>
            <div>
                <h3 class="font-semibold text-blue-800">Mẹo sử dụng</h3>
                <p class="text-sm text-blue-700 mt-1">
                    Dữ liệu này giúp bạn hiểu khách hàng đang tìm kiếm gì.
                    Sử dụng để tối ưu SEO, đề xuất sản phẩm mới cho sellers,
                    hoặc tạo các bộ sưu tập sản phẩm phù hợp với xu hướng.
                </p>
            </div>
        </div>
    </div>
</div>