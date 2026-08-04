<?php
/**
 * Admin Wallet Detail View
 * Hiển thị chi tiết ví + lịch sử giao dịch
 */

/** @var array $wallet */
/** @var array $user */
/** @var array $transactions */
/** @var array $statsByType */

$title = $title ?? 'Chi tiết Ví';
?>

<div class="p-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href="/admin/wallets" class="hover:text-blue-600">Quản lý Ví</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span class="text-slate-800">Chi tiết</span>
    </div>

    <!-- User Info Card -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-start gap-6">
            <?php
            $avatar = $user['avatar'] ?? '';
            $avatarUrl = $avatar ? "/uploads/avatars/{$avatar}" : 'https://ui-avatars.com/api/?name=' . urlencode($user['full_name'] ?? 'U');
            ?>
            <img src="<?= $avatarUrl ?>" alt="" class="w-20 h-20 rounded-full object-cover">

            <div class="flex-1">
                <h2 class="text-xl font-bold text-slate-800">
                    <?= htmlspecialchars($user['full_name'] ?? 'N/A') ?>
                </h2>
                <p class="text-slate-500">
                    <?= htmlspecialchars($user['email'] ?? '') ?>
                </p>
                <p class="text-sm text-slate-400 mt-1">Ví ID: #
                    <?= $wallet['id'] ?>
                </p>
            </div>

            <div class="text-right">
                <p class="text-sm text-slate-500">Số dư khả dụng</p>
                <p class="text-3xl font-bold text-emerald-600">
                    <?= number_format($wallet['balance'] ?? 0) ?>đ
                </p>
            </div>
        </div>

        <!-- Balance Stats -->
        <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div class="text-center">
                <p class="text-sm text-slate-500">Đang chờ (Pending)</p>
                <p class="text-xl font-semibold text-amber-600">
                    <?= number_format($wallet['pending_balance'] ?? 0) ?>đ
                </p>
            </div>
            <div class="text-center">
                <p class="text-sm text-slate-500">Tổng đã kiếm</p>
                <p class="text-xl font-semibold text-blue-600">
                    <?= number_format($wallet['total_earned'] ?? 0) ?>đ
                </p>
            </div>
            <div class="text-center">
                <p class="text-sm text-slate-500">Đã rút</p>
                <p class="text-xl font-semibold text-purple-600">
                    <?= number_format($wallet['total_withdrawn'] ?? 0) ?>đ
                </p>
            </div>
        </div>

        <!-- Bank Info -->
        <?php if (!empty($wallet['bank_name'])): ?>
            <div class="mt-6 pt-6 border-t">
                <h3 class="font-semibold text-slate-700 mb-3">
                    <i class="fa-solid fa-building-columns mr-2"></i>
                    Tài khoản Ngân hàng
                </h3>
                <div class="grid grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4">
                    <div>
                        <p class="text-xs text-slate-500">Ngân hàng</p>
                        <p class="font-medium">
                            <?= htmlspecialchars($wallet['bank_name']) ?>
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Số tài khoản</p>
                        <p class="font-medium font-mono">
                            <?= htmlspecialchars($wallet['bank_account_number'] ?? '') ?>
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500">Chủ tài khoản</p>
                        <p class="font-medium">
                            <?= htmlspecialchars($wallet['bank_account_name'] ?? '') ?>
                        </p>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <!-- Transaction History -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b bg-slate-50">
            <h2 class="text-lg font-semibold text-slate-800">
                <i class="fa-solid fa-clock-rotate-left mr-2 text-blue-500"></i>
                Lịch sử Giao dịch
            </h2>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                        <th class="px-4 py-3 text-left">Thời gian</th>
                        <th class="px-4 py-3 text-left">Loại</th>
                        <th class="px-4 py-3 text-right">Số tiền</th>
                        <th class="px-4 py-3 text-right">Số dư sau</th>
                        <th class="px-4 py-3 text-left">Mô tả</th>
                        <th class="px-4 py-3 text-center">Trạng thái</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($transactions)): ?>
                        <tr>
                            <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                                Chưa có giao dịch nào
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($transactions as $trans): ?>
                            <?php
                            $typeColors = [
                                'credit' => 'bg-emerald-100 text-emerald-700',
                                'earning' => 'bg-emerald-100 text-emerald-700',
                                'withdrawal' => 'bg-red-100 text-red-700',
                                'refund' => 'bg-amber-100 text-amber-700',
                                'adjustment' => 'bg-blue-100 text-blue-700',
                            ];
                            $typeLabels = [
                                'credit' => 'Nhận tiền',
                                'earning' => 'Thu nhập',
                                'withdrawal' => 'Rút tiền',
                                'refund' => 'Hoàn tiền',
                                'adjustment' => 'Điều chỉnh',
                            ];
                            $typeClass = $typeColors[$trans['transaction_type']] ?? 'bg-slate-100 text-slate-700';
                            $typeLabel = $typeLabels[$trans['transaction_type']] ?? $trans['transaction_type'];

                            $statusColors = [
                                'pending' => 'bg-amber-100 text-amber-700',
                                'completed' => 'bg-emerald-100 text-emerald-700',
                                'failed' => 'bg-red-100 text-red-700',
                            ];
                            $statusLabels = [
                                'pending' => 'Chờ xử lý',
                                'completed' => 'Hoàn thành',
                                'failed' => 'Thất bại',
                            ];
                            $statusClass = $statusColors[$trans['status']] ?? 'bg-slate-100 text-slate-700';
                            $statusLabel = $statusLabels[$trans['status']] ?? $trans['status'];
                            ?>
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3 text-sm text-slate-600">
                                    <?= date('d/m/Y H:i', strtotime($trans['created_at'])) ?>
                                </td>
                                <td class="px-4 py-3">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $typeClass ?>">
                                        <?= $typeLabel ?>
                                    </span>
                                </td>
                                <td
                                    class="px-4 py-3 text-right font-semibold <?= in_array($trans['transaction_type'], ['credit', 'earning']) ? 'text-emerald-600' : 'text-red-600' ?>">
                                    <?= in_array($trans['transaction_type'], ['credit', 'earning']) ? '+' : '-' ?>
                                    <?= number_format($trans['amount']) ?>đ
                                </td>
                                <td class="px-4 py-3 text-right text-slate-600">
                                    <?= number_format($trans['balance_after'] ?? 0) ?>đ
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-600">
                                    <?= htmlspecialchars($trans['description'] ?? '-') ?>
                                    <?php if (!empty($trans['order_id'])): ?>
                                        <a href="/admin/orders/show?id=<?= $trans['order_id'] ?>"
                                            class="text-blue-600 hover:underline ml-1">
                                            #
                                            <?= $trans['order_id'] ?>
                                        </a>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium <?= $statusClass ?>">
                                        <?= $statusLabel ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>