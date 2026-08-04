<?php
use App\Helpers\ImageHelper;
use App\Helpers\TimeHelper;
include __DIR__ . '/../partials/head.php';
?>
<?php
if (!isset($_SESSION['user'])) {
    header('Location: /login');
    exit;
}
?>
<?php include __DIR__ . '/../partials/header.php'; ?>

<main class="bg-gray-50 min-h-screen pb-20 md:pb-12">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <!-- User Info Card -->
        <!-- User Info Card -->
        <?php $activeTab = 'orders';
        include __DIR__ . '/../partials/profile_card.php'; ?>


        <!-- Content Area -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <!-- Order Tabs -->
            <div class="flex border-b border-gray-200 overflow-x-auto">
                <a href="/profile/orders?status=all"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Tất cả (<?= $counts['all'] ?? 0 ?>)
                </a>
                <a href="/profile/orders?status=pending"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'pending' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Chờ xác nhận (<?= $counts['pending'] ?? 0 ?>)
                </a>
                <a href="/profile/orders?status=pending_payment"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'pending_payment' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Chờ thanh toán (<?= $counts['pending_payment'] ?? 0 ?>)
                </a>
                <a href="/profile/orders?status=shipping"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'shipping' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Đang giao (<?= $counts['shipping'] ?? 0 ?>)
                </a>
                <a href="/profile/orders?status=completed"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap <?= $currentStatus == 'completed' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-blue-600' ?>">
                    Đã giao (<?= $counts['completed'] ?? 0 ?>)
                </a>
                <a href="/profile/orders?status=cancelled"
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
            </div>

            <?php
            // Hiển thị thông báo lỗi nếu có
            $error = $_GET['error'] ?? null;
            $success = $_GET['success'] ?? null;

            $errorMessages = [
                'invalid_order' => 'Đơn hàng không hợp lệ.',
                'unauthorized' => 'Bạn không có quyền thực hiện thao tác này.',
                'product_unavailable' => 'Một số sản phẩm đã ngừng bán hoặc không còn tồn tại.',
                'out_of_stock' => 'Một số sản phẩm đã hết hàng.',
                'no_items' => 'Không có sản phẩm nào để mua lại.',
                'cannot_cancel' => 'Không thể hủy đơn hàng ở trạng thái này.'
            ];

            $successMessages = [
                'rebuy' => 'Đã tạo đơn mua lại thành công!',
                'cancelled' => 'Đã hủy đơn hàng thành công.'
            ];
            ?>

            <?php if ($error && isset($errorMessages[$error])): ?>
            <div class="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <i class="fa-solid fa-circle-exclamation text-red-500"></i>
                <span class="text-red-700 text-sm"><?= $errorMessages[$error] ?></span>
            </div>
            <?php endif; ?>

            <?php if ($success && isset($successMessages[$success])): ?>
            <div class="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <i class="fa-solid fa-circle-check text-green-500"></i>
                <span class="text-green-700 text-sm"><?= $successMessages[$success] ?></span>
            </div>
            <?php endif; ?>

            <!-- Orders List -->
            <div class="divide-y divide-gray-100">
                <?php if (empty($orders)): ?>
                <div class="p-12 text-center text-gray-500">
                    <i class="fa-solid fa-basket-shopping text-4xl mb-4 text-gray-300"></i>
                    <p>Bạn chưa mua đơn hàng nào.</p>
                    <a href="/"
                        class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Mua
                        sắm ngay</a>
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
                                        <?= ($order['status'] == 'pending' || $order['status'] == 'paid') ? 'bg-yellow-100 text-yellow-800' : '' ?>
                                        <?= $order['status'] == 'pending_payment' ? 'bg-orange-100 text-orange-800' : '' ?>
                                        <?= $order['status'] == 'shipping' ? 'bg-blue-100 text-blue-800' : '' ?>
                                        <?= $order['status'] == 'completed' ? 'bg-green-100 text-green-800' : '' ?>
                                        <?= $order['status'] == 'cancelled' ? 'bg-red-100 text-red-800' : '' ?>
                                     ">
                                <?php
                                        $statusMap = [
                                            'pending' => 'Chờ xác nhận',
                                            'pending_payment' => 'Chờ thanh toán',
                                            'paid' => 'Chờ xác nhận',
                                            'shipping' => 'Đang giao',
                                            'completed' => 'Đã giao',
                                            'cancelled' => 'Đã hủy'
                                        ];
                                        echo $statusMap[$order['status']] ?? ucfirst($order['status']);
                                        ?>
                            </span>
                        </div>
                        <div class="text-sm font-bold text-red-600">
                            <?= number_format($order['total_amount'] ?? 0, 0, ',', '.') ?>đ
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
                        <a href="/profile/orders/detail?id=<?= $order['id'] ?>"
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
                    <div class="flex flex-wrap justify-end items-center gap-2">
                        <?php if ($order['status'] == 'pending' || $order['status'] == 'pending_payment'): ?>
                        <button type="button" onclick="initiateCancel(<?= $order['id'] ?>)"
                            class="px-4 py-2 border border-red-500 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 whitespace-nowrap">Hủy
                            đơn hàng</button>
                        <?php endif; ?>
                        <?php if ($order['status'] == 'pending_payment'): ?>
                        <!-- Luôn tạo payment link MỚI để tránh link hết hạn -->
                        <form action="/payment/create" method="POST" class="inline">
                            <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                            <button type="submit"
                                class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 whitespace-nowrap"
                                style="background-color: #f97316 !important; color: white !important;">
                                <i class="fas fa-qrcode mr-1"></i>Thanh toán ngay
                            </button>
                        </form>
                        <?php endif; ?>
                        <button type="button" onclick="initiateRebuy(<?= $order['id'] ?>)"
                            class="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 whitespace-nowrap">Mua
                            lại</button>
                        <a href="/profile/orders/detail?id=<?= $order['id'] ?>"
                            class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 whitespace-nowrap">Chi
                            tiết</a>
                    </div>
                </div>
                <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <!-- Cancel Reason Modal -->
    <div id="cancelReasonModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"
        style="backdrop-filter: blur(2px);">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div class="flex justify-between items-center mb-4 border-b pb-3">
                <h3 class="text-lg font-bold text-gray-900">Lý do hủy đơn hàng</h3>
                <button onclick="closeCancelModal()" class="text-gray-400 hover:text-gray-600">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <div class="space-y-3 mb-6">
                <p class="text-sm text-gray-500 mb-2">Vui lòng chọn lý do hủy:</p>
                <label
                    class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="cancel_reason" value="change_mind"
                        class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm text-gray-700">Tôi muốn thay đổi địa chỉ/số điện thoại</span>
                </label>
                <label
                    class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="cancel_reason" value="change_product"
                        class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm text-gray-700">Tôi muốn đổi sản phẩm khác</span>
                </label>
                <label
                    class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="cancel_reason" value="too_long"
                        class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm text-gray-700">Thời gian giao hàng quá lâu</span>
                </label>
                <label
                    class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="cancel_reason" value="not_needed"
                        class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm text-gray-700">Tôi không còn nhu cầu mua nữa</span>
                </label>
                <label
                    class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input type="radio" name="cancel_reason" value="other"
                        class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm text-gray-700">Lý do khác</span>
                </label>
            </div>
            <div class="flex justify-end gap-3 pt-2">
                <button onclick="closeCancelModal()"
                    class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium">Đóng</button>
                <button onclick="proceedToConfirmation()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition">Xác
                    nhận</button>
            </div>
        </div>
    </div>

    <!-- Final Confirmation Modal -->
    <div id="confirmCancelModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"
        style="backdrop-filter: blur(2px);">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center shadow-xl">
            <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold mb-2 text-gray-900">Xác nhận hủy đơn?</h3>
            <p class="text-gray-500 mb-6 text-sm leading-relaxed">Bạn có chắc chắn muốn hủy đơn hàng này không? Hành
                động này không thể hoàn tác.</p>
            <div class="flex justify-center gap-3">
                <button onclick="closeConfirmModal()"
                    class="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 text-sm transition">Không</button>
                <form id="finalCancelForm" action="/profile/orders/cancel" method="POST" class="inline">
                    <input type="hidden" name="order_id" id="finalOrderId">
                    <input type="hidden" name="reason" id="finalReason">
                    <button type="submit"
                        class="px-5 py-2.5 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 text-sm shadow-sm transition"
                        style="background-color: #dc2626;">Đồng ý hủy</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Rebuy Confirmation Modal -->
    <div id="rebuyOrderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden"
        style="backdrop-filter: blur(2px);">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center shadow-xl">
            <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-cart-plus text-blue-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-bold mb-2 text-gray-900">Mua lại đơn hàng?</h3>
            <p class="text-gray-500 mb-6 text-sm leading-relaxed">Bạn có đồng ý mua lại các sản phẩm trong đơn hàng này
                không?</p>
            <div class="flex justify-center gap-3">
                <button onclick="closeRebuyModal()"
                    class="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 text-sm transition">Quay
                    lại</button>
                <form id="rebuyOrderForm" action="/profile/orders/rebuy" method="POST" class="inline">
                    <input type="hidden" name="order_id" id="rebuyOrderId">
                    <button type="submit"
                        class="px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 text-sm shadow-sm transition">Đồng
                        ý</button>
                </form>
            </div>
        </div>
    </div>

    <script>
    let currentOrderId = null;
    let selectedReason = null;

    function initiateCancel(orderId) {
        currentOrderId = orderId;
        document.getElementById('cancelReasonModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Reset selection
        const radios = document.getElementsByName('cancel_reason');
        radios.forEach(r => r.checked = false);
    }

    function closeCancelModal() {
        document.getElementById('cancelReasonModal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    function proceedToConfirmation() {
        const radios = document.getElementsByName('cancel_reason');
        let selected = false;
        radios.forEach(r => {
            if (r.checked) {
                selected = true;
                selectedReason = r.value;
            }
        });

        if (!selected) {
            alert('Vui lòng chọn lý do để chúng tôi hỗ trợ tốt hơn!');
            return;
        }

        closeCancelModal();
        document.getElementById('confirmCancelModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        document.getElementById('finalOrderId').value = currentOrderId;
        document.getElementById('finalReason').value = selectedReason;
    }

    function closeConfirmModal() {
        document.getElementById('confirmCancelModal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Close modal when clicking outside
    document.getElementById('cancelReasonModal').addEventListener('click', function(e) {
        if (e.target === this) closeCancelModal();
    });

    document.getElementById('confirmCancelModal').addEventListener('click', function(e) {
        if (e.target === this) closeConfirmModal();
    });

    function initiateRebuy(orderId) {
        document.getElementById('rebuyOrderId').value = orderId;
        document.getElementById('rebuyOrderModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeRebuyModal() {
        document.getElementById('rebuyOrderModal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    document.getElementById('rebuyOrderModal').addEventListener('click', function(e) {
        if (e.target === this) closeRebuyModal();
    });
    </script>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>