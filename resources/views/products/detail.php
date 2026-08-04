<?php
use App\Helpers\SlugHelper;
use App\Helpers\ImageHelper;
use App\Models\Product;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-4 space-y-6">

        <!-- Breadcrumb -->
        <div class="text-sm text-gray-500">
            <a href="/" class="hover:text-[#2C67C8]">Trang chủ</a>
            <span class="mx-2">></span>
            <a href="/products" class="hover:text-[#2C67C8]">Sản phẩm</a>
            <span class="mx-2">></span>
            <span class="text-gray-800 truncate"><?= htmlspecialchars($product['name']) ?></span>
        </div>

        <!-- Main Product Section -->
        <div class="bg-white rounded-sm shadow-sm p-4">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8">

                <!-- Left: Image Gallery -->
                <div class="md:col-span-5">
                    <?php
                    // Lấy ảnh chính (ảnh đầu tiên hoặc ảnh có is_primary = 1)
                    $mainImagePath = '';
                    if (!empty($productImages)) {
                        foreach ($productImages as $img) {
                            if (!empty($img['is_primary'])) {
                                $mainImagePath = $img['image_path'];
                                break;
                            }
                        }
                        if (empty($mainImagePath)) {
                            $mainImagePath = $productImages[0]['image_path'];
                        }
                    } else {
                        $mainImagePath = $product['image'] ?? '';
                    }
                    ?>
                    <div
                        class="relative w-full aspect-square bg-gray-100 rounded-sm overflow-hidden border border-gray-200">
                        <img id="main-product-image" src="<?= ImageHelper::url('uploads/' . $mainImagePath) ?>"
                            alt="<?= htmlspecialchars($product['name'] ?? '') ?>"
                            class="w-full h-full object-contain cursor-zoom-in" onclick="openLightbox(0)">
                    </div>
                    <!-- Thumbnails - Hiển thị đúng số ảnh thực tế -->
                    <?php if (!empty($productImages) && count($productImages) > 0): ?>
                        <div class="flex gap-2 mt-4 overflow-x-auto">
                            <?php foreach ($productImages as $index => $image): ?>
                                <div class="product-thumbnail w-20 h-20 border border-gray-200 hover:border-[#2C67C8] cursor-pointer rounded-sm overflow-hidden flex-shrink-0 <?= $index === 0 ? 'border-[#2C67C8]' : '' ?>"
                                    data-image="<?= ImageHelper::url('uploads/' . $image['image_path']) ?>"
                                    data-index="<?= $index ?>">
                                    <img src="<?= ImageHelper::url('uploads/' . $image['image_path']) ?>"
                                        class="w-full h-full object-cover">
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Lightbox Modal -->
                <div id="image-lightbox"
                    class="fixed inset-0 z-50 hidden bg-black/90 flex items-center justify-center p-8">
                    <!-- Nút đóng -->
                    <button onclick="closeLightbox()"
                        class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition">&times;</button>

                    <!-- Nút Previous -->
                    <button onclick="prevImage()"
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition">
                        <i class="fa-solid fa-chevron-left text-xl"></i>
                    </button>

                    <!-- Ảnh chính trong lightbox - Giới hạn kích thước vừa màn hình -->
                    <img id="lightbox-image" src="" alt=""
                        class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        style="max-width: min(800px, 80vw); max-height: 75vh;">

                    <!-- Nút Next -->
                    <button onclick="nextImage()"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition">
                        <i class="fa-solid fa-chevron-right text-xl"></i>
                    </button>

                    <!-- Chỉ số ảnh -->
                    <div id="lightbox-counter"
                        class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    </div>
                </div>

                <!-- Right: Product Info -->
                <div class="md:col-span-7 space-y-6">
                    <h1 class="text-2xl font-medium text-gray-800 leading-snug">
                        <?= htmlspecialchars($product['name']) ?>
                    </h1>

                    <!-- Price -->
                    <div class="bg-gray-50 p-4 rounded-sm">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl font-bold text-[#EE4D2D]">
                                <?= number_format($product['price'], 0, ',', '.') ?>đ
                            </span>
                            <?php if (!empty($product['is_freeship'])): ?>
                                <span
                                    class="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                                    <i class="fa-solid fa-truck-fast"></i> Freeship
                                </span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Details -->
                    <div class="space-y-4 text-sm text-gray-600">
                        <div class="flex items-center">
                            <span class="w-32 text-gray-500">Vận chuyển:</span>
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-truck-fast text-[#2C67C8]"></i>
                                <span>Từ <?= htmlspecialchars($seller['address'] ?? 'Hồ Chí Minh') ?></span>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <span class="w-32 text-gray-500">Tình trạng:</span>
                            <?php
                            $conditions = Product::getConditions();
                            $conditionKey = $product['product_condition'] ?? 'good';
                            $conditionInfo = $conditions[$conditionKey] ?? ['label' => 'Không xác định', 'color_text' => 'text-gray-500'];
                            ?>
                            <span class="<?= $conditionInfo['color_text'] ?? '' ?> font-medium">
                                <?= htmlspecialchars($conditionInfo['label']) ?>
                            </span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-32 text-gray-500">Số lượng:</span>
                            <div class="flex items-center border border-gray-300 rounded-sm">
                                <button type="button" id="btn-decrease"
                                    class="px-3 py-1 border-r border-gray-300 hover:bg-gray-50 min-w-[32px]">-</button>
                                <input type="number" id="input-quantity" value="1" min="1"
                                    max="<?= $product['quantity'] ?>"
                                    class="w-14 text-center outline-none bg-white font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                                <button type="button" id="btn-increase"
                                    class="px-3 py-1 border-l border-gray-300 hover:bg-gray-50 min-w-[32px]">+</button>
                            </div>
                            <span class="ml-3 text-gray-400"><?= $product['quantity'] ?> sản phẩm có sẵn</span>
                            <input type="hidden" id="max-stock" value="<?= $product['quantity'] ?>">
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="flex gap-4 pt-4">
                        <?php
                        $currentUserId = $_SESSION['user']['id'] ?? null;
                        $isOwner = $currentUserId && $currentUserId == $product['user_id'];
                        ?>

                        <?php if ($isOwner): ?>
                            <div
                                class="w-full px-8 py-3 bg-gray-100 text-gray-500 font-medium rounded-sm border border-gray-200 text-center select-none">
                                <i class="fa-solid fa-user-tag mr-2"></i>Bạn là người bán sản phẩm này
                            </div>
                        <?php elseif ($product['quantity'] > 0 && $product['status'] === 'active'): ?>
                            <form action="/cart/add" method="POST" class="flex gap-4 w-full">
                                <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                                <input type="hidden" name="quantity" value="1" id="input-quantity-submit">

                                <button type="submit" name="action" value="add"
                                    class="flex-1 px-6 py-3 bg-[#2C67C8] text-white font-medium rounded-sm hover:bg-[#F97316] transition-colors flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ hàng
                                </button>
                                <button type="submit" name="action" value="buy"
                                    class="flex-1 px-8 py-3 bg-[#2C67C8] text-white font-medium rounded-sm hover:bg-[#F97316] transition-colors shadow-sm text-center">
                                    Mua ngay
                                </button>
                            </form>
                        <?php else: ?>
                            <button disabled
                                class="w-full px-8 py-3 bg-gray-300 text-gray-500 font-medium rounded-sm cursor-not-allowed">
                                Sản phẩm đã hết hàng
                            </button>
                        <?php endif; ?>
                    </div>

                    <!-- Policies -->
                    <div class="border-t pt-6 mt-6 grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-[#2C67C8] text-base"></i>
                            <span>Cam kết nhận hàng hoặc hoàn tiền</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-globe text-[#2C67C8] text-base"></i>
                            <span>Nền tảng mua bán đồ cũ vì môi trường</span>
                        </div>

                        <div class="col-span-2 pt-2">
                            <button onclick="document.getElementById('reportModal').classList.remove('hidden')"
                                class="flex items-center gap-4 hover:text-red-500 transition-colors">
                                <i class="fa-solid fa-flag text-base"></i>
                                <span>Báo cáo sản phẩm</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- Seller Info -->
        <div class="bg-white rounded-sm shadow-sm p-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="relative">
                    <?php
                    $sellerAvatarUrl = !empty($seller['avatar'])
                        ? ImageHelper::url('uploads/avatars/' . $seller['avatar'])
                        : 'https://ui-avatars.com/api/?name=' . urlencode($seller['full_name']) . '&background=random&size=128';
                    ?>
                    <img src="<?= htmlspecialchars($sellerAvatarUrl) ?>"
                        alt="<?= htmlspecialchars($seller['full_name']) ?>"
                        class="w-16 h-16 rounded-full border border-gray-200 object-cover">
                    <div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                    </div>
                </div>
                <div class="flex-1">
                    <h3 class="font-medium text-lg text-gray-800 flex items-center gap-2">
                        <?= htmlspecialchars($seller['full_name']) ?>
                        <i class="fa-solid fa-circle-check text-blue-500 text-sm" title="Đã xác minh"></i>
                    </h3>
                    <div class="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span><i class="fa-solid fa-box mr-1"></i> <?= $activeProductCount ?? 0 ?> sản phẩm</span>
                        <span>
                            <i class="fa-solid fa-star mr-1 text-yellow-500"></i>
                            <?= ($stats['review_count'] ?? 0) > 0 ? number_format($stats['avg_rating'], 1) . ' (' . $stats['review_count'] . ' đánh giá)' : 'Chưa có đánh giá' ?>
                        </span>
                    </div>
                </div>
                <div class="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <?php if (($currentUserId ?? ($_SESSION['user']['id'] ?? null)) != $seller['id']): ?>
                        <a href="/chat?user_id=<?= $seller['id'] ?>"
                            class="px-4 py-2 border border-[#2C67C8] text-[#2C67C8] rounded-sm hover:bg-blue-50 font-medium text-sm flex items-center gap-1">
                            <i class="fa-regular fa-comment-dots"></i> Chat ngay
                        </a>
                    <?php endif; ?>
                    <a href="/shop?id=<?= $seller['id'] ?>"
                        class="px-4 py-2 bg-gray-100 text-gray-600 rounded-sm hover:bg-gray-200 font-medium text-sm flex items-center gap-1">
                        <i class="fa-solid fa-store"></i> Xem Shop
                    </a>
                </div>
            </div>
        </div>

        <!-- Product Description -->
        <div class="bg-white rounded-sm shadow-sm p-6">
            <h2 class="text-lg font-medium text-gray-800 bg-gray-50 p-3 mb-4 rounded-sm">Mô tả sản phẩm</h2>
            <div class="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                <?= htmlspecialchars($product['description'] ?? '') ?>
            </div>
        </div>

        <!-- Related Products -->
        <div class="bg-white rounded-sm shadow-sm p-5">
            <h2 class="text-lg font-medium text-gray-800 mb-6 uppercase">Sản phẩm tương tự</h2>
            <?php if (empty($relatedProducts)): ?>
                <p class="text-gray-500 text-center py-4">Không có sản phẩm tương tự nào.</p>
            <?php else: ?>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <?php foreach ($relatedProducts as $item): ?>
                        <div
                            class="group bg-white border border-transparent hover:border-[#2C67C8] hover:shadow-md transition-all duration-200 rounded-sm overflow-hidden relative">
                            <a href="<?= SlugHelper::productUrl($item['name'], (int) ($item['user_id'] ?? 0), (int) $item['id']) ?>"
                                class="block">
                                <!-- Image -->
                                <div class="relative pt-[100%] overflow-hidden bg-gray-100">
                                    <img src="<?= ImageHelper::url('uploads/' . ($item['image'] ?? '')) ?>"
                                        alt="<?= htmlspecialchars($item['name'] ?? '') ?>"
                                        class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">

                                    <!-- Badges - Freeship -->
                                    <?php if (!empty($item['is_freeship'])): ?>
                                        <div
                                            class="absolute top-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-sm">
                                            Freeship
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <!-- Info -->
                                <div class="p-2 space-y-1">
                                    <h3
                                        class="text-xs text-gray-700 font-normal line-clamp-2 leading-tight h-8 group-hover:text-[#2C67C8] transition-colors">
                                        <?= htmlspecialchars($item['name']) ?>
                                    </h3>

                                    <div class="flex items-center justify-between pt-1">
                                        <div class="text-[#EE4D2D] font-medium text-sm">
                                            <?= number_format($item['price'], 0, ',', '.') ?><span
                                                class="text-xs align-top">₫</span>
                                        </div>
                                        <div class="text-[10px] text-gray-400">Còn <?= $item['quantity'] ?? 0 ?></div>
                                    </div>

                                    <!-- Location - Tạm ẩn vì chưa có dữ liệu địa chỉ trong related products -->
                                    <!-- TODO: Thêm seller location vào related products query -->
                                    <div class="flex items-center justify-between pt-2">
                                        <span class="text-[10px] text-gray-400 font-light truncate w-full">&nbsp;</span>
                                    </div>
                                </div>
                            </a>

                            <!-- Hover Action (Tìm kiếm tương tự) -->
                            <div
                                class="absolute bottom-0 left-0 w-full bg-[#2C67C8] text-white text-center text-xs py-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                Tìm sản phẩm tương tự
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

    </div>
</main>

<!-- Report Modal -->
<div id="reportModal" class="fixed inset-0 z-50 hidden bg-black/50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h3 class="font-medium text-gray-800">Báo cáo sản phẩm</h3>
            <button onclick="document.getElementById('reportModal').classList.add('hidden')"
                class="text-gray-400 hover:text-gray-600">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
        </div>
        <form action="/report/product" method="POST" class="p-6">
            <input type="hidden" name="product_id" value="<?= $product['id'] ?>">

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Lý do báo cáo</label>
                    <select name="reason" required
                        class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border">
                        <option value="">-- Chọn lý do --</option>
                        <option value="Hàng giả/Hàng nhái">Hàng giả/Hàng nhái</option>
                        <option value="Sản phẩm bị cấm">Sản phẩm bị cấm</option>
                        <option value="Lừa đảo">Lừa đảo</option>
                        <option value="Spam/Trùng lặp">Spam/Trùng lặp</option>
                        <option value="Sai danh mục">Sai danh mục</option>
                        <option value="Hình ảnh phản cảm">Hình ảnh phản cảm</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                    <textarea name="description" rows="4"
                        class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                        placeholder="Vui lòng cung cấp thêm thông tin..."></textarea>
                </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
                <button type="button" onclick="document.getElementById('reportModal').classList.add('hidden')"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50">
                    Hủy bỏ
                </button>
                <button type="submit"
                    class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">
                    Gửi báo cáo
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    const isLoggedIn = <?= isset($_SESSION['user']['id']) ? 'true' : 'false' ?>;

    document.addEventListener('DOMContentLoaded', function () {
        // Handle report messages
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'report_sent') {
            alert('Cảm ơn bạn! Báo cáo vi phạm đã được gửi và sẽ được xem xét.');
            const newUrl = window.location.pathname;
            window.history.replaceState(null, null, newUrl);
        } else if (urlParams.get('error') === 'missing_data') {
            alert('Vui lòng chọn lý do báo cáo.');
        } else if (urlParams.get('error') === 'server_error') {
            alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        }

        const btnDecrease = document.getElementById('btn-decrease');
        const btnIncrease = document.getElementById('btn-increase');
        const inputQuantity = document.getElementById('input-quantity');
        const maxStock = parseInt(document.getElementById('max-stock')?.value) || 0;
        const inputSubmit = document.getElementById('input-quantity-submit');
        const btnSubmitCart = document.querySelector('button[value="add"]');
        const btnSubmitBuy = document.querySelector('button[value="buy"]');

        const formCart = document.querySelector('form[action="/cart/add"]');

        if (formCart) {
            formCart.addEventListener('submit', function (e) {
                if (!isLoggedIn) {
                    e.preventDefault();
                    window.location.href = '/login';
                }
            });
        }

        function updateQuantity(val) {
            let newVal = parseInt(val);
            if (isNaN(newVal) || newVal < 1) newVal = 1;
            if (newVal > maxStock) newVal = maxStock;

            if (inputQuantity) inputQuantity.value = newVal;
            if (inputSubmit) inputSubmit.value = newVal; // Update hidden input for form

            // Validate functionality if stock is somehow 0 (though covered by PHP)
            if (maxStock <= 0) {
                if (inputQuantity) inputQuantity.value = 0;
                if (btnSubmitCart) btnSubmitCart.disabled = true;
                if (btnSubmitBuy) btnSubmitBuy.disabled = true;
            }
        }

        if (btnDecrease) {
            btnDecrease.addEventListener('click', function () {
                if (inputQuantity) updateQuantity(parseInt(inputQuantity.value) - 1);
            });
        }

        if (btnIncrease) {
            btnIncrease.addEventListener('click', function () {
                if (inputQuantity) updateQuantity(parseInt(inputQuantity.value) + 1);
            });
        }

        if (inputQuantity) {
            inputQuantity.addEventListener('change', function () {
                updateQuantity(this.value);
            });
            // Initial check
            updateQuantity(inputQuantity.value);
        }

        // Xử lý click thumbnail để đổi ảnh chính
        const thumbnails = document.querySelectorAll('.product-thumbnail');
        const mainImage = document.getElementById('main-product-image');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function () {
                // Đổi ảnh chính
                const newSrc = this.getAttribute('data-image');
                if (mainImage && newSrc) {
                    mainImage.src = newSrc;
                }

                // Cập nhật currentIndex cho lightbox
                currentImageIndex = parseInt(this.getAttribute('data-index')) || 0;

                // Highlight thumbnail được chọn
                thumbnails.forEach(t => t.classList.remove('border-[#2C67C8]'));
                this.classList.add('border-[#2C67C8]');
            });
        });
    });

    // ===== LIGHTBOX FUNCTIONS =====
    const productImages = <?= json_encode(array_map(function ($img) {
        return \App\Helpers\ImageHelper::url('uploads/' . $img['image_path']);
    }, $productImages ?? [])) ?>;

    let currentImageIndex = 0;
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCounter = document.getElementById('lightbox-counter');

    function openLightbox(index = 0) {
        if (productImages.length === 0) return;

        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Ngăn scroll trang
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = ''; // Cho phép scroll lại
    }

    function updateLightboxImage() {
        if (productImages[currentImageIndex]) {
            lightboxImage.src = productImages[currentImageIndex];
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
        }
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % productImages.length;
        updateLightboxImage();
    }

    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
        updateLightboxImage();
    }

    // Đóng lightbox khi click vào nền đen
    lightbox?.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Đóng lightbox khi nhấn ESC, chuyển ảnh bằng phím mũi tên
    document.addEventListener('keydown', function (e) {
        if (lightbox?.classList.contains('hidden')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
</script>

<?php include __DIR__ . '/../partials/footer.php'; ?>