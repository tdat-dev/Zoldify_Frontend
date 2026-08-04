<?php
use App\Helpers\ImageHelper;
use App\Helpers\TimeHelper;
include __DIR__ . '/../partials/head.php';
?>
<?php
// Fake seller check 
if (!isset($_SESSION['user'])) {
    header('Location: /login');
    exit;
}
?>
<?php include __DIR__ . '/../partials/header.php'; ?>

<main class="bg-gray-50 min-h-screen pb-20 md:pb-12">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <!-- User Info Card -->
        <?php $activeTab = 'shop_orders';
        include __DIR__ . '/../partials/profile_card.php'; ?>

        <!-- Content Area -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <!-- Order Tabs -->
            <div class="flex border-b border-gray-200 overflow-x-auto">
                <a href="/shop/orders?status=all"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Tất cả (<?= $counts['all'] ?? 0 ?>)
                </a>
                <a href="/shop/orders?status=pending"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'pending' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Chờ xác nhận (<?= $counts['pending'] ?? 0 ?>)
                </a>
                <a href="/shop/orders?status=pending_payment"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'pending_payment' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Chờ thanh toán (<?= $counts['pending_payment'] ?? 0 ?>)
                </a>
                <a href="/shop/orders?status=shipping"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'shipping' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Đang giao (<?= $counts['shipping'] ?? 0 ?>)
                </a>
                <a href="/shop/orders?status=completed"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'completed' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Đã giao (<?= $counts['completed'] ?? 0 ?>)
                </a>
                <a href="/shop/orders?status=cancelled"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'cancelled' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Đã hủy (<?= $counts['cancelled'] ?? 0 ?>)
                </a>
            </div>

            <!-- Search & Filter -->
            <div class="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <div class="relative flex-1 min-w-[250px]">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" placeholder="Tìm đơn hàng..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="flex gap-2">
                    <button
                        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white">
                        <i class="fa-solid fa-file-export mr-1"></i> Xuất Excel
                    </button>
                    <a href="/products/create"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm">
                        <i class="fa-solid fa-plus mr-1"></i> Đăng bán mới
                    </a>
                </div>
            </div>

            <!-- Orders List -->
            <div class="divide-y divide-gray-100">
                <?php if (empty($orders)): ?>
                    <div class="p-12 text-center text-gray-500">
                        <i class="fa-solid fa-box-open text-4xl mb-4 text-gray-300"></i>
                        <p>Chưa có đơn hàng nào.</p>
                    </div>
                <?php else: ?>
                    <?php foreach ($orders as $order): ?>
                        <div class="p-6 hover:bg-gray-50 transition">
                            <div class="flex flex-wrap justify-between items-start mb-4 gap-2">
                                <div class="flex gap-3 items-center">
                                    <span class="font-bold text-blue-600">#ORD-<?= $order['id'] ?></span>
                                    <span
                                        class="text-xs text-gray-500"><?= TimeHelper::formatDatetime($order['created_at']) ?></span>
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        <?= $order['status'] == 'pending' ? 'bg-yellow-100 text-yellow-800' : '' ?>
                                        <?= $order['status'] == 'pending_payment' ? 'bg-orange-100 text-orange-800' : '' ?>
                                        <?= $order['status'] == 'paid' ? 'bg-emerald-100 text-emerald-800' : '' ?>
                                        <?= $order['status'] == 'shipping' ? 'bg-blue-100 text-blue-800' : '' ?>
                                        <?= $order['status'] == 'completed' ? 'bg-green-100 text-green-800' : '' ?>
                                        <?= $order['status'] == 'cancelled' ? 'bg-red-100 text-red-800' : '' ?>
                                     ">
                                        <?= match ($order['status']) {
                                            'pending' => 'Chờ xác nhận',
                                            'pending_payment' => 'Chờ thanh toán',
                                            'paid' => 'Đã thanh toán',
                                            'shipping' => 'Đang giao',
                                            'completed' => 'Hoàn thành',
                                            'cancelled' => 'Đã hủy',
                                            default => ucfirst($order['status'])
                                        } ?>
                                    </span>
                                    <?php if (!empty($order['ghn_order_code'])): ?>
                                        <span class="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                            <i class="fa-solid fa-truck text-[10px] mr-1"></i>
                                            GHN: <?= htmlspecialchars($order['ghn_order_code']) ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                                <div class="text-sm font-bold text-red-600">
                                    <?= number_format($order['total_amount'], 0, ',', '.') ?>đ
                                </div>
                            </div>

                            <!-- Product Images -->
                            <?php if (!empty($order['items'])): ?>
                                <div class="flex items-center gap-3 mb-4">
                                    <?php
                                    $displayItems = array_slice($order['items'], 0, 3);
                                    $remainingCount = count($order['items']) - 3;
                                    ?>
                                    <?php foreach ($displayItems as $item): ?>
                                        <a href="/products/<?= $item['product_id'] ?>" class="block">
                                            <img src="<?= ImageHelper::url($item['product_image'] ?? 'default_product.png') ?>"
                                                alt="<?= htmlspecialchars($item['product_name'] ?? 'Sản phẩm') ?>"
                                                class="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition">
                                        </a>
                                    <?php endforeach; ?>
                                    <?php if ($remainingCount > 0): ?>
                                        <a href="/shop/orders/detail?id=<?= $order['id'] ?>"
                                            class="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 text-sm font-medium hover:bg-gray-100 transition">
                                            +<?= $remainingCount ?>
                                        </a>
                                    <?php endif; ?>

                                    <!-- Product name for single item -->
                                    <?php if (count($order['items']) === 1): ?>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-medium text-gray-800 truncate">
                                                <?= htmlspecialchars($order['items'][0]['product_name'] ?? '') ?>
                                            </p>
                                            <p class="text-xs text-gray-500">
                                                x<?= $order['items'][0]['quantity'] ?? 1 ?>
                                            </p>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <div class="flex justify-end gap-3">
                                <!-- Status Actions -->
                                <form action="/shop/orders/update" method="POST" class="inline-flex gap-2">
                                    <input type="hidden" name="order_id" value="<?= $order['id'] ?>">

                                    <?php if ($order['status'] == 'pending' || $order['status'] == 'paid'): ?>
                                        <button type="submit" name="status" value="shipping"
                                            class="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm">
                                            Xác nhận & Giao
                                        </button>
                                        <button type="submit" name="status" value="cancelled"
                                            class="px-3 py-1.5 border border-red-300 text-red-700 text-sm font-medium rounded-md hover:bg-red-50">
                                            Hủy đơn
                                        </button>
                                    <?php elseif ($order['status'] == 'shipping'): ?>
                                        <button type="submit" name="status" value="completed"
                                            class="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm">
                                            Đã giao xong
                                        </button>
                                    <?php endif; ?>
                                </form>

                                <a href="/shop/orders/detail?id=<?= $order['id'] ?>"
                                    class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 flex items-center justify-center">Chi
                                    tiết</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>