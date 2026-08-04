<?php
use App\Helpers\SlugHelper;
use App\Helpers\ImageHelper;
$productUrl = SlugHelper::productUrl($item['name'], (int) ($item['user_id'] ?? 0), (int) $item['id']);
?>
<a href="<?= $productUrl ?>"
    class="block bg-white rounded-sm shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#2C67C8]/30 overflow-hidden">
    <!-- Image với aspect ratio 1:1 -->
    <div class="aspect-square relative overflow-hidden bg-gray-100">
        <img src="<?= ImageHelper::url('uploads/' . ($item['image'] ?? '')) ?>"
            class="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy">
        <?php
        // Freeship badge - dựa trên setting của người bán
        $showFreeship = !empty($item['is_freeship']);
        if ($showFreeship):
            ?>
            <div
                class="absolute top-0 left-0 bg-[#00bfa5] text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                Freeship
            </div>
        <?php endif; ?>
    </div>

    <!-- Product info -->
    <div class="p-2 md:p-3">
        <!-- Title - 2 lines max -->
        <div
            class="text-[11px] md:text-xs text-gray-800 line-clamp-2 mb-1.5 min-h-[30px] md:min-h-[32px] leading-tight group-hover:text-[#2C67C8] transition-colors">
            <?= htmlspecialchars($item['name']) ?>
        </div>

        <!-- Price & Sold -->
        <div class="flex items-center justify-between gap-1">
            <div class="text-[#ee4d2d] text-sm md:text-base font-semibold truncate">
                <span
                    class="text-[10px] md:text-xs underline">₫</span><?= number_format((float) $item['price'], 0, ',', '.') ?>
            </div>
            <div class="text-[10px] text-gray-400 flex-shrink-0">Còn
                <?= $item['quantity'] ?? 0 ?>
            </div>
        </div>
    </div>
</a>