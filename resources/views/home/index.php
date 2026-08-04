<?php
use App\Helpers\SlugHelper;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-8 space-y-6">

        <!-- DANH MỤC -->
        <div class="bg-white rounded-sm shadow-sm">
            <!-- Header - Ẩn trên mobile để compact hơn -->
            <div class="hidden md:flex h-[60px] px-5 items-center border-b border-gray-100">
                <h2 class="text-gray-500 font-medium uppercase text-base">DANH MỤC</h2>
            </div>

            <!-- Mobile: Horizontal Scroll Carousel (như Shopee) -->
            <div class="md:hidden overflow-x-auto scrollbar-none py-3 px-2">
                <div class="flex gap-1" style="min-width: max-content;">
                    <?php foreach ($categories as $cat): ?>
                        <a href="<?= SlugHelper::categoryUrl($cat['name'], $cat['id']) ?>"
                            class="flex flex-col items-center w-[70px] flex-shrink-0 py-2">
                            <div
                                class="w-12 h-12 rounded-full overflow-hidden mb-1.5 bg-indigo-50 flex items-center justify-center">
                                <?php if (!empty($cat['image'])): ?>
                                    <img src="<?= $cat['image'] ?>" alt="<?= $cat['name'] ?>"
                                        class="w-full h-full object-cover">
                                <?php elseif (!empty($cat['icon']) && strpos($cat['icon'], 'fa-') === 0): ?>
                                    <i class="fa-solid <?= $cat['icon'] ?> text-xl text-indigo-400"></i>
                                <?php else: ?>
                                    <span class="text-xl">📦</span>
                                <?php endif; ?>
                            </div>
                            <span
                                class="text-[11px] text-gray-700 text-center leading-tight line-clamp-2 px-0.5"><?= $cat['name'] ?></span>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Desktop: Grid layout -->
            <div class="hidden md:block p-0 relative group">
                <div class="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-0">
                    <?php foreach ($categories as $cat): ?>
                        <a href="<?= SlugHelper::categoryUrl($cat['name'], $cat['id']) ?>"
                            class="flex flex-col items-center justify-center h-[150px] border-r border-b border-gray-50 hover:shadow-md transition-shadow group/item">
                            <div
                                class="w-[70%] aspect-square rounded-full overflow-hidden mb-2 transition-transform group-hover/item:-translate-y-1">
                                <?php if (!empty($cat['image'])): ?>
                                    <img src="<?= $cat['image'] ?>" alt="<?= $cat['name'] ?>"
                                        class="w-full h-full object-cover scale-110 bg-gray-50">
                                <?php elseif (!empty($cat['icon'])):
                                    $isFontAwesome = (strpos($cat['icon'], 'fa-') === 0);
                                    $isImagePath = (strpos($cat['icon'], '/') === 0 || strpos($cat['icon'], 'http') === 0);
                                    if ($isFontAwesome): ?>
                                        <div class="w-full h-full flex items-center justify-center bg-indigo-50">
                                            <i class="fa-solid <?= $cat['icon'] ?> text-3xl text-indigo-400"></i>
                                        </div>
                                    <?php elseif ($isImagePath): ?>
                                        <img src="<?= $cat['icon'] ?>" alt="<?= $cat['name'] ?>"
                                            class="w-full h-full object-cover scale-110 bg-gray-50">
                                    <?php else: ?>
                                        <div class="w-full h-full flex items-center justify-center bg-blue-50 text-3xl">
                                            <?= $cat['icon'] ?>
                                        </div>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <div class="w-full h-full flex items-center justify-center bg-slate-100 text-3xl">📦</div>
                                <?php endif; ?>
                            </div>
                            <span class="text-[13px] text-gray-800 text-center px-2 leading-4"><?= $cat['name'] ?></span>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- TÌM KIẾM HÀNG ĐẦU -->
        <div class="bg-white rounded-sm shadow-sm p-5">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-[#2C67C8] font-medium uppercase text-base">TÌM KIẾM HÀNG ĐẦU</h2>
                <a href="/products" class="text-[#2C67C8] text-sm flex items-center gap-1">
                    Xem Tất Cả <i class="fa-solid fa-chevron-right text-xs"></i>
                </a>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                <?php foreach ($topProducts as $prod): ?>
                    <a href="<?= SlugHelper::productUrl($prod['name'], (int) ($prod['user_id'] ?? 0), (int) $prod['id']) ?>"
                        class="block relative group">
                        <div class="relative aspect-square bg-gray-100 mb-3 overflow-hidden">
                            <!-- HOT Badge -->
                            <div class="absolute top-0 left-0 z-10 w-8 h-10 bg-gradient-to-b from-yellow-400 to-red-600 flex flex-col items-center justify-start pt-1"
                                style="clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);">
                                <span class="text-white font-bold text-[10px] leading-3">HOT</span>
                                <i class="fa-solid fa-fire text-white text-[10px]"></i>
                            </div>

                            <?php if (!empty($prod['is_freeship'])): ?>
                                <div
                                    class="absolute top-0 right-0 z-10 bg-[#00bfa5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-sm">
                                    Freeship
                                </div>
                            <?php endif; ?>

                            <img src="/uploads/<?= !empty($prod['image']) ? $prod['image'] : 'default.png' ?>"
                                alt="<?= htmlspecialchars($prod['name'] ?? $prod['title']) ?>"
                                class="w-full h-full object-cover">

                            <!-- Overlay hiển thị số lượng đã bán -->
                            <div class="absolute bottom-0 left-0 w-full bg-gray-400/80 py-1">
                                <p class="text-white text-center text-xs font-medium">
                                    Còn <?= number_format($prod['quantity'] ?? 0) ?>
                                </p>
                            </div>
                        </div>
                        <h3 class="text-gray-800 text-base font-medium capitalize line-clamp-2">
                            <?= htmlspecialchars($prod['name'] ?? $prod['title']) ?>
                        </h3>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- SẢN PHẨM MỚI NHẤT -->
        <div class="bg-white rounded-sm shadow-sm p-5">
            <div class="border-b border-gray-100 pb-4 mb-4">
                <h2 class="text-[#2C67C8] font-medium uppercase text-base">SẢN PHẨM MỚI NHẤT</h2>
            </div>
            <?php $products = $products ?? []; ?>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                <?php foreach ($latestProducts as $item): ?>
                    <a href="<?= SlugHelper::productUrl($item['name'], (int) ($item['user_id'] ?? 0), (int) $item['id']) ?>"
                        class="block bg-white rounded-sm shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#2C67C8]/30 overflow-hidden">
                        <div class="aspect-square relative overflow-hidden">
                            <img src="/uploads/<?= !empty($item['image']) ? $item['image'] : 'default.png' ?>"
                                class="w-full h-full object-cover">
                            <?php if (!empty($item['is_freeship'])): ?>
                                <div
                                    class="absolute top-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-sm">
                                    Freeship
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="p-2">
                            <div class="text-xs text-gray-800 line-clamp-2 mb-2 min-h-[32px]">
                                <?= htmlspecialchars($item['name']) ?>
                            </div>
                            <div class="flex justify-between items-end">
                                <div class="text-red-500 text-base font-medium">
                                    <span
                                        class="text-xs underline">đ</span><?= number_format((float) $item['price'], 0, ',', '.') ?>
                                </div>
                                <div class="text-xs text-gray-500">Còn: <?= $item['quantity'] ?></div>
                            </div>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- GỢI Ý HÔM NAY -->
        <div class="mt-6">
            <div class="bg-white z-40 border-b border-gray-200 sticky top-[60px] md:top-[80px]">
                <!-- Added sticky header -->
                <div class="flex justify-center">
                    <div class="py-4 px-10 border-b-4 border-[#2C67C8] cursor-pointer">
                        <h2 class="text-[#2C67C8] font-medium uppercase text-base">GỢI Ý HÔM NAY</h2>
                    </div>
                </div>
            </div>

            <div id="suggested-products-grid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                <?php foreach ($suggestedProducts as $item): ?>
                    <?php include __DIR__ . '/../partials/product_card.php'; ?>
                <?php endforeach; ?>
            </div>

            <div class="flex justify-center mt-8 pb-10">
                <a href="/products"
                    class="bg-white border border-gray-300 text-gray-600 px-10 py-2 hover:bg-gray-50 transition-colors rounded-sm text-sm">
                    Xem Thêm
                </a>
            </div>
        </div>

    </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>