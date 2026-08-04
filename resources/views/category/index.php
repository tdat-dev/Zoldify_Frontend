<?php
use App\Helpers\SlugHelper;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';

// SEO URL for this category
$baseUrl = SlugHelper::categoryUrl($category['name'], $category['id']);

// Current query params (for preserving filters)
$queryParams = [
    'sort' => $currentSort ?? 'popular',
    'product_condition' => $filters['product_condition'] ?? '',
    'rating' => $filters['rating'] ?? '',
    'price_min' => $filters['price_min'] ?? '',
    'price_max' => $filters['price_max'] ?? '',
];
// Remove empty values
$queryParams = array_filter($queryParams, fn($v) => $v !== '' && $v !== null && $v !== 0);

// Variables for partials
$title = $category['name'];
$currentCategoryId = $category['id'];
$priceMin = $filters['price_min'] ?? '';
$priceMax = $filters['price_max'] ?? '';
$currentCondition = $filters['product_condition'] ?? '';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-6">

        <!-- Breadcrumb -->
        <nav class="text-sm text-gray-500 mb-4">
            <a href="/" class="hover:text-[#2C67C8]">Trang chủ</a>
            <span class="mx-2">/</span>
            <?php if ($parentCategory): ?>
                <a href="<?= SlugHelper::categoryUrl($parentCategory['name'], $parentCategory['id']) ?>"
                    class="hover:text-[#2C67C8]">
                    <?= htmlspecialchars($parentCategory['name']) ?>
                </a>
                <span class="mx-2">/</span>
            <?php endif; ?>
            <span class="text-gray-800 font-medium"><?= htmlspecialchars($category['name']) ?></span>
        </nav>

        <div class="flex gap-4">

            <!-- Sidebar (Reusable Partial) - Desktop only -->
            <?php
            $categories = $allCategories;
            include __DIR__ . '/../partials/product_sidebar.php';
            ?>

            <!-- Mobile Filter Drawer -->
            <?php include __DIR__ . '/../partials/mobile_filter_drawer.php'; ?>

            <!-- Main Content -->
            <div class="flex-1 min-w-0">

                <!-- Sorting Bar (Reusable Partial) -->
                <?php include __DIR__ . '/../partials/product_sorting.php'; ?>

                <!-- Product Grid -->
                <?php if (empty($products)): ?>
                    <div class="bg-white rounded p-10 text-center">
                        <i class="fa-solid fa-box-open text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">Không tìm thấy sản phẩm nào trong danh mục này.</p>
                        <a href="<?= $baseUrl ?>" class="text-[#2C67C8] hover:underline mt-2 inline-block">
                            Xoá bộ lọc
                        </a>
                    </div>
                <?php else: ?>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                        <?php foreach ($products as $item): ?>
                            <?php include __DIR__ . '/../partials/product_card.php'; ?>
                        <?php endforeach; ?>
                    </div>

                    <!-- Pagination (Reusable Partial) -->
                    <?php include __DIR__ . '/../partials/pagination.php'; ?>
                <?php endif; ?>
            </div>
        </div>

    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>