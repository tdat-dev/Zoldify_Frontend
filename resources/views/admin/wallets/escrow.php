<?php
/**
 * Admin Escrow Management View
 * Quản lý tiền đang được giữ (escrow holds)
 */

/** @var array $escrows */
/** @var array $stats */
/** @var float $totalHolding */
/** @var string|null $currentStatus */

$title = $title ?? 'Quản lý Escrow';
?>

<div class="p-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href="/admin/wallets" class="hover:text-blue-600">Quản lý Ví</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span class="text-slate-800">Escrow</span>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-blue-100 text-sm">Đang Giữ (Holding)</p>
                    <p class="text-2xl font-bold">
                        <?= number_format($totalHolding) ?>đ
                    </p>
                </div>
                <i class="fa-solid fa-lock text-3xl text-blue-200"></i>
            </div>
        </div>

        <?php
        $statusCards = [
            'holding' => ['Chờ giải ngân', 'amber', 'clock'],
            'released' => ['Đã giải ngân', 'emerald', 'check'],
            'refunded' => ['Đã hoàn tiền', 'purple', 'rotate-left'],
            'disputed' => ['Tranh chấp', 'red', 'exclamation-triangle'],
        ];
        foreach ($statusCards as $status => $config):
            $count = $stats[$status]['count'] ?? 0;
            $amount = $stats[$status]['total_amount'] ?? 0;
            ?>
            <div class="bg-white rounded-xl p-4 shadow-sm border">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-slate-500 text-sm">
                            <?= $config[0] ?>
                        </p>
                        <p class="text-xl font-bold text-slate-800">
                            <?= $count ?>
                        </p>
                        <p class="text-sm text-<?= $config[1] ?>-600">
                            <?= number_format($amount) ?>đ
                        </p>
                    </div>
                    <i class="fa-solid fa-<?= $config[2] ?> text-2xl text-<?= $config[1] ?>-400"></i>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-4">
        <a href="/admin/wallets/escrow"
            class="px-4 py-2 rounded-lg text-sm font-medium transition <?= !$currentStatus ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700' ?>">
            Tất cả
        </a>
        <a href="/admin/wallets/escrow?status=holding"
            class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $currentStatus === 'holding' ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700' ?>">
            Đang giữ
        </a>
        <a href="/admin/wallets/escrow?status=disputed"
            class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $currentStatus === 'disputed' ? 'bg-red-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700' ?>">
            Tranh chấp
        </a>
        <a href="/admin/wallets/escrow?status=released"
            class="px-4 py-2 rounded-lg text-sm font-medium transition <?= $currentStatus === 'released' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700' ?>">
            Đã giải ngân
        </a>
    </div>

    <!-- Escrow List -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                        <th class="px-4 py-3 text-left">Đơn hàng</th>
                        <th class="px-4 py-3 text-left">Seller</th>
                        <th class="px-4 py-3 text-right">Tổng tiền</th>
                        <th class="px-4 py-3 text-right">Phí sàn</th>
                        <th class="px-4 py-3 text-right">Seller nhận</th>
                        <th class="px-4 py-3 text-center">Trạng thái</th>
                        <th class="px-4 py-3 text-left">Giải ngân lúc</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($escrows)): ?>
                        <tr>
                            <td colspan="7" class="px-4 py-12 text-center text-slate-500">
                                <i class="fa-solid fa-inbox text-5xl mb-3 text-slate-300"></i>
                                <p>Không có dữ liệu</p>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($escrows as $esc):
                            $statusBadges = [
                                'holding' => 'bg-amber-100 text-amber-700',
                                'released' => 'bg-emerald-100 text-emerald-700',
                                'refunded' => 'bg-purple-100 text-purple-700',
                                'disputed' => 'bg-red-100 text-red-700',
                            ];
                            $statusLabels = [
                                'holding' => 'Đang giữ',
                                'released' => 'Đã giải ngân',
                                'refunded' => 'Đã hoàn tiền',
                                'disputed' => 'Tranh chấp',
                            ];
                            ?>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3">
                                    <a href="/admin/orders/show?id=<?= $esc['order_id'] ?>"
                                        class="text-blue-600 hover:underline font-medium">
                                        #
                                        <?= $esc['order_id'] ?>
                                    </a>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="font-medium text-slate-800">
                                        <?= htmlspecialchars($esc['seller_name'] ?? 'N/A') ?>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-right font-semibold text-slate-800">
                                    <?= number_format($esc['amount']) ?>đ
                                </td>
                                <td class="px-4 py-3 text-right text-red-600">
                                    -
                                    <?= number_format($esc['platform_fee']) ?>đ
                                </td>
                                <td class="px-4 py-3 text-right font-semibold text-emerald-600">
                                    <?= number_format($esc['seller_amount']) ?>đ
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span
                                        class="px-2 py-1 rounded-full text-xs font-medium <?= $statusBadges[$esc['status']] ?? 'bg-slate-100' ?>">
                                        <?= $statusLabels[$esc['status']] ?? $esc['status'] ?>
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-600">
                                    <?php if (!empty($esc['release_scheduled_at'])): ?>
                                        <?= date('d/m/Y H:i', strtotime($esc['release_scheduled_at'])) ?>
                                    <?php elseif (!empty($esc['released_at'])): ?>
                                        <span class="text-emerald-600">
                                            <?= date('d/m/Y H:i', strtotime($esc['released_at'])) ?>
                                        </span>
                                    <?php else: ?>
                                        <span class="text-slate-400">-</span>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>