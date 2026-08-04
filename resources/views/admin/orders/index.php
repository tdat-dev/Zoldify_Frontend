<!-- Page Header -->
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <p class="text-gray-500 text-sm mt-1">Tổng cộng
            <?= $totalOrders ?> đơn hàng
        </p>
    </div>
</div>

<!-- Status Cards -->
<div class="grid grid-cols-4 gap-4 mb-6">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="text-yellow-600 text-sm">Chờ xử lý</div>
        <div class="text-2xl font-bold text-yellow-700">
            <?= $statusCounts['pending'] ?>
        </div>
    </div>
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="text-blue-600 text-sm">Đang giao</div>
        <div class="text-2xl font-bold text-blue-700">
            <?= $statusCounts['shipping'] ?>
        </div>
    </div>
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="text-green-600 text-sm">Hoàn thành</div>
        <div class="text-2xl font-bold text-green-700">
            <?= $statusCounts['completed'] ?>
        </div>
    </div>
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="text-red-600 text-sm">Đã hủy</div>
        <div class="text-2xl font-bold text-red-700">
            <?= $statusCounts['cancelled'] ?>
        </div>
    </div>
</div>

<!-- Alert Messages -->
<?php if (isset($_SESSION['success'])): ?>
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
        <?= $_SESSION['success'];
        unset($_SESSION['success']); ?>
    </div>
<?php endif; ?>

<?php if (isset($_SESSION['error'])): ?>
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
        <?= $_SESSION['error'];
        unset($_SESSION['error']); ?>
    </div>
<?php endif; ?>

<!-- Orders Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-gray-50 border-b">
            <tr>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Mã ĐH</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Người mua</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Người bán</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                <th class="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            <?php foreach ($orders as $order): ?>
                <tr class="hover:bg-gray-50 transition">
                    <td class="py-4 px-6">
                        <span class="font-medium text-gray-800">#
                            <?= $order['id'] ?>
                        </span>
                    </td>
                    <td class="py-4 px-6">
                        <div class="text-sm font-medium text-gray-800">
                            <?= htmlspecialchars($order['buyer_name']) ?>
                        </div>
                        <div class="text-xs text-gray-500">
                            <?= $order['buyer_email'] ?>
                        </div>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                        <?= htmlspecialchars($order['seller_name']) ?>
                    </td>
                    <td class="py-4 px-6 text-sm font-medium text-red-500">
                        <?= number_format($order['total_amount'], 0, ',', '.') ?>đ
                    </td>
                    <td class="py-4 px-6">
                        <?php
                        $statusColors = [
                            'pending' => 'bg-yellow-100 text-yellow-700',
                            'shipping' => 'bg-blue-100 text-blue-700',
                            'completed' => 'bg-green-100 text-green-700',
                            'cancelled' => 'bg-red-100 text-red-700'
                        ];
                        $statusLabels = [
                            'pending' => 'Chờ xử lý',
                            'shipping' => 'Đang giao',
                            'completed' => 'Hoàn thành',
                            'cancelled' => 'Đã hủy'
                        ];
                        $color = $statusColors[$order['status']] ?? 'bg-gray-100 text-gray-700';
                        $label = $statusLabels[$order['status']] ?? $order['status'];
                        ?>
                        <span class="px-2 py-1 rounded-full text-xs font-medium <?= $color ?>">
                            <?= $label ?>
                        </span>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-500">
                        <?= \App\Helpers\TimeHelper::formatDatetime($order['created_at']) ?>
                    </td>
                    <td class="py-4 px-6">
                        <div class="flex items-center justify-center gap-2">
                            <!-- View -->
                            <a href="/admin/orders/show?id=<?= $order['id'] ?>"
                                class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Xem chi tiết">
                                <i class="fa-solid fa-eye"></i>
                            </a>

                            <!-- Quick Status Update -->
                            <form action="/admin/orders/update-status" method="POST" class="inline">
                                <input type="hidden" name="id" value="<?= $order['id'] ?>">
                                <select name="status" onchange="this.form.submit()"
                                    class="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="pending" <?= $order['status'] === 'pending' ? 'selected' : '' ?>>Chờ xử lý
                                    </option>
                                    <option value="shipping" <?= $order['status'] === 'shipping' ? 'selected' : '' ?>>Đang giao
                                    </option>
                                    <option value="completed" <?= $order['status'] === 'completed' ? 'selected' : '' ?>>Hoàn
                                        thành</option>
                                    <option value="cancelled" <?= $order['status'] === 'cancelled' ? 'selected' : '' ?>>Đã hủy
                                    </option>
                                </select>
                            </form>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>

            <?php if (empty($orders)): ?>
                <tr>
                    <td colspan="7" class="py-8 text-center text-gray-500">
                        <i class="fa-solid fa-shopping-cart text-4xl text-gray-300 mb-3"></i>
                        <p>Chưa có đơn hàng nào</p>
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>