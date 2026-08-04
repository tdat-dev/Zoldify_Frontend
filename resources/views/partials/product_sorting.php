<?php
/**
 * Product Sorting Bar Partial
 * 
 * Bao gồm: Sắp xếp theo (Phổ Biến, Mới Nhất, Bán Chạy, Giá)
 * 
 * Variables required:
 * - $baseUrl: URL base cho sorting links
 * - $currentSort: Current sort value (popular, newest, best_selling, price_asc, price_desc)
 * - $totalProducts: (optional) Total product count
 * - $currentPage: (optional) Current page
 * - $totalPages: (optional) Total pages
 * - $queryParams: (optional) Array of query params to preserve
 * - $title: (optional) Category/Search title to display
 */

// Default values
$currentSort = $currentSort ?? 'newest';
$totalProducts = $totalProducts ?? 0;
$currentPage = $currentPage ?? 1;
$totalPages = $totalPages ?? 1;
$title = $title ?? '';

// Build URL helper
$buildSortUrl = function ($sort) use ($baseUrl, $queryParams) {
    $params = $queryParams ?? [];
    $params['sort'] = $sort;
    unset($params['page']); // Reset page when sorting
    $query = http_build_query($params);
    return $query ? "{$baseUrl}?{$query}" : $baseUrl;
};

$sortOptions = [
    'popular' => 'Phổ Biến',
    'newest' => 'Mới Nhất',
    'best_selling' => 'Bán Chạy',
];
?>

<div class="bg-[#ededed] rounded px-4 py-2.5 mb-3 flex items-center gap-2 flex-wrap">
    <span class="text-sm text-gray-600">Sắp xếp theo</span>

    <?php foreach ($sortOptions as $sortValue => $sortLabel):
        $isActive = $currentSort === $sortValue;
        ?>
        <a href="<?= $buildSortUrl($sortValue) ?>" class="px-4 py-1.5 text-sm rounded transition-colors 
                  <?= $isActive ? 'bg-[#2C67C8] text-white' : 'bg-white text-gray-700 hover:bg-gray-50' ?>">
            <?= $sortLabel ?>
        </a>
    <?php endforeach; ?>

    <!-- Price Dropdown -->
    <div class="relative group">
        <button type="button" class="px-4 py-1.5 text-sm rounded flex items-center gap-1.5 transition-colors
                       <?= in_array($currentSort, ['price_asc', 'price_desc'])
                           ? 'bg-[#2C67C8] text-white'
                           : 'bg-white text-gray-700 hover:bg-gray-50' ?>">
            <?php if ($currentSort === 'price_asc'): ?>
                Giá: Thấp → Cao
            <?php elseif ($currentSort === 'price_desc'): ?>
                Giá: Cao → Thấp
            <?php else: ?>
                Giá
            <?php endif; ?>
            <i class="fa-solid fa-chevron-down text-[10px] transition-transform group-hover:rotate-180"></i>
        </button>
        <div class="absolute top-full right-0 mt-1 w-44 bg-white rounded shadow-lg border border-gray-200 
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-all duration-200 z-50">
            <a href="<?= $buildSortUrl('price_asc') ?>" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition-colors
                      <?= $currentSort === 'price_asc' ? 'bg-blue-50 text-blue-600' : '' ?>">
                Giá: Thấp → Cao
            </a>
            <a href="<?= $buildSortUrl('price_desc') ?>" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white transition-colors
                      <?= $currentSort === 'price_desc' ? 'bg-blue-50 text-blue-600' : '' ?>">
                Giá: Cao → Thấp
            </a>
        </div>
    </div>

    <!-- Title + Count + Mini Pagination -->
    <div class="ml-auto flex items-center gap-4 text-sm">
        <?php if (!empty($title)): ?>
            <span class="text-gray-700 font-medium hidden sm:inline">
                <?= htmlspecialchars($title) ?>
            </span>
        <?php endif; ?>

        <span class="text-gray-500">
            <?= number_format($totalProducts) ?> sản phẩm
        </span>

        <?php if ($totalPages > 1): ?>
            <div class="flex items-center gap-1">
                <span class="text-gray-500">
                    <?= $currentPage ?>/
                    <?= $totalPages ?>
                </span>
                <div class="flex">
                    <?php
                    $buildPageUrl = function ($page) use ($baseUrl, $queryParams) {
                        $params = $queryParams ?? [];
                        $params['page'] = $page;
                        $query = http_build_query($params);
                        return $query ? "{$baseUrl}?{$query}" : $baseUrl;
                    };
                    ?>
                    <?php if ($currentPage > 1): ?>
                        <a href="<?= $buildPageUrl($currentPage - 1) ?>"
                            class="w-8 h-8 flex items-center justify-center bg-white border hover:bg-gray-50">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </a>
                    <?php else: ?>
                        <span class="w-8 h-8 flex items-center justify-center bg-gray-100 border text-gray-300">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </span>
                    <?php endif; ?>
                    <?php if ($currentPage < $totalPages): ?>
                        <a href="<?= $buildPageUrl($currentPage + 1) ?>"
                            class="w-8 h-8 flex items-center justify-center bg-white border hover:bg-gray-50">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </a>
                    <?php else: ?>
                        <span class="w-8 h-8 flex items-center justify-center bg-gray-100 border text-gray-300">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </span>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>