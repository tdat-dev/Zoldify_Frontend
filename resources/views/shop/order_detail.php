<?php
use App\Helpers\ImageHelper;
include __DIR__ . '/../partials/head.php';
?>
<?php include __DIR__ . '/../partials/header.php'; ?>

<main class="bg-gray-50 min-h-screen pb-20 md:py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="flex mb-6 text-sm text-gray-500">
            <a href="/" class="hover:text-blue-600">Trang chủ</a>
            <span class="mx-2">/</span>
            <a href="/shop/orders" class="hover:text-blue-600">Đơn bán hàng</a>
            <span class="mx-2">/</span>
            <span class="text-gray-900 font-medium">Chi tiết đơn hàng #ORD-<?= $order['id'] ?></span>
        </nav>

        <div class="flex flex-col md:flex-row gap-6">
            <!-- Left Column: Order Items -->
            <div class="flex-1">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 class="font-bold text-gray-800">Sản phẩm (<?= count($order['items']) ?>)</h2>
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium 
                            <?= $order['status'] == 'pending' ? 'bg-yellow-100 text-yellow-800' : '' ?>
                            <?= $order['status'] == 'pending_payment' ? 'bg-orange-100 text-orange-800' : '' ?>
                            <?= $order['status'] == 'shipping' ? 'bg-blue-100 text-blue-800' : '' ?>
                            <?= $order['status'] == 'completed' ? 'bg-green-100 text-green-800' : '' ?>
                            <?= $order['status'] == 'cancelled' ? 'bg-red-100 text-red-800' : '' ?>
                        ">
                            <?php
                            $statusMap = [
                                'pending' => 'Chờ xác nhận',
                                'pending_payment' => 'Chờ thanh toán',
                                'paid' => 'Đã thanh toán',
                                'shipping' => 'Đang giao',
                                'completed' => 'Hoàn thành',
                                'cancelled' => 'Đã huỷ'
                            ];
                            echo $statusMap[$order['status']] ?? ucfirst($order['status']);
                            ?>
                        </span>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <?php foreach ($order['items'] as $item): ?>
                            <div class="p-4 flex gap-4 hover:bg-gray-50 transition">
                                <div
                                    class="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                                    <img src="<?= ImageHelper::url('uploads/' . ($item['product_image'] ?? '')) ?>"
                                        class="w-full h-full object-cover">
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between items-start">
                                        <h4 class="font-medium text-gray-900 line-clamp-2">
                                            <?= htmlspecialchars($item['product_name']) ?>
                                        </h4>
                                        <span
                                            class="font-bold text-gray-900 ml-4"><?= number_format($item['price_at_purchase'] * $item['quantity'], 0, ',', '.') ?>đ</span>
                                    </div>
                                    <p class="text-sm text-gray-500 mt-1">Mã sản phẩm: SKU-<?= $item['product_id'] ?></p>
                                    <div class="flex justify-between items-center mt-2">
                                        <span class="text-sm text-gray-500">x<?= $item['quantity'] ?></span>
                                        <!-- Backend data -->
                                        <span
                                            class="text-xs text-gray-400 line-through"><?= number_format(($item['price_at_purchase'] * 1.2), 0, ',', '.') ?>đ</span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Timeline / Status History (Optional Demo) -->
                <!-- Detailed Timeline -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="font-bold text-gray-800 mb-6">Trạng thái đơn hàng</h3>

                    <div class="relative pl-2">
                        <?php
                        // Logic xác định trạng thái active
                        $steps = [
                            'placed' => ['active' => true, 'time' => $order['created_at'], 'label' => 'Đơn hàng đã đặt'],
                            'paid' => ['active' => false, 'time' => $order['paid_at'] ?? null, 'label' => 'Đã xác nhận thanh toán'],
                            'shipping' => ['active' => false, 'time' => $order['updated_at'] ?? null, 'label' => 'Đã giao cho ĐVVC'],
                            'completed' => ['active' => false, 'time' => $order['completed_at'] ?? $order['received_at'] ?? null, 'label' => 'Giao hàng thành công'],
                        ];

                        // Determine active steps based on status
                        if ($order['status'] != 'pending_payment' && $order['status'] != 'cancelled') {
                            $steps['paid']['active'] = true;
                            // Fallback time if paid_at is null but status advanced
                            if (!$steps['paid']['time'])
                                $steps['paid']['time'] = $order['updated_at'] ?? null;
                        }

                        if ($order['status'] == 'shipping' || $order['status'] == 'completed' || $order['status'] == 'received') {
                            $steps['shipping']['active'] = true;
                        }

                        if ($order['status'] == 'completed' || $order['status'] == 'received') {
                            $steps['completed']['active'] = true;
                        }

                        // Special case for cancelled
                        if ($order['status'] == 'cancelled') {
                            $steps = [
                                'placed' => ['active' => true, 'time' => $order['created_at'], 'label' => 'Đơn hàng đã đặt'],
                                'cancelled' => ['active' => true, 'time' => $order['updated_at'] ?? null, 'label' => 'Đã hủy đơn hàng'],
                            ];
                        }
                        ?>

                        <!-- Vertical Line -->
                        <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                        <div class="space-y-8 relative">
                            <?php foreach ($steps as $key => $step): ?>
                                <div class="relative pl-8">
                                    <!-- Dot -->
                                    <div class="absolute left-0 top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center bg-white z-10
                                    <?= $step['active'] ? 'border-green-500' : 'border-gray-300' ?>">
                                        <?php if ($step['active']): ?>
                                            <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        <?php else: ?>
                                            <div class="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                        <?php endif; ?>
                                    </div>

                                    <!-- Content -->
                                    <div>
                                        <h4
                                            class="text-sm font-bold <?= $step['active'] ? 'text-green-600' : 'text-gray-500' ?> leading-none mb-1.5">
                                            <?= $step['label'] ?>
                                        </h4>
                                        <?php if ($step['active'] && $step['time']): ?>
                                            <p class="text-xs text-gray-500">
                                                <?= date('H:i d-m-Y', strtotime($step['time'])) ?>
                                            </p>
                                        <?php endif; ?>

                                        <?php if ($key == 'cancelled' && !empty($order['cancel_reason'])): ?>
                                            <p class="text-xs text-red-500 mt-1">Lý do:
                                                <?= htmlspecialchars($order['cancel_reason']) ?></p>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Info & Summary -->
            <div class="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
                <?php
                $itemsSubtotal = 0;
                foreach ($order['items'] as $item) {
                    $itemsSubtotal += (float) $item['price_at_purchase'] * (int) $item['quantity'];
                }
                $shippingFee = (float) ($order['shipping_fee'] ?? 0);
                $totalPayable = (float) ($order['total_amount'] ?? ($itemsSubtotal + $shippingFee));
                ?>

                <!-- Helper Actions for Shop -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 class="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">Thao tác</h3>
                    <form action="/shop/orders/update" method="POST" class="flex flex-col gap-2">
                        <input type="hidden" name="order_id" value="<?= $order['id'] ?>">

                        <?php if ($order['status'] == 'pending' || $order['status'] == 'paid'): ?>
                            <button type="submit" name="status" value="shipping"
                                class="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm text-center">
                                Xác nhận & Giao ngay
                            </button>
                            <button type="submit" name="status" value="cancelled"
                                class="w-full px-3 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-md hover:bg-red-50 text-center">
                                Hủy đơn hàng
                            </button>
                        <?php elseif ($order['status'] == 'shipping'): ?>
                            <div class="p-3 bg-blue-50 text-blue-800 text-sm rounded-md mb-2">
                                Đơn hàng đang được giao
                            </div>
                            <button type="submit" name="status" value="completed"
                                class="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm text-center">
                                Xác nhận đã giao xong
                            </button>
                        <?php endif; ?>
                    </form>
                </div>

                <!-- Receiver Info -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 class="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">Thông tin khách hàng</h3>
                    <div class="flex flex-col gap-2 text-sm">
                        <span
                            class="font-bold text-gray-900"><?= htmlspecialchars($buyer['full_name'] ?? 'Khách hàng') ?></span>
                        <span
                            class="text-gray-500"><?= htmlspecialchars($buyer['phone_number'] ?? 'Chưa cập nhật SĐT') ?></span>
                        <span
                            class="text-gray-600 block mt-1"><?= htmlspecialchars($buyer['address'] ?? 'Chưa cập nhật địa chỉ') ?></span>
                    </div>
                </div>

                <!-- Payment Info -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 class="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">Chi tiết thanh toán</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between text-gray-600">
                            <span>Tổng tiền hàng</span>
                            <span><?= number_format($itemsSubtotal, 0, ',', '.') ?>đ</span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span>
                                <?= $shippingFee <= 0 ? 'Miễn phí' : number_format($shippingFee, 0, ',', '.') . 'đ' ?>
                            </span>
                        </div>
                        <div class="flex justify-between text-gray-600">
                            <span>Chiết khấu</span>
                            <span>0đ</span>
                        </div>
                        <div class="border-t border-gray-100 pt-2 flex justify-between items-center">
                            <span class="font-bold text-gray-900">Tổng thu</span>
                            <span
                                class="font-bold text-xl text-green-600"><?= number_format($totalPayable, 0, ',', '.') ?>đ</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <a href="/shop/orders"
                        class="block w-full text-center py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition text-sm shadow-sm">
                        <i class="fa-solid fa-arrow-left mr-2"></i> Quay lại
                    </a>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>
