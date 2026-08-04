<?php
/**
 * Admin Wallet List View
 * Hiển thị danh sách ví sellers có số dư
 */

/** @var array $wallets */
/** @var array $stats */
/** @var int $page */

$title = $title ?? 'Quản lý Ví';
?>

<div class="p-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-emerald-100 text-sm">Tổng Khả dụng</p>
                    <p class="text-2xl font-bold">
                        <?= number_format($stats['total_balance'] ?? 0) ?>đ
                    </p>
                </div>
                <i class="fa-solid fa-wallet text-3xl text-emerald-200"></i>
            </div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-amber-100 text-sm">Đang Chờ (Pending)</p>
                    <p class="text-2xl font-bold">
                        <?= number_format($stats['total_pending'] ?? 0) ?>đ
                    </p>
                </div>
                <i class="fa-solid fa-clock text-3xl text-amber-200"></i>
            </div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-blue-100 text-sm">Tổng Đã Kiếm</p>
                    <p class="text-2xl font-bold">
                        <?= number_format($stats['total_earned'] ?? 0) ?>đ
                    </p>
                </div>
                <i class="fa-solid fa-chart-line text-3xl text-blue-200"></i>
            </div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-purple-100 text-sm">Đã Rút</p>
                    <p class="text-2xl font-bold">
                        <?= number_format($stats['total_withdrawn'] ?? 0) ?>đ
                    </p>
                </div>
                <i class="fa-solid fa-arrow-right-from-bracket text-3xl text-purple-200"></i>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-3 mb-6">
        <a href="/admin/wallets/withdrawals"
            class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition">
            <i class="fa-solid fa-money-bill-transfer"></i>
            Yêu cầu Rút tiền
        </a>
        <a href="/admin/wallets/escrow"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
            <i class="fa-solid fa-lock"></i>
            Quản lý Escrow
        </a>
    </div>

    <!-- Wallet List -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b bg-slate-50">
            <h2 class="text-lg font-semibold text-slate-800">
                <i class="fa-solid fa-wallet mr-2 text-emerald-500"></i>
                Danh sách Ví có số dư
            </h2>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                        <th class="px-4 py-3 text-left">Seller</th>
                        <th class="px-4 py-3 text-right">Khả dụng</th>
                        <th class="px-4 py-3 text-right">Đang chờ</th>
                        <th class="px-4 py-3 text-right">Tổng kiếm</th>
                        <th class="px-4 py-3 text-left">Ngân hàng</th>
                        <th class="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($wallets)): ?>
                        <tr>
                            <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                                <i class="fa-solid fa-inbox text-4xl mb-2 text-slate-300"></i>
                                <p>Chưa có ví nào có số dư</p>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($wallets as $wallet): ?>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <?php
                                        $avatar = $wallet['avatar'] ?? '';
                                        $avatarUrl = $avatar ? "/uploads/avatars/{$avatar}" : 'https://ui-avatars.com/api/?name=' . urlencode($wallet['full_name'] ?? 'U');
                                        ?>
                                        <img src="<?= $avatarUrl ?>" alt="" class="w-10 h-10 rounded-full object-cover">
                                        <div>
                                            <p class="font-medium text-slate-800">
                                                <?= htmlspecialchars($wallet['full_name'] ?? 'N/A') ?>
                                            </p>
                                            <p class="text-sm text-slate-500">
                                                <?= htmlspecialchars($wallet['email'] ?? '') ?>
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <span class="font-semibold text-emerald-600">
                                        <?= number_format($wallet['balance'] ?? 0) ?>đ
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <span class="text-amber-600">
                                        <?= number_format($wallet['pending_balance'] ?? 0) ?>đ
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-right text-slate-600">
                                    <?= number_format($wallet['total_earned'] ?? 0) ?>đ
                                </td>
                                <td class="px-4 py-3">
                                    <?php if (!empty($wallet['bank_name'])): ?>
                                        <p class="text-sm font-medium">
                                            <?= htmlspecialchars($wallet['bank_name']) ?>
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            <?= htmlspecialchars($wallet['bank_account_number'] ?? '') ?>
                                        </p>
                                    <?php else: ?>
                                        <span class="text-slate-400 text-sm">Chưa liên kết</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <a href="/admin/wallets/show?id=<?= $wallet['id'] ?>"
                                        class="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition">
                                        <i class="fa-solid fa-eye"></i>
                                        Chi tiết
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>