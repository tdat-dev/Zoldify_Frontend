<?php
use App\Helpers\SlugHelper;
use App\Helpers\ImageHelper;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-4">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" class="hover:text-[#2C67C8]">Trang chủ</a>
            <span>&gt;</span>
            <span class="text-gray-800">Giỏ hàng</span>
        </div>

        <h1 class="text-2xl font-medium text-gray-800 mb-6">Giỏ hàng của bạn</h1>

        <?php if (empty($products)): ?>
            <div class="bg-white rounded-sm shadow-sm p-10 text-center">
                <div class="mb-4">
                    <i class="fa-solid fa-cart-shopping text-6xl text-gray-200"></i>
                </div>
                <p class="text-gray-500 mb-6">Giỏ hàng của bạn còn trống</p>
                <a href="/products"
                    class="inline-block px-6 py-2 bg-[#EE4D2D] text-white rounded-sm hover:bg-[#d73211] transition-colors">
                    Mua ngay
                </a>
            </div>
        <?php else: ?>
            <form id="cart-form" action="/checkout" method="POST" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Cart Items -->
                <div class="lg:col-span-8 space-y-4">
                    <div class="bg-white rounded-sm shadow-sm overflow-hidden">
                        <!-- Header -->
                        <div
                            class="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm text-gray-500 font-medium items-center">
                            <div class="col-span-1 flex justify-center">
                                <input type="checkbox" id="check-all"
                                    class="w-4 h-4 text-[#EE4D2D] border-gray-300 rounded focus:ring-[#EE4D2D]">
                            </div>
                            <div class="col-span-5">Sản phẩm</div>
                            <div class="col-span-2 text-center">Đơn giá</div>
                            <div class="col-span-2 text-center">Số lượng</div>
                            <div class="col-span-2 text-center">Thành tiền</div>
                        </div>

                        <!-- Items -->
                        <?php
                        $grandTotal = 0;
                        foreach ($products as $item):
                            $itemTotal = $item['price'] * $item['cart_quantity'];
                            $grandTotal += $itemTotal;
                            ?>
                            <div class="cart-item grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                                data-id="<?= $item['product_id'] ?>" data-price="<?= $item['price'] ?>">
                                <div class="col-span-1 flex justify-center">
                                    <input type="checkbox" name="selected_products[]" value="<?= $item['product_id'] ?>"
                                        class="item-checkbox w-4 h-4 text-[#EE4D2D] border-gray-300 rounded focus:ring-[#EE4D2D]"
                                        checked>
                                </div>
                                <div class="col-span-5 flex gap-3">
                                    <div class="w-20 h-20 border rounded-sm overflow-hidden flex-shrink-0">
                                        <img src="<?= ImageHelper::url('uploads/' . ($item['image'] ?? '')) ?>"
                                            class="w-full h-full object-cover">
                                    </div>
                                    <div class="flex flex-col justify-center">
                                        <a href="<?= SlugHelper::productUrl($item['product_name'] ?? '', (int) ($item['seller_id'] ?? 0), (int) $item['product_id']) ?>"
                                            class="text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#2C67C8]">
                                            <?= htmlspecialchars($item['product_name'] ?? '') ?>
                                        </a>
                                        <span class="text-xs text-gray-400 mt-1">Còn <?= $item['stock'] ?? 0 ?> sản phẩm</span>
                                    </div>
                                </div>
                                <div class="col-span-2 text-center text-sm font-medium text-gray-600">
                                    <?= number_format($item['price'], 0, ',', '.') ?>đ
                                </div>
                                <div class="col-span-2 flex justify-center items-center">
                                    <div class="flex items-center border border-gray-300 rounded-sm">
                                        <button type="button"
                                            class="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 focus:outline-none"
                                            onclick="updateQuantity(<?= $item['product_id'] ?>, -1)">
                                            <i class="fa-solid fa-minus text-xs"></i>
                                        </button>
                                        <input type="text" value="<?= $item['cart_quantity'] ?>"
                                            class="w-10 h-8 text-center text-sm border-l border-r border-gray-300 focus:outline-none text-gray-800"
                                            readonly>
                                        <button type="button"
                                            class="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 focus:outline-none"
                                            onclick="updateQuantity(<?= $item['product_id'] ?>, 1)">
                                            <i class="fa-solid fa-plus text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-span-2 flex justify-center items-center gap-3">
                                    <span class="text-sm font-bold text-[#EE4D2D] item-total">
                                        <?= number_format($itemTotal, 0, ',', '.') ?>đ
                                    </span>
                                    <button type="button"
                                        class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        onclick="removeFromCart(<?= $item['product_id'] ?>)" title="Xóa khỏi giỏ hàng">
                                        <i class="fa-solid fa-trash-can text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Summary -->
                <div class="lg:col-span-4">
                    <div class="bg-white rounded-sm shadow-sm p-6 sticky top-4">
                        <h3 class="text-base font-medium text-gray-800 mb-4 pb-4 border-b">Tóm tắt đơn hàng</h3>

                        <div class="flex justify-between items-center mb-4">
                            <span class="text-gray-600">Tạm tính</span>
                            <span class="font-medium"
                                id="summary-subtotal"><?= number_format($grandTotal, 0, ',', '.') ?>đ</span>
                        </div>
                        <div class="flex justify-between items-center mb-6">
                            <span class="text-gray-600 text-sm">Phí vận chuyển</span>
                            <span class="text-sm text-gray-500 font-medium">Tính theo GHN</span>
                        </div>

                        <div class="flex justify-between items-center mb-6 pt-4 border-t">
                            <span class="text-base font-medium text-gray-800">Tổng cộng</span>
                            <span class="text-xl font-bold text-[#EE4D2D]"
                                id="summary-total"><?= number_format($grandTotal, 0, ',', '.') ?>đ</span>
                        </div>

                        <button type="submit" id="btn-buy"
                            class="w-full py-3 bg-[#EE4D2D] text-white font-bold rounded-sm hover:bg-[#d73211] transition-transform active:scale-[0.98] shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                            MUA HÀNG (<?= count($products) ?>)
                        </button>
                    </div>
                </div>
            </form>

            <script>
                const CART_STORAGE_KEY = 'zoldify_cart_selection';

                // =============================================
                // LocalStorage Functions - Lưu trạng thái checkbox
                // =============================================

                /**
                 * Lưu trạng thái checkbox vào localStorage
                 */
                function saveCheckboxState() {
                    const uncheckedIds = [];
                    document.querySelectorAll('.item-checkbox:not(:checked)').forEach(cb => {
                        uncheckedIds.push(cb.value);
                    });
                    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(uncheckedIds));
                }

                /**
                 * Khôi phục trạng thái checkbox từ localStorage
                 */
                function restoreCheckboxState() {
                    const saved = localStorage.getItem(CART_STORAGE_KEY);
                    if (!saved) return;

                    try {
                        const uncheckedIds = JSON.parse(saved);
                        document.querySelectorAll('.item-checkbox').forEach(cb => {
                            if (uncheckedIds.includes(cb.value)) {
                                cb.checked = false;
                            }
                        });
                        // Cập nhật check-all checkbox
                        updateCheckAllState();
                    } catch (e) {
                        console.error('Error restoring cart state:', e);
                    }
                }

                /**
                 * Xóa trạng thái đã lưu (khi checkout thành công)
                 */
                function clearCheckboxState() {
                    localStorage.removeItem(CART_STORAGE_KEY);
                }

                /**
                 * Cập nhật trạng thái của checkbox "Chọn tất cả"
                 */
                function updateCheckAllState() {
                    const allCheckboxes = document.querySelectorAll('.item-checkbox');
                    const checkedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
                    const checkAll = document.getElementById('check-all');

                    if (checkAll) {
                        checkAll.checked = allCheckboxes.length === checkedCheckboxes.length;
                    }
                }

                // =============================================
                // Cart Functions
                // =============================================

                /**
                 * Xóa sản phẩm khỏi giỏ hàng
                 */
                /**
                 * Xóa sản phẩm khỏi giỏ hàng
                 */
                async function removeFromCart(productId) {
                    const confirmed = await ZDialog.confirm('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?');
                    if (!confirmed) {
                        return;
                    }

                    const row = document.querySelector(`.cart-item[data-id="${productId}"]`);
                    if (!row) return;

                    fetch('/cart/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_id: productId, quantity: 0 })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                row.remove();
                                saveCheckboxState();
                                recalculateTotal();
                                checkEmptyCart();
                            }
                        })
                        .catch(err => console.error(err));
                }

                function updateQuantity(productId, change) {
                    const row = document.querySelector(`.cart-item[data-id="${productId}"]`);
                    if (!row) return;

                    const input = row.querySelector('input[type="text"]');
                    let currentQty = parseInt(input.value);
                    let newQty = currentQty + change;

                    if (newQty < 0) return;

                    fetch('/cart/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_id: productId, quantity: newQty })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                if (newQty <= 0) {
                                    row.remove();
                                    recalculateTotal();
                                    checkEmptyCart();
                                } else {
                                    input.value = newQty;
                                    const price = parseInt(row.dataset.price);
                                    const itemTotal = price * newQty;
                                    row.querySelector('.item-total').textContent = new Intl.NumberFormat('vi-VN').format(itemTotal) + 'đ';
                                    recalculateTotal();
                                }
                            }
                        })
                        .catch(err => console.error(err));
                }

                function recalculateTotal() {
                    let total = 0;
                    let count = 0;
                    const checkboxes = document.querySelectorAll('.item-checkbox:checked');

                    checkboxes.forEach(cb => {
                        const row = cb.closest('.cart-item');
                        const input = row.querySelector('input[type="text"]');
                        const qty = parseInt(input.value);
                        const price = parseInt(row.dataset.price);
                        total += qty * price;
                        count++;
                    });

                    const formattedTotal = new Intl.NumberFormat('vi-VN').format(total) + 'đ';
                    document.getElementById('summary-subtotal').textContent = formattedTotal;
                    document.getElementById('summary-total').textContent = formattedTotal;
                    document.getElementById('btn-buy').textContent = `MUA HÀNG (${count})`;

                    document.getElementById('btn-buy').disabled = count === 0;
                }

                function checkEmptyCart() {
                    const rows = document.querySelectorAll('.cart-item');
                    if (rows.length === 0) {
                        clearCheckboxState(); // Xóa state khi giỏ trống
                        location.reload();
                    }
                }

                // =============================================
                // Event Listeners
                // =============================================

                // Check-all checkbox
                document.getElementById('check-all').addEventListener('change', function (e) {
                    const isChecked = e.target.checked;
                    document.querySelectorAll('.item-checkbox').forEach(cb => {
                        cb.checked = isChecked;
                    });
                    saveCheckboxState(); // Lưu trạng thái
                    recalculateTotal();
                });

                // Individual checkboxes
                document.querySelectorAll('.item-checkbox').forEach(cb => {
                    cb.addEventListener('change', function () {
                        saveCheckboxState(); // Lưu trạng thái khi thay đổi
                        updateCheckAllState();
                        recalculateTotal();
                    });
                });

                // Xóa state khi submit form checkout
                document.getElementById('cart-form').addEventListener('submit', function () {
                    clearCheckboxState();
                });

                // =============================================
                // Initialization - Khởi tạo khi load trang
                // =============================================
                restoreCheckboxState(); // Khôi phục trạng thái từ localStorage
                recalculateTotal(); // Tính lại tổng dựa trên checkbox hiện tại
            </script>
        <?php endif; ?>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>
