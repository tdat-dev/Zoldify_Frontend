<?php
/**
 * Pagination Partial
 * 
 * Variables required:
 * - $baseUrl: URL base for pagination links
 * - $currentPage: Current page number
 * - $totalPages: Total number of pages
 * - $queryParams: (optional) Array of query params to preserve
 */

// Defaults
$currentPage = $currentPage ?? 1;
$totalPages = $totalPages ?? 1;
$queryParams = $queryParams ?? [];

if ($totalPages <= 1)
    return;

// Build page URL helper
$buildPageUrl = function ($page) use ($baseUrl, $queryParams) {
    $params = $queryParams;
    $params['page'] = $page;
    $query = http_build_query($params);
    return $query ? "{$baseUrl}?{$query}" : $baseUrl;
};

// Calculate page range (show max 5 pages)
$startPage = max(1, $currentPage - 2);
$endPage = min($totalPages, $currentPage + 2);
?>

<div class="flex justify-center mt-8 gap-1">
    <!-- Previous -->
    <?php if ($currentPage > 1): ?>
        <a href="<?= $buildPageUrl($currentPage - 1) ?>"
            class="w-10 h-10 flex items-center justify-center bg-white border text-gray-600 hover:bg-gray-50 rounded">
            <i class="fa-solid fa-chevron-left text-xs"></i>
        </a>
    <?php endif; ?>

    <!-- First page + ellipsis -->
    <?php if ($startPage > 1): ?>
        <a href="<?= $buildPageUrl(1) ?>"
            class="w-10 h-10 flex items-center justify-center bg-white border text-gray-600 hover:bg-gray-50 rounded">1</a>
        <?php if ($startPage > 2): ?>
            <span class="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
        <?php endif; ?>
    <?php endif; ?>

    <!-- Page numbers -->
    <?php for ($i = $startPage; $i <= $endPage; $i++): ?>
        <a href="<?= $buildPageUrl($i) ?>"
            class="w-10 h-10 flex items-center justify-center border rounded transition-colors
                  <?= $i == $currentPage ? 'bg-[#2C67C8] border-[#2C67C8] text-white' : 'bg-white text-gray-600 hover:bg-gray-50' ?>">
            <?= $i ?>
        </a>
    <?php endfor; ?>

    <!-- Ellipsis + last page -->
    <?php if ($endPage < $totalPages): ?>
        <?php if ($endPage < $totalPages - 1): ?>
            <span class="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
        <?php endif; ?>
        <a href="<?= $buildPageUrl($totalPages) ?>"
            class="w-10 h-10 flex items-center justify-center bg-white border text-gray-600 hover:bg-gray-50 rounded">
            <?= $totalPages ?>
        </a>
    <?php endif; ?>

    <!-- Next -->
    <?php if ($currentPage < $totalPages): ?>
        <a href="<?= $buildPageUrl($currentPage + 1) ?>"
            class="w-10 h-10 flex items-center justify-center bg-white border text-gray-600 hover:bg-gray-50 rounded">
            <i class="fa-solid fa-chevron-right text-xs"></i>
        </a>
    <?php endif; ?>
</div>