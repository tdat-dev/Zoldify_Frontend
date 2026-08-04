<?php
/**
 * Product Sidebar Partial
 * 
 * Bao gồm: Danh mục + Bộ lọc giá + Tình trạng
 * 
 * Variables required:
 * - $categories: Array of categories (with children)
 * - $baseUrl: URL base for filter links  
 * - $queryParams: (optional) Current query params to preserve
 * - $currentCategoryId: (optional) Currently selected category ID
 * - $priceMin: (optional) Current price min filter
 * - $priceMax: (optional) Current price max filter
 * - $currentCondition: (optional) Current product_condition filter
 */

use App\Helpers\SlugHelper;

// Defaults
$categories = $categories ?? [];
$currentCategoryId = $currentCategoryId ?? null;
$priceMin = $priceMin ?? '';
$priceMax = $priceMax ?? '';
$currentCondition = $currentCondition ?? '';
$queryParams = $queryParams ?? [];
?>

<aside class="w-[190px] flex-shrink-0 hidden lg:block">

    <!-- Tất Cả Danh Mục -->
    <div class="bg-white rounded shadow-sm mb-3">
        <div class="px-3 py-2.5 border-b font-semibold text-sm text-gray-800 flex items-center gap-2">
            <i class="fa-solid fa-list text-xs text-[#2C67C8]"></i>
            Tất Cả Danh Mục
        </div>
        <div class="py-2 max-h-[350px] overflow-y-auto">
            <?php foreach ($categories as $cat):
                $catUrl = SlugHelper::categoryUrl($cat['name'], $cat['id']);
                $isActive = $currentCategoryId == $cat['id'];
                ?>
                <a href="<?= $catUrl ?>" class="block px-3 py-1.5 text-sm hover:text-[#2C67C8] transition-colors
                          <?= $isActive ? 'text-[#2C67C8] font-medium bg-blue-50' : 'text-gray-700' ?>">
                    <?= htmlspecialchars($cat['name']) ?>
                </a>
                <?php if (!empty($cat['children'])): ?>
                    <?php foreach ($cat['children'] as $child):
                        $childUrl = SlugHelper::categoryUrl($child['name'], $child['id']);
                        $isChildActive = $currentCategoryId == $child['id'];
                        ?>
                        <a href="<?= $childUrl ?>" class="block px-3 py-1 pl-6 text-[13px] hover:text-[#2C67C8] transition-colors
                                  <?= $isChildActive ? 'text-[#2C67C8] font-medium' : 'text-gray-500' ?>">
                            <?= htmlspecialchars($child['name']) ?>
                        </a>
                    <?php endforeach; ?>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Bộ Lọc Tìm Kiếm -->
    <div class="bg-white rounded shadow-sm mb-3">
        <div class="px-3 py-2.5 border-b font-semibold text-sm text-gray-800 flex items-center gap-2">
            <i class="fa-solid fa-filter text-xs text-[#2C67C8]"></i>
            Bộ Lọc Tìm Kiếm
        </div>

        <!-- Khoảng Giá -->
        <form method="GET" action="<?= $baseUrl ?>" class="p-3 border-b">
            <!-- Preserve existing params -->
            <?php foreach ($queryParams as $key => $value):
                if (!in_array($key, ['price_min', 'price_max', 'page'])):
                    ?>
                    <input type="hidden" name="<?= htmlspecialchars($key) ?>" value="<?= htmlspecialchars($value) ?>">
                <?php endif; endforeach; ?>

            <div class="text-sm text-gray-700 mb-2">Khoảng Giá</div>
            <div class="flex gap-2 items-center">
                <input type="number" name="price_min" placeholder="₫ TỪ" value="<?= $priceMin ?>"
                    class="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#2C67C8]">
                <span class="text-gray-400">-</span>
                <input type="number" name="price_max" placeholder="₫ ĐẾN" value="<?= $priceMax ?>"
                    class="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#2C67C8]">
            </div>
            <button type="submit"
                class="w-full mt-2 bg-[#2C67C8] text-white text-sm py-1.5 rounded hover:bg-[#1e4a8f] transition-colors">
                ÁP DỤNG
            </button>
        </form>

        <!-- Tình Trạng -->
        <div class="p-3 border-b">
            <div class="text-sm text-gray-700 mb-2">Tình Trạng</div>
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
                // Build URL with condition filter
                $conditionParams = array_merge($queryParams, ['product_condition' => $value]);
                if ($value === '')
                    unset($conditionParams['product_condition']);
                $conditionUrl = $baseUrl . (!empty($conditionParams) ? '?' . http_build_query($conditionParams) : '');
                ?>
                <a href="<?= $conditionUrl ?>" class="flex items-center gap-2 text-sm py-1 hover:text-[#2C67C8] transition-colors
                          <?= $isActive ? 'text-[#2C67C8] font-medium' : 'text-gray-600' ?>">
                    <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center
                                <?= $isActive ? 'border-[#2C67C8]' : 'border-gray-300' ?>">
                        <?php if ($isActive): ?>
                            <span class="w-2 h-2 bg-[#2C67C8] rounded-full"></span>
                        <?php endif; ?>
                    </span>
                    <?= $label ?>
                </a>
            <?php endforeach; ?>
        </div>

    </div>

    <!-- Nút Xóa Tất Cả (nếu có filter) -->
    <?php if (!empty($priceMin) || !empty($priceMax) || !empty($currentCondition)): ?>
        <a href="<?= $baseUrl ?>"
            class="block w-full text-center bg-gray-200 text-gray-700 text-sm py-2 rounded hover:bg-gray-300 transition-colors">
            <i class="fa-solid fa-xmark mr-1"></i> XOÁ BỘ LỌC
        </a>
    <?php endif; ?>
</aside>