<?php
use App\Helpers\ImageHelper;
use App\Helpers\TimeHelper;
?>
<!-- Page Header -->
<div class="flex items-center gap-4 mb-6">
    <a href="/admin/orders" class="p-2 hover:bg-gray-100 rounded-lg transition">
        <i class="fa-solid fa-arrow-left text-gray-500"></i>
    </a>
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Chi tiết đơn hàng #<?= $order['id'] ?></h1>
        <p class="text-gray-500 text-sm mt-1">Ngày tạo: <?= TimeHelper::formatDatetime($order['created_at']) ?></p>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Order Info -->
    <div class="lg:col-span-2">
        <!-- Order Status -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Trạng thái đơn hàng</h2>

            <?php
            $statusColors = [
                'pending' => 'bg-yellow-100 text-yellow-700 border-yellow-300',
                'shipping' => 'bg-blue-100 text-blue-700 border-blue-300',
                'completed' => 'bg-green-100 text-green-700 border-green-300',
                'cancelled' => 'bg-red-100 text-red-700 border-red-300'
            ];
            $statusLabels = [
                'pending' => 'Chờ xử lý',
                'shipping' => 'Đang giao hàng',
                'completed' => 'Hoàn thành',
                'cancelled' => 'Đã hủy'
            ];
            $color = $statusColors[$order['status']] ?? 'bg-gray-100 text-gray-700';
            $label = $statusLabels[$order['status']] ?? $order['status'];
            ?>

            <div class="flex items-center justify-between">
                <span class="px-4 py-2 rounded-lg text-sm font-medium border <?= $color ?>">
                    <?= $label ?>
                </span>

                <!-- Update Status Form -->
                <form action="/admin/orders/update-status" method="POST" class="flex items-center gap-2">
                    <input type="hidden" name="id" value="<?= $order['id'] ?>">
                    <select name="status" class="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                        <option value="pending" <?= $order['status'] === 'pending' ? 'selected' : '' ?>>Chờ xử lý</option>
                        <option value="shipping" <?= $order['status'] === 'shipping' ? 'selected' : '' ?>>Đang giao
                        </option>
                        <option value="completed" <?= $order['status'] === 'completed' ? 'selected' : '' ?>>Hoàn thành
                        </option>
                        <option value="cancelled" <?= $order['status'] === 'cancelled' ? 'selected' : '' ?>>Đã hủy</option>
                    </select>
                    <button type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                        Cập nhật
                    </button>
                </form>
            </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Sản phẩm trong đơn</h2>

            <div class="divide-y divide-gray-100">
                <?php foreach ($orderDetails as $item): ?>
                    <div class="flex items-center gap-4 py-4">
                        <img src="<?= ImageHelper::url('uploads/' . ($item['product_image'] ?? '')) ?>"
                            alt="<?= $item['product_name'] ?>" class="w-16 h-16 object-cover rounded-lg border">
                        <div class="flex-1">
                            <h3 class="font-medium text-gray-800"><?= htmlspecialchars($item['product_name']) ?></h3>
                            <p class="text-sm text-gray-500">Số lượng: <?= $item['quantity'] ?></p>
                        </div>
                        <div class="text-right">
                            <div class="font-medium text-red-500">
                                <?= number_format($item['price_at_purchase'], 0, ',', '.') ?>đ
                            </div>
                            <div class="text-xs text-gray-500">x<?= $item['quantity'] ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>

                <?php if (empty($orderDetails)): ?>
                    <div class="py-8 text-center text-gray-500">
                        <p>Không có sản phẩm trong đơn hàng này</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Total -->
            <div class="border-t border-gray-200 pt-4 mt-4">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                    <span
                        class="text-2xl font-bold text-red-500"><?= number_format($order['total_amount'], 0, ',', '.') ?>đ</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Customer Info -->
    <div class="lg:col-span-1">
        <!-- Buyer Info -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">
                <i class="fa-solid fa-user text-blue-500 mr-2"></i>Người mua
            </h2>
            <div class="space-y-3">
                <div>
                    <div class="text-xs text-gray-500">Họ tên</div>
                    <div class="font-medium text-gray-800"><?= htmlspecialchars($order['buyer_name']) ?></div>
                </div>
                <div>
                    <div class="text-xs text-gray-500">Email</div>
                    <div class="text-gray-600"><?= $order['buyer_email'] ?></div>
                </div>
                <div>
                    <div class="text-xs text-gray-500">Số điện thoại</div>
                    <div class="text-gray-600"><?= $order['buyer_phone'] ?? 'Chưa có' ?></div>
                </div>
            </div>
        </div>

        <!-- Seller Info -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">
                <i class="fa-solid fa-store text-green-500 mr-2"></i>Người bán
            </h2>
            <div class="space-y-3">
                <div>
                    <div class="text-xs text-gray-500">Họ tên</div>
                    <div class="font-medium text-gray-800"><?= htmlspecialchars($order['seller_name']) ?></div>
                </div>
                <div>
                    <div class="text-xs text-gray-500">Email</div>
                    <div class="text-gray-600"><?= $order['seller_email'] ?></div>
                </div>
            </div>
        </div>
    </div>
</div>