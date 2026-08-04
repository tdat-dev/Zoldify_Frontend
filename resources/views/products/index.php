<?php
use App\Helpers\SlugHelper;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';

// products/index.php - Trang tất cả sản phẩm (không có category filter)
// Category filter sẽ redirect sang /dm/slug.cX

// Variables for partials
$baseUrl = '/products';
$currentCategoryId = null; // No category selected on /products
$currentSort = $sort ?? 'newest';
$currentCondition = $currentCondition ?? '';
$totalProducts = count($products ?? []) + (($currentPage - 1) * 20);

// Query params for sorting/pagination
$queryParams = [];
if (!empty($sort) && $sort !== 'newest')
    $queryParams['sort'] = $sort;
if (!empty($priceMin))
    $queryParams['price_min'] = $priceMin;
if (!empty($priceMax))
    $queryParams['price_max'] = $priceMax;
if (!empty($currentCondition))
    $queryParams['condition'] = $currentCondition;
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-6">

        <!-- Layout 2 cột: Sidebar + Content -->
        <div class="flex gap-4">

            <!-- Sidebar (Reusable Partial) - Desktop only -->
            <?php include __DIR__ . '/../partials/product_sidebar.php'; ?>

            <!-- Mobile Filter Drawer -->
            <?php include __DIR__ . '/../partials/mobile_filter_drawer.php'; ?>

            <!-- ========== MAIN CONTENT (Bên phải) ========== -->
            <div class="flex-1 min-w-0">

                <!-- Sorting Bar (Reusable Partial) -->
                <?php
                $title = 'Tất cả sản phẩm';
                include __DIR__ . '/../partials/product_sorting.php';
                ?>

                <!-- Product Grid -->
                <?php if (empty($products)): ?>
                    <div class="bg-white rounded p-10 text-center">
                        <i class="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
                        <p class="text-gray-500">Không có sản phẩm nào.</p>
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