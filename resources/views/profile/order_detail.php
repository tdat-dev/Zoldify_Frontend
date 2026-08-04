<?php
use App\Helpers\ImageHelper;
use App\Helpers\TimeHelper;
include __DIR__ . '/../partials/head.php';
?>
<?php include __DIR__ . '/../partials/header.php'; ?>

<main class="bg-gray-50 min-h-screen pb-20 md:py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="flex mb-6 text-sm text-gray-500">
            <a href="/" class="hover:text-blue-600">Trang chủ</a>
            <span class="mx-2">/</span>
            <a href="/profile/orders" class="hover:text-blue-600">Đơn hàng của tôi</a>
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
                                'completed' => 'Giao hàng thành công',
                                'cancelled' => 'Đã bị huỷ'
                            ];
                            echo $statusMap[$order['status']] ?? ucfirst($order['status']);
                            ?>
                        </span>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <?php foreach ($order['items'] as $item): ?>
                            <div class="p-4 hover:bg-gray-50 transition">
                                <div class="flex gap-4">
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
                                        <p class="text-sm text-gray-500 mt-1">Phân loại: Mặc định</p>
                                        <div class="flex justify-between items-center mt-2">
                                            <span class="text-sm text-gray-500">x<?= $item['quantity'] ?></span>
                                            <span
                                                class="text-xs text-gray-400 line-through"><?= number_format(($item['price_at_purchase'] * 1.2), 0, ',', '.') ?>đ</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <?php if ($order['status'] == 'completed'): ?>
                                    <!-- Review Section -->
                                    <div class="mt-4 pt-4 border-t border-gray-100">
                                        <?php if (!empty($item['is_reviewed']) && !empty($item['review'])): ?>
                                            <!-- Đã đánh giá - Hiển thị review -->
                                            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <i class="fa-solid fa-circle-check text-green-600"></i>
                                                    <span class="text-sm font-medium text-green-700">Đã đánh giá</span>
                                                    <div class="flex items-center ml-2">
                                                        <?php for ($i = 1; $i <= 5; $i++): ?>
                                                            <i class="fa-solid fa-star text-xs <?= $i <= ($item['review']['rating'] ?? 0) ? 'text-yellow-400' : 'text-gray-300' ?>"></i>
                                                        <?php endfor; ?>
                                                    </div>
                                                </div>
                                                <?php if (!empty($item['review']['comment'])): ?>
                                                    <p class="text-sm text-gray-600 italic">"<?= htmlspecialchars($item['review']['comment']) ?>"</p>
                                                <?php endif; ?>
                                            </div>
                                        <?php else: ?>
                                            <!-- Chưa đánh giá - Hiển thị form -->
                                            <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                                <div class="flex items-center gap-2 mb-3">
                                                    <i class="fa-solid fa-star text-orange-500"></i>
                                                    <span class="text-sm font-medium text-orange-700">Đánh giá sản phẩm này</span>
                                                </div>
                                                <form action="/reviews/store" method="POST">
                                                    <input type="hidden" name="product_id" value="<?= $item['product_id'] ?>">
                                                    <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                                                    
                                                    <!-- Rating Stars -->
                                                    <div class="mb-3">
                                                        <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Chọn số sao</label>
                                                        <div class="flex items-center gap-1" id="star-rating-<?= $item['product_id'] ?>">
                                                            <?php for ($i = 1; $i <= 5; $i++): ?>
                                                                <label class="cursor-pointer">
                                                                    <input type="radio" name="rating" value="<?= $i ?>" class="hidden" <?= $i == 5 ? 'checked' : '' ?>>
                                                                    <i class="fa-solid fa-star text-2xl star-icon <?= $i <= 5 ? 'text-yellow-400' : 'text-gray-300' ?> hover:text-yellow-400 transition"
                                                                       data-rating="<?= $i ?>"></i>
                                                                </label>
                                                            <?php endfor; ?>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- Comment -->
                                                    <div class="mb-3">
                                                        <textarea name="comment" rows="2"
                                                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."></textarea>
                                                    </div>
                                                    
                                                    <!-- Submit -->
                                                    <button type="submit"
                                                        class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2">
                                                        <i class="fa-solid fa-paper-plane"></i>
                                                        Gửi Đánh Giá
                                                    </button>
                                                </form>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Timeline / Status History (Optional Demo) -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
                    <div class="relative pl-4 border-l-2 border-gray-200 space-y-6">
                        <div class="relative">
                            <div
                                class="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100">
                            </div>
                            <div class="text-sm font-bold text-gray-900">Đơn hàng được tạo</div>
                            <div class="text-xs text-gray-500">
                                <?= TimeHelper::format($order['created_at'], 'H:i d/m/Y') ?>
                            </div>
                        </div>
                        <?php if ($order['status'] == 'cancelled'): ?>
                            <div class="relative">
                                <div
                                    class="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-100">
                                </div>
                                <div class="text-sm font-bold text-gray-900">Đã bị huỷ</div>
                                <div class="text-xs text-gray-500">Lý do: <?= $order['cancel_reason'] ?? 'Không có lý do' ?>
                                </div>
                            </div>
                        <?php elseif ($order['status'] == 'shipping'): ?>
                            <div class="relative">
                                <div
                                    class="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100">
                                </div>
                                <div class="text-sm font-bold text-gray-900">Đang giao hàng</div>
                                <div class="text-xs text-gray-500">Đơn hàng đang được vận chuyển đến bạn</div>
                            </div>
                        <?php endif; ?>
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
                <!-- Receiver Info -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 class="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">Địa chỉ nhận hàng</h3>
                    <div class="flex flex-col gap-2 text-sm">
                        <span
                            class="font-bold text-gray-900"><?= htmlspecialchars($buyer['full_name'] ?? 'Người dùng') ?></span>
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
                            <span>Giảm giá</span>
                            <span>0đ</span>
                        </div>
                        <div class="border-t border-gray-100 pt-2 flex justify-between items-center">
                            <span class="font-bold text-gray-900">Tổng thanh toán</span>
                            <span
                                class="font-bold text-xl text-red-600"><?= number_format($totalPayable, 0, ',', '.') ?>đ</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <a href="/profile/orders"
                        class="block w-full text-center py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition text-sm shadow-sm">
                        <i class="fa-solid fa-arrow-left mr-2"></i> Quay lại
                    </a>
                    <a href="/"
                        class="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition text-sm shadow-sm">
                        <i class="fa-solid fa-house mr-2"></i> Trở về trang chủ
                    </a>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>
