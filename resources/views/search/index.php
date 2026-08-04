<?php
use App\Helpers\SlugHelper;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';

// Variables for filter partials
$baseUrl = '/search';
$currentCategoryId = $_GET['category'] ?? null;
$priceMin = $_GET['price_min'] ?? '';
$priceMax = $_GET['price_max'] ?? '';
$currentCondition = $_GET['product_condition'] ?? '';
$currentSort = $_GET['sort'] ?? 'newest';

// Query params to preserve (including keyword)
$queryParams = [];
if (!empty($keyword)) {
    $queryParams['q'] = $keyword;
}
if (!empty($currentCategoryId)) {
    $queryParams['category'] = $currentCategoryId;
}
if (!empty($priceMin)) {
    $queryParams['price_min'] = $priceMin;
}
if (!empty($priceMax)) {
    $queryParams['price_max'] = $priceMax;
}
if (!empty($currentCondition)) {
    $queryParams['product_condition'] = $currentCondition;
}

// Nếu categories chưa được truyền từ controller, lấy từ model
if (!isset($categories)) {
    $categoryModel = new \App\Models\Category();
    $categories = $categoryModel->getTree();
}
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-6">

        <!-- Layout 2 cột: Sidebar + Content -->
        <div class="flex gap-4">

            <!-- Sidebar (Desktop only) -->
            <?php include __DIR__ . '/../partials/product_sidebar.php'; ?>

            <!-- Mobile Filter Drawer -->
            <?php include __DIR__ . '/../partials/mobile_filter_drawer.php'; ?>

            <!-- ========== MAIN CONTENT (Bên phải) ========== -->
            <div class="flex-1 min-w-0">

                <!-- Header kết quả tìm kiếm -->
                <div class="bg-white rounded-sm shadow-sm p-5 mb-4">
                    <h1 class="text-xl font-medium text-gray-800 border-l-4 border-[#2C67C8] pl-3">
                        Kết quả tìm kiếm: "<?= htmlspecialchars($keyword) ?>"
                        <span class="text-sm font-normal text-gray-500 ml-2">(<?= count($products) ?> sản phẩm)</span>
                    </h1>
                </div>

                <!-- Sorting Bar -->
                <?php
                $title = null; // Không hiển thị title vì đã có header ở trên
                include __DIR__ . '/../partials/product_sorting.php';
                ?>

                <!-- Product Grid -->
                <?php if (empty($products)): ?>
                    <div class="bg-white rounded p-10 text-center">
                        <i class="fa-solid fa-search text-4xl text-gray-300 mb-3"></i>
                        <p class="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
                        <p class="text-sm text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                    </div>
                <?php else: ?>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        <?php foreach ($products as $item): ?>
                            <?php include __DIR__ . '/../partials/product_card.php'; ?>
                        <?php endforeach; ?>
                    </div>

                    <!-- Pagination -->
                    <?php
                    // Build pagination URL helper
                    $buildPageUrl = function ($page) use ($baseUrl, $queryParams) {
                        $params = $queryParams;
                        $params['page'] = $page;
                        $query = http_build_query($params);
                        return $query ? "{$baseUrl}?{$query}" : $baseUrl;
                    };
                    ?>
                    <div class="flex justify-center mt-10 gap-2">
                        <?php if ($currentPage > 1): ?>
                            <a href="<?= $buildPageUrl($currentPage - 1) ?>"
                                class="px-3 py-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-sm">
                                <i class="fa-solid fa-chevron-left"></i>
                            </a>
                        <?php endif; ?>

                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                            <a href="<?= $buildPageUrl($i) ?>"
                                class="px-3 py-1 border rounded-sm transition-colors <?= $i == $currentPage ? 'bg-[#2C67C8] border-[#2C67C8] text-white' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50' ?>">
                                <?= $i ?>
                            </a>
                        <?php endfor; ?>

                        <?php if ($currentPage < $totalPages): ?>
                            <a href="<?= $buildPageUrl($currentPage + 1) ?>"
                                class="px-3 py-1 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-sm">
                                <i class="fa-solid fa-chevron-right"></i>
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

            </div>
        </div>

    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>