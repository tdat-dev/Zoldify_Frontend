<?php
/**
 * Mobile Filter Drawer Partial
 * 
 * Slide-in drawer cho bộ lọc trên mobile (giống Shopee/Lazada)
 * Include cùng với product_sidebar.php
 * 
 * Variables required:
 * - $categories: Array of categories
 * - $baseUrl: URL base for filter links
 * - $currentCategoryId: Currently selected category ID
 * - $priceMin, $priceMax: Current price filters
 * - $currentCondition: Current product_condition filter
 */

use App\Helpers\SlugHelper;
?>

<!-- CSS để ẩn bộ lọc mobile khi màn hình ≥ 1024px -->
<style>
    @media (min-width: 1024px) {

        #mobileFilterButton,
        #mobileFilterOverlay,
        #mobileFilterDrawer {
            display: none !important;
        }
    }
</style>

<?php

// Defaults
$categories = $categories ?? [];
$currentCategoryId = $currentCategoryId ?? null;
$priceMin = $priceMin ?? '';
$priceMax = $priceMax ?? '';
$currentCondition = $currentCondition ?? '';
?>

<!-- Mobile Filter Button (hiện trên mobile, ẩn trên desktop) -->
<button type="button" id="mobileFilterButton" onclick="openMobileFilter()"
    class="lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 bg-[#2C67C8] text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-[#1e4a8f] transition-all">
    <i class="fa-solid fa-filter text-sm"></i>
    <span class="text-sm font-medium">Bộ Lọc</span>
</button>

<!-- Mobile Filter Drawer Overlay -->
<div id="mobileFilterOverlay" onclick="closeMobileFilter()"
    class="lg:hidden fixed inset-0 bg-black/50 z-50 opacity-0 invisible transition-opacity duration-300">
</div>

<!-- Mobile Filter Drawer -->
<div id="mobileFilterDrawer" style="transform: translateX(-100%);"
    class="lg:hidden fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-50 transition-transform duration-300 overflow-y-auto">

    <!-- Header -->
    <div class="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <i class="fa-solid fa-filter text-[#2C67C8]"></i>
            Bộ Lọc Tìm Kiếm
        </h2>
        <button onclick="closeMobileFilter()"
            class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <i class="fa-solid fa-xmark text-lg"></i>
        </button>
    </div>

    <!-- Categories -->
    <div class="border-b">
        <div class="px-4 py-3 font-medium text-gray-800 flex items-center gap-2 bg-gray-50">
            <i class="fa-solid fa-list text-xs text-[#2C67C8]"></i>
            Danh Mục
        </div>
        <div class="px-4 py-2 max-h-[200px] overflow-y-auto">
            <?php foreach ($categories as $cat):
                $catUrl = SlugHelper::categoryUrl($cat['name'], $cat['id']);
                $isActive = $currentCategoryId == $cat['id'];
                ?>
                <a href="<?= $catUrl ?>" class="block py-2 text-sm border-b border-gray-100 last:border-0
                          <?= $isActive ? 'text-[#2C67C8] font-medium' : 'text-gray-700' ?>">
                    <?= htmlspecialchars($cat['name']) ?>
                </a>
                <?php if (!empty($cat['children'])): ?>
                    <?php foreach ($cat['children'] as $child):
                        $childUrl = SlugHelper::categoryUrl($child['name'], $child['id']);
                        $isChildActive = $currentCategoryId == $child['id'];
                        ?>
                        <a href="<?= $childUrl ?>" class="block py-1.5 pl-4 text-[13px] border-b border-gray-50 last:border-0
                                  <?= $isChildActive ? 'text-[#2C67C8] font-medium' : 'text-gray-500' ?>">
                            <?= htmlspecialchars($child['name']) ?>
                        </a>
                    <?php endforeach; ?>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Khoảng Giá -->
    <div class="border-b">
        <div class="px-4 py-3 font-medium text-gray-800 bg-gray-50">Khoảng Giá</div>
        <form method="GET" action="<?= $baseUrl ?>" class="px-4 py-3">
            <!-- Preserve existing params -->
            <?php if (!empty($queryParams)): ?>
                <?php foreach ($queryParams as $key => $value):
                    if (!in_array($key, ['price_min', 'price_max', 'page'])):
                        ?>
                        <input type="hidden" name="<?= htmlspecialchars($key) ?>" value="<?= htmlspecialchars($value) ?>">
                    <?php endif; endforeach; ?>
            <?php endif; ?>
            <div class="flex gap-2 items-center mb-3">
                <input type="number" name="price_min" placeholder="₫ TỪ" value="<?= $priceMin ?>"
                    class="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2C67C8]">
                <span class="text-gray-400">-</span>
                <input type="number" name="price_max" placeholder="₫ ĐẾN" value="<?= $priceMax ?>"
                    class="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#2C67C8]">
            </div>
            <button type="submit"
                class="w-full bg-[#2C67C8] text-white py-2 rounded font-medium hover:bg-[#1e4a8f] transition-colors">
                Áp Dụng
            </button>
        </form>
    </div>

    <!-- Tình Trạng -->
    <div class="border-b">
        <div class="px-4 py-3 font-medium text-gray-800 bg-gray-50">Tình Trạng</div>
        <div class="px-4 py-3 space-y-1">
            <?php
            $conditions = [
                '' => 'Tất cả',
                'new' => 'Mới 100%',
                'like_new' => 'Như mới (99%)',
                'good' => 'Tốt (90%+)',
                'fair' => 'Khá (80%+)',
            ];
            foreach ($conditions as $value => $label):
                $isActive = ($currentCondition ?? '') === $value;
                // Preserve existing query params and add/remove condition
                $conditionParams = is_array($queryParams ?? null) ? $queryParams : [];
                if ($value !== '') {
                    $conditionParams['product_condition'] = $value;
                } else {
                    unset($conditionParams['product_condition']);
                }
                unset($conditionParams['page']); // Reset page when filtering
                $conditionUrl = $baseUrl . (!empty($conditionParams) ? '?' . http_build_query($conditionParams) : '');
                ?>
                <a href="<?= $conditionUrl ?>" onclick="closeMobileFilter()" class="flex items-center gap-3 text-sm py-2 hover:text-[#2C67C8] transition-colors
                          <?= $isActive ? 'text-[#2C67C8] font-medium' : 'text-gray-700' ?>">
                    <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center
                                <?= $isActive ? 'border-[#2C67C8]' : 'border-gray-300' ?>">
                        <?php if ($isActive): ?>
                            <span class="w-2.5 h-2.5 bg-[#2C67C8] rounded-full"></span>
                        <?php endif; ?>
                    </span>
                    <?= $label ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Footer Actions -->
    <?php
    // Build clear filter URL - only keep the keyword (q param)
    $clearFilterParams = [];
    if (!empty($queryParams['q'])) {
        $clearFilterParams['q'] = $queryParams['q'];
    }
    $clearFilterUrl = $baseUrl . (!empty($clearFilterParams) ? '?' . http_build_query($clearFilterParams) : '');
    ?>
    <div class="sticky bottom-0 bg-white border-t px-4 py-3 flex gap-3">
        <a href="<?= $clearFilterUrl ?>"
            class="flex-1 text-center py-2.5 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Xóa bộ lọc
        </a>
        <button onclick="closeMobileFilter()"
            class="flex-1 py-2.5 bg-[#2C67C8] text-white rounded font-medium hover:bg-[#1e4a8f] transition-colors">
            Đóng
        </button>
    </div>
</div>

<script>
    function openMobileFilter() {
        document.getElementById('mobileFilterOverlay').classList.remove('opacity-0', 'invisible');
        document.getElementById('mobileFilterDrawer').style.transform = 'translateX(0)';
        document.body.style.overflow = 'hidden';
    }

    function closeMobileFilter() {
        document.getElementById('mobileFilterOverlay').classList.add('opacity-0', 'invisible');
        document.getElementById('mobileFilterDrawer').style.transform = 'translateX(-100%)';
        document.body.style.overflow = '';
    }
</script>