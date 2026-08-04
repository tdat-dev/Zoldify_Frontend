<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';

// Calculate totals from passed products
$grandTotal = 0;
if (!empty($products)) {
    foreach ($products as $item) {
        if (isset($item['cart_quantity']) && isset($item['price'])) {
            // Ensure both values are numbers
            $price = is_numeric($item['price']) ? (float) $item['price'] : 0;
            $qty = is_numeric($item['cart_quantity']) ? (int) $item['cart_quantity'] : 0;
            $grandTotal += $price * $qty;
        }
    }
}
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-4">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" class="hover:text-[#2C67C8]">Trang chủ</a>
            <span>&gt;</span>
            <a href="/cart" class="hover:text-[#2C67C8]">Giỏ hàng</a>
            <span>&gt;</span>
            <span class="text-gray-800">Thanh toán</span>
        </div>

        <h1 class="text-2xl font-medium text-gray-800 mb-6">Thanh toán</h1>

        <!-- Form submit đến confirm để xử lý trừ kho -->
        <form action="/checkout/confirm" method="POST" class="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <!-- Truyền lại các ID sản phẩm đã chọn để bước confirm biết cần mua gì -->
            <?php if (!empty($selected_ids)): ?>
                <?php foreach ($selected_ids as $id): ?>
                    <input type="hidden" name="selected_products[]" value="<?= htmlspecialchars($id) ?>">
                <?php endforeach; ?>
            <?php endif; ?>

            <!-- Order Details -->
            <div class="lg:col-span-8 space-y-4">
                <!-- Address Section -->
                <div class="bg-white rounded-sm shadow-sm p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-base font-medium text-[#EE4D2D] flex items-center gap-2">
                            <i class="fa-solid fa-location-dot"></i> Địa chỉ nhận hàng
                        </h3>
                        <a href="/addresses" class="text-blue-600 text-sm hover:underline">Quản lý địa chỉ</a>
                    </div>
                    
                    <?php if (!empty($addresses)): ?>
                        <!-- Address Selection -->
                        <div class="space-y-3" id="address-list">
                            <?php foreach ($addresses as $index => $addr): ?>
                                <label class="address-option flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-[#EE4D2D] transition-colors <?= $addr['is_default'] ? 'border-[#EE4D2D] bg-orange-50' : '' ?>">
                                    <input type="radio" name="shipping_address_id" value="<?= $addr['id'] ?>" 
                                           class="mt-1 text-[#EE4D2D] focus:ring-[#EE4D2D]"
                                           <?= $addr['is_default'] ? 'checked' : '' ?>>
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="font-medium text-gray-800"><?= htmlspecialchars($addr['recipient_name']) ?></span>
                                            <span class="text-gray-400">|</span>
                                            <span class="text-gray-600"><?= htmlspecialchars($addr['phone_number']) ?></span>
                                            <?php if ($addr['is_default']): ?>
                                                <span class="px-2 py-0.5 text-xs bg-[#EE4D2D] text-white rounded">Mặc định</span>
                                            <?php endif; ?>
                                        </div>
                                        <div class="text-xs text-gray-500 mb-1"><?= htmlspecialchars($addr['label']) ?></div>
                                        <div class="text-sm text-gray-600"><?= htmlspecialchars($addr['full_address'] ?: $addr['street_address']) ?></div>
                                    </div>
                                </label>
                            <?php endforeach; ?>
                        </div>
                        
                        <!-- Add new address link -->
                        <div class="mt-3 pt-3 border-t">
                            <a href="/addresses/create?redirect_to=<?= urlencode('/checkout') ?>" 
                               class="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                <i class="fa-solid fa-plus"></i> Thêm địa chỉ mới
                            </a>
                        </div>
                    <?php else: ?>
                        <!-- No addresses -->
                        <div class="text-center py-6">
                            <div class="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-location-dot text-2xl text-gray-400"></i>
                            </div>
                            <p class="text-red-500 mb-3">Bạn chưa có địa chỉ nhận hàng.</p>
                            <a href="/addresses/create?redirect_to=<?= urlencode('/checkout') ?>" 
                               class="inline-flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#d73211] transition-colors">
                                <i class="fa-solid fa-plus"></i> Thêm địa chỉ ngay
                            </a>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Products -->
                <div class="bg-white rounded-sm shadow-sm overflow-hidden">
                    <div class="p-4 border-b bg-gray-50 text-sm font-medium text-gray-500">
                        Sản phẩm đã chọn
                    </div>
                    <?php if (!empty($products)): ?>
                        <?php foreach ($products as $item):
                            $price = is_numeric($item['price']) ? (float) $item['price'] : 0;
                            $qty = is_numeric($item['cart_quantity']) ? (int) $item['cart_quantity'] : 0;
                            $itemTotal = $price * $qty;
                            ?>
                            <div class="flex gap-4 p-4 border-b last:border-0 items-center item-row">
                                <div class="w-16 h-16 border rounded-sm overflow-hidden flex-shrink-0">
                                    <img src="/uploads/<?= htmlspecialchars($item['image']) ?>"
                                        class="w-full h-full object-cover">
                                </div>
                                <div class="flex-1">
                                    <h4 class="text-sm font-medium text-gray-800 line-clamp-2">
                                        <?= htmlspecialchars($item['name']) ?>
                                    </h4>
                                    <span class="text-xs text-gray-500">Loại: Tiêu chuẩn</span>
                                    <div class="text-xs text-gray-400 mt-1">Kho: <?= $item['quantity'] ?></div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span
                                        class="text-sm text-gray-600 hidden sm:block"><?= number_format($item['price'], 0, ',', '.') ?>đ</span>
                                    <div class="flex items-center border border-gray-300 rounded-sm">
                                        <button type="button"
                                            class="btn-decrease px-2 py-1 hover:bg-gray-100 border-r border-gray-300 min-w-[24px]">-</button>
                                        <input type="number" name="quantities[<?= $item['id'] ?>]"
                                            value="<?= $item['cart_quantity'] ?>"
                                            class="w-12 text-center text-sm outline-none input-quantity [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            data-price="<?= $item['price'] ?>" data-max="<?= $item['quantity'] ?>" readonly>
                                        <button type="button"
                                            class="btn-increase px-2 py-1 hover:bg-gray-100 border-l border-gray-300 min-w-[24px]">+</button>
                                    </div>
                                </div>
                                <div class="text-sm font-bold text-[#EE4D2D] w-32 text-right item-total">
                                    <?= number_format($itemTotal, 0, ',', '.') ?>đ
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="p-4 text-center text-gray-500">Không có sản phẩm nào được chọn.</div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Summary & Payment -->
            <div class="lg:col-span-4 space-y-4">
                <div class="bg-white rounded-sm shadow-sm p-6 sticky top-4">
                    <h3 class="text-base font-medium text-gray-800 mb-4 pb-4 border-b">Chi tiết thanh toán</h3>

                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600">Tổng tiền hàng</span>
                        <span class="font-medium"
                            id="grand-total"><?= number_format($grandTotal, 0, ',', '.') ?>đ</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600">Phí vận chuyển</span>
                        <span class="font-medium text-gray-500">Tính theo GHN</span>
                    </div>

                    <div class="flex justify-between items-center mb-6 pt-4 border-t">
                        <span class="text-base font-medium text-gray-800">Tổng thanh toán (tạm tính)</span>
                        <span class="text-xl font-bold text-[#EE4D2D]"
                            id="final-total"><?= number_format($grandTotal, 0, ',', '.') ?>đ</span>
                    </div>

                    <h4 class="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</h4>
                    <div class="space-y-3">
                        <!-- PayOS (Recommended) -->
                        <label
                            class="payment-method-option flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-[#667eea] transition-colors relative overflow-hidden">
                            <input type="radio" name="payment_method" value="payos" checked
                                class="text-[#667eea] focus:ring-[#667eea] w-4 h-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-medium">Chuyển khoản QR</span>
                                    <span
                                        class="text-[10px] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-2 py-0.5 rounded-full font-medium">Khuyến
                                        nghị</span>
                                </div>
                                <span class="text-xs text-gray-500">Quét mã VietQR bằng app ngân hàng</span>
                            </div>
                            <div class="flex items-center gap-1 text-[#667eea]">
                                <i class="fas fa-qrcode text-lg"></i>
                            </div>
                        </label>

                        <!-- COD -->
                        <label
                            class="payment-method-option flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-[#EE4D2D] transition-colors">
                            <input type="radio" name="payment_method" value="cod"
                                class="text-[#EE4D2D] focus:ring-[#EE4D2D] w-4 h-4">
                            <div class="flex-1">
                                <span class="text-sm font-medium">Thanh toán khi nhận hàng (COD)</span>
                                <span class="text-xs text-gray-500 block">Trả tiền mặt khi nhận được hàng</span>
                            </div>
                            <div class="text-gray-400">
                                <i class="fas fa-truck text-lg"></i>
                            </div>
                        </label>
                    </div>

                    <style>
                        .payment-method-option:has(input:checked) {
                            border-color: #667eea;
                            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
                        }

                        .payment-method-option:has(input[value="cod"]:checked) {
                            border-color: #EE4D2D;
                            background: #FFF5F1;
                        }
                    </style>

                    <button type="submit" id="btn-order"
                        class="w-full mt-6 py-3 bg-[#EE4D2D] text-white font-bold rounded-sm hover:bg-[#d73211] transition-transform active:scale-[0.98] shadow-md">
                        ĐẶT HÀNG
                    </button>

                    <div class="mt-4 text-center">
                        <a href="/cart" class="text-sm text-gray-500 hover:text-[#EE4D2D]">Quay lại giỏ hàng</a>
                    </div>
                </div>
            </div>
        </form>
    </div>
</main>

<script>
    // Toast Notification logic - Global scope
    const showToast = (message, type = 'error') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-24 right-5 z-50 px-6 py-3 rounded shadow-lg text-white transform transition-all duration-300 translate-x-full opacity-0 flex items-center gap-2 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`;

        const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
        toast.innerHTML = `${icon} <span>${message}</span>`;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    };

    document.addEventListener('DOMContentLoaded', function () {
        <?php if (!empty($errors)): ?>
            <?php foreach ($errors as $error): ?>
                showToast('<?= addslashes($error) ?>', 'error');
            <?php endforeach; ?>
        <?php endif; ?>

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
        };

        const updateTotals = () => {
            let grandTotal = 0;

            document.querySelectorAll('.item-row').forEach(row => {
                const input = row.querySelector('.input-quantity');
                const price = parseInt(input.dataset.price);
                const qty = parseInt(input.value) || 0;
                const itemTotalEl = row.querySelector('.item-total');

                const itemTotal = price * qty;
                grandTotal += itemTotal;

                itemTotalEl.textContent = formatCurrency(itemTotal);
            });

            const grandTotalEl = document.getElementById('grand-total');
            const finalTotalEl = document.getElementById('final-total');

            if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
            if (finalTotalEl) finalTotalEl.textContent = formatCurrency(grandTotal);

            const btnSubmit = document.getElementById('btn-order');
            if (btnSubmit) {
                if (grandTotal === 0) {
                    btnSubmit.disabled = true;
                    btnSubmit.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    btnSubmit.disabled = false;
                    btnSubmit.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        };

        document.querySelectorAll('.btn-decrease').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.nextElementSibling;
                let val = parseInt(input.value) || 0;
                if (val > 0) {
                    val--;
                    input.value = val;
                    updateTotals();
                }
            });
        });

        document.querySelectorAll('.btn-increase').forEach(btn => {
            btn.addEventListener('click', function () {
                const input = this.previousElementSibling;
                let val = parseInt(input.value) || 0;
                const max = parseInt(input.dataset.max) || 999;

                if (val < max) {
                    val++;
                    input.value = val;
                    updateTotals();
                } else {
                    showToast(`Số lượng tối đa cho sản phẩm này là ${max} sản phẩm`, 'error');
                }
            });
        });

        // Initial check
        updateTotals();
    });
</script>

<?php include __DIR__ . '/../partials/footer.php'; ?>
