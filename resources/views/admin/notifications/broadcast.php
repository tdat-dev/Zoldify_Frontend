<?php
/**
 * Admin Broadcast Notification View
 */

/** @var array $stats */

$title = $title ?? 'Gửi Thông báo';
?>

<div class="p-6">
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

    <div class="max-w-2xl mx-auto">
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                <div class="text-3xl font-bold text-blue-600">
                    <?= number_format($stats['total'] ?? 0) ?>
                </div>
                <div class="text-sm text-slate-500">Tổng Users</div>
            </div>
            <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                <div class="text-3xl font-bold text-emerald-600">
                    <?= number_format($stats['buyers'] ?? 0) ?>
                </div>
                <div class="text-sm text-slate-500">Buyers</div>
            </div>
            <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                <div class="text-3xl font-bold text-purple-600">
                    <?= number_format($stats['sellers'] ?? 0) ?>
                </div>
                <div class="text-sm text-slate-500">Sellers</div>
            </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <h2 class="text-lg font-semibold">
                    <i class="fa-solid fa-bullhorn mr-2"></i>
                    Gửi Thông báo Hàng loạt
                </h2>
            </div>

            <form action="/admin/notifications/send" method="POST" class="p-6">
                <!-- Target -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Gửi đến</label>
                    <div class="flex gap-3">
                        <label
                            class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition">
                            <input type="radio" name="target" value="all" checked class="text-blue-500">
                            <span>Tất cả (
                                <?= $stats['total'] ?? 0 ?>)
                            </span>
                        </label>
                        <label
                            class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition">
                            <input type="radio" name="target" value="buyers" class="text-emerald-500">
                            <span>Buyers (
                                <?= $stats['buyers'] ?? 0 ?>)
                            </span>
                        </label>
                        <label
                            class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition">
                            <input type="radio" name="target" value="sellers" class="text-purple-500">
                            <span>Sellers (
                                <?= $stats['sellers'] ?? 0 ?>)
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Type -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Loại thông báo</label>
                    <select name="type" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="system">🔔 Hệ thống</option>
                        <option value="promo">🎁 Khuyến mãi</option>
                        <option value="update">📢 Cập nhật</option>
                        <option value="warning">⚠️ Cảnh báo</option>
                    </select>
                </div>

                <!-- Content -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Nội dung thông báo</label>
                    <textarea name="content" rows="4" required
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập nội dung thông báo..."></textarea>
                </div>

                <!-- Submit -->
                <button type="submit"
                    class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg transition"
                    onclick="return confirm('Xác nhận gửi thông báo?')">
                    <i class="fa-solid fa-paper-plane mr-2"></i>
                    Gửi Thông báo
                </button>
            </form>
        </div>

        <!-- Warning -->
        <div class="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            <i class="fa-solid fa-exclamation-triangle mr-1"></i>
            <strong>Lưu ý:</strong> Thông báo sẽ được gửi ngay lập tức đến tất cả người dùng được chọn.
        </div>
    </div>
</div>