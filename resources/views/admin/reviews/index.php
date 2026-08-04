<?php
/**
 * Admin Reviews List View
 */

/** @var array $reviews */
/** @var array $ratingStats */
/** @var int|null $currentRating */

$title = $title ?? 'Quản lý Đánh giá';
?>

<div class="p-6">
    <?php if (isset($_SESSION['success'])): ?>
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
            <i class="fa-solid fa-check-circle mr-2"></i>
            <?= $_SESSION['success'];
            unset($_SESSION['success']); ?>
        </div>
    <?php endif; ?>

    <!-- Rating Stats -->
    <div class="grid grid-cols-6 gap-3 mb-6">
        <a href="/admin/reviews"
            class="p-3 rounded-lg text-center transition <?= !$currentRating ? 'bg-blue-500 text-white' : 'bg-white hover:bg-slate-50' ?>">
            <div class="text-2xl font-bold">
                <?= array_sum(array_column($ratingStats ?? [], 'count')) ?>
            </div>
            <div class="text-sm">Tất cả</div>
        </a>
        <?php for ($i = 5; $i >= 1; $i--):
            $count = 0;
            foreach ($ratingStats ?? [] as $stat) {
                if ((int) $stat['rating'] === $i) {
                    $count = $stat['count'];
                    break;
                }
            }
            $starColor = $i >= 4 ? 'emerald' : ($i >= 3 ? 'amber' : 'red');
            ?>
            <a href="/admin/reviews?rating=<?= $i ?>"
                class="p-3 rounded-lg text-center transition <?= $currentRating === $i ? "bg-{$starColor}-500 text-white" : 'bg-white hover:bg-slate-50' ?>">
                <div class="text-2xl font-bold">
                    <?= $count ?>
                </div>
                <div class="text-sm">
                    <?= $i ?> <i class="fa-solid fa-star text-xs"></i>
                </div>
            </a>
        <?php endfor; ?>
    </div>

    <!-- Reviews Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b bg-slate-50">
            <h2 class="text-lg font-semibold text-slate-800">
                <i class="fa-solid fa-star mr-2 text-amber-500"></i>
                Danh sách Đánh giá
            </h2>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                        <th class="px-4 py-3 text-left">Sản phẩm</th>
                        <th class="px-4 py-3 text-left">Người đánh giá</th>
                        <th class="px-4 py-3 text-center">Rating</th>
                        <th class="px-4 py-3 text-left">Nội dung</th>
                        <th class="px-4 py-3 text-left">Thời gian</th>
                        <th class="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($reviews)): ?>
                        <tr>
                            <td colspan="6" class="px-4 py-12 text-center text-slate-500">
                                <i class="fa-solid fa-star text-5xl mb-3 text-slate-300"></i>
                                <p>Chưa có đánh giá nào</p>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($reviews as $review): ?>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <?php $img = $review['product_image'] ?? ''; ?>
                                        <img src="<?= $img ? "/uploads/products/{$img}" : '/images/placeholder.png' ?>" alt=""
                                            class="w-12 h-12 rounded-lg object-cover">
                                        <div>
                                            <a href="/product/<?= $review['product_id'] ?>" target="_blank"
                                                class="font-medium text-slate-800 hover:text-blue-600">
                                                <?= htmlspecialchars(mb_substr($review['product_name'] ?? 'N/A', 0, 40)) ?>
                                            </a>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-medium">
                                        <?= htmlspecialchars($review['reviewer_name'] ?? 'N/A') ?>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex items-center justify-center gap-1 text-amber-500">
                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                            <i class="fa-<?= $i <= $review['rating'] ? 'solid' : 'regular' ?> fa-star text-sm"></i>
                                        <?php endfor; ?>
                                    </div>
                                </td>
                                <td class="px-4 py-3">
                                    <p class="text-sm text-slate-600 max-w-xs truncate">
                                        <?= htmlspecialchars($review['comment'] ?? '-') ?>
                                    </p>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-500">
                                    <?= date('d/m/Y H:i', strtotime($review['created_at'])) ?>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <form action="/admin/reviews/delete" method="POST" class="inline"
                                        onsubmit="return confirm('Xác nhận xóa đánh giá này?')">
                                        <input type="hidden" name="id" value="<?= $review['id'] ?>">
                                        <button type="submit"
                                            class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>