<?php
/**
 * Admin Pending Withdrawals View
 * Danh sách yêu cầu rút tiền chờ duyệt
 */

/** @var array $withdrawals */

$title = $title ?? 'Yêu cầu Rút tiền';
?>

<div class="p-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href="/admin/wallets" class="hover:text-blue-600">Quản lý Ví</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span class="text-slate-800">Yêu cầu Rút tiền</span>
    </div>

    <?php if (isset($_SESSION['success'])): ?>
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
            <i class="fa-solid fa-check-circle mr-2"></i>
            <?= $_SESSION['success'];
            unset($_SESSION['success']); ?>
        </div>
    <?php endif; ?>

    <?php if (isset($_SESSION['error'])): ?>
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <i class="fa-solid fa-exclamation-circle mr-2"></i>
            <?= $_SESSION['error'];
            unset($_SESSION['error']); ?>
        </div>
    <?php endif; ?>

    <!-- Withdrawal List -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b bg-amber-50">
            <h2 class="text-lg font-semibold text-slate-800">
                <i class="fa-solid fa-money-bill-transfer mr-2 text-amber-500"></i>
                Yêu cầu Rút tiền Chờ duyệt
                <?php if (count($withdrawals) > 0): ?>
                    <span class="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                        <?= count($withdrawals) ?>
                    </span>
                <?php endif; ?>
            </h2>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                        <th class="px-4 py-3 text-left">Người yêu cầu</th>
                        <th class="px-4 py-3 text-right">Số tiền</th>
                        <th class="px-4 py-3 text-right">Số dư ví</th>
                        <th class="px-4 py-3 text-left">Ngân hàng</th>
                        <th class="px-4 py-3 text-left">Thời gian</th>
                        <th class="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($withdrawals)): ?>
                        <tr>
                            <td colspan="6" class="px-4 py-12 text-center text-slate-500">
                                <i class="fa-solid fa-check-circle text-5xl mb-3 text-emerald-300"></i>
                                <p class="text-lg">Không có yêu cầu nào đang chờ duyệt</p>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($withdrawals as $wdr): ?>
                            <tr class="hover:bg-amber-50">
                                <td class="px-4 py-4">
                                    <div class="font-medium text-slate-800">
                                        <?= htmlspecialchars($wdr['full_name'] ?? 'N/A') ?>
                                    </div>
                                    <div class="text-sm text-slate-500">
                                        <?= htmlspecialchars($wdr['email'] ?? '') ?>
                                    </div>
                                </td>
                                <td class="px-4 py-4 text-right">
                                    <span class="text-xl font-bold text-red-600">
                                        <?= number_format($wdr['amount']) ?>đ
                                    </span>
                                </td>
                                <td class="px-4 py-4 text-right text-slate-600">
                                    <?= number_format($wdr['wallet_balance'] ?? 0) ?>đ
                                </td>
                                <td class="px-4 py-4">
                                    <?php if (!empty($wdr['bank_name'])): ?>
                                        <div class="font-medium">
                                            <?= htmlspecialchars($wdr['bank_name']) ?>
                                        </div>
                                        <div class="text-sm text-slate-500 font-mono">
                                            <?= htmlspecialchars($wdr['bank_account_number'] ?? '') ?>
                                        </div>
                                        <div class="text-sm text-slate-500">
                                            <?= htmlspecialchars($wdr['bank_account_name'] ?? '') ?>
                                        </div>
                                    <?php else: ?>
                                        <span class="text-red-500 text-sm">
                                            <i class="fa-solid fa-exclamation-triangle mr-1"></i>
                                            Chưa liên kết
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-4 py-4 text-sm text-slate-600">
                                    <?= date('d/m/Y H:i', strtotime($wdr['created_at'])) ?>
                                </td>
                                <td class="px-4 py-4">
                                    <div class="flex items-center justify-center gap-2">
                                        <!-- Approve -->
                                        <form action="/admin/wallets/approve-withdrawal" method="POST" class="inline"
                                            onsubmit="return confirm('Xác nhận duyệt yêu cầu này?')">
                                            <input type="hidden" name="id" value="<?= $wdr['id'] ?>">
                                            <input type="text" name="reference_id" placeholder="Mã CK"
                                                class="w-24 px-2 py-1 text-sm border rounded mr-2">
                                            <button type="submit"
                                                class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition">
                                                <i class="fa-solid fa-check mr-1"></i>Duyệt
                                            </button>
                                        </form>

                                        <!-- Reject -->
                                        <button onclick="openRejectModal(<?= $wdr['id'] ?>)"
                                            class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition">
                                            <i class="fa-solid fa-times mr-1"></i>Từ chối
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Từ chối yêu cầu rút tiền</h3>
        <form action="/admin/wallets/reject-withdrawal" method="POST">
            <input type="hidden" name="id" id="rejectId">
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 mb-2">Lý do từ chối</label>
                <textarea name="reason" rows="3"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập lý do từ chối..."></textarea>
            </div>
            <div class="flex gap-3 justify-end">
                <button type="button" onclick="closeRejectModal()"
                    class="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition">
                    Hủy
                </button>
                <button type="submit" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                    Xác nhận Từ chối
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    function openRejectModal(id) {
        document.getElementById('rejectId').value = id;
        document.getElementById('rejectModal').classList.remove('hidden');
        document.getElementById('rejectModal').classList.add('flex');
    }

    function closeRejectModal() {
        document.getElementById('rejectModal').classList.add('hidden');
        document.getElementById('rejectModal').classList.remove('flex');
    }
</script>