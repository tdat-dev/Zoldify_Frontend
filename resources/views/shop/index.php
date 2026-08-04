<?php
use App\Helpers\SlugHelper;
use App\Helpers\ImageHelper;

include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-50 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[1200px] mx-auto px-4 pt-6">

        <!-- Shop Header -->
        <div class="bg-white p-6 rounded-sm shadow-sm mb-6 flex items-center gap-6">
            <div class="relative">
                <?php
                $avatarUrl = !empty($seller['avatar'])
                    ? ImageHelper::url('uploads/avatars/' . $seller['avatar'])
                    : 'https://ui-avatars.com/api/?name=' . urlencode($seller['full_name']) . '&background=random&size=128';
                ?>
                <img src="<?= htmlspecialchars($avatarUrl) ?>" alt="<?= htmlspecialchars($seller['full_name']) ?>"
                    class="w-20 h-20 rounded-full border-2 border-gray-100 object-cover">
                <div class="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <div class="flex-1">
                <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <?= htmlspecialchars($seller['full_name']) ?>
                    <?php if (($seller['role'] ?? '') === 'admin'): ?>
                        <span class="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Admin</span>
                    <?php endif; ?>
                </h1>
                <div class="flex gap-6 mt-2 text-sm text-gray-500">
                    <span class="flex items-center gap-1"><i class="fa-solid fa-box"></i> <?= count($products) ?> Sản
                        phẩm</span>
                    <span class="flex items-center gap-1"><i class="fa-solid fa-user-plus"></i> Đang theo dõi: <span
                            id="follower-count"><?= $followerCount ?? 0 ?></span></span>
                    <span class="flex items-center gap-1" title="Dựa trên <?= $stats['review_count'] ?? 0 ?> đánh giá">
                        <i class="fa-solid fa-star text-yellow-500"></i>
                        Đánh giá:
                        <?= ($stats['review_count'] ?? 0) > 0 ? number_format($stats['avg_rating'], 1) . '/5.0' : 'Chưa có đánh giá' ?>
                    </span>
                </div>
            </div>

            <div class="flex gap-3">
                <?php
                $currentUserId = $_SESSION['user']['id'] ?? null;
                if ($currentUserId != $seller['id']):
                    $followBtnClass = !empty($isFollowing)
                        ? 'bg-gray-100 text-gray-600 border-gray-300'
                        : 'border-[#2C67C8] text-[#2C67C8] hover:bg-blue-50';
                    ?>
                    <button id="btn-follow" data-shop-id="<?= $seller['id'] ?>"
                        class="px-6 py-2 border font-medium rounded-sm transition-colors w-[160px] <?= $followBtnClass ?>">
                        <?php if (!empty($isFollowing)): ?>
                            <i class="fa-solid fa-check mr-1"></i> Đang theo dõi
                        <?php else: ?>
                            <i class="fa-solid fa-plus mr-1"></i> Theo dõi
                        <?php endif; ?>
                    </button>
                    <a href="/chat?user_id=<?= $seller['id'] ?>"
                        class="px-6 py-2 bg-[#2C67C8] text-white font-medium rounded-sm hover:bg-blue-700 transition-colors shadow-sm">
                        <i class="fa-brands fa-rocketchat mr-1"></i> Chat
                    </a>
                <?php endif; ?>
            </div>
        </div>

        <!-- Product List -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <?php foreach ($products as $item): ?>
                <div
                    class="group bg-white border border-transparent hover:border-[#2C67C8] hover:shadow-md transition-all duration-200 rounded-sm overflow-hidden relative">
                    <?php if (($currentUserId ?? null) == $seller['id']): ?>
                        <div class="absolute top-2 right-2 z-10">
                            <?php if (($item['status'] ?? 'active') != 'cancelled'): ?>
                                <button onclick="cancelProduct(event, <?= $item['id'] ?>)"
                                    class="bg-white/90 text-red-500 w-8 h-8 rounded-full hover:bg-red-500 hover:text-white shadow-sm transition-all flex items-center justify-center border border-red-100"
                                    title="Huỷ bán">
                                    <i class="fa-solid fa-trash-can text-sm"></i>
                                </button>
                            <?php else: ?>
                                <span class="bg-gray-500/90 text-white text-[10px] px-2 py-1 rounded-full shadow-sm">Đã huỷ</span>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    <a href="<?= SlugHelper::productUrl($item['name'], (int) ($item['user_id'] ?? $seller['id']), (int) $item['id']) ?>"
                        class="block">
                        <!-- Image -->
                        <div class="relative pt-[100%] overflow-hidden bg-gray-100">
                            <img src="/uploads/<?= htmlspecialchars($item['image'] ?? '') ?>"
                                alt="<?= htmlspecialchars($item['name']) ?>"
                                class="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            
                            <?php if (!empty($item['is_freeship'])): ?>
                                <div class="absolute top-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-sm">
                                    Freeship
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($item['quantity'] <= 0): ?>
                                <div
                                    class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                                    Hết hàng</div>
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
                                <div class="text-[10px] text-gray-400">Còn
                                    <?= $item['quantity'] ?? 0 ?>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (empty($products)): ?>
            <div class="text-center text-gray-500 py-10">
                Shop này chưa đăng bán sản phẩm nào.
            </div>
        <?php endif; ?>

    </div>
</main>

<!-- Cancel Confirmation Modal -->
<div id="cancel-modal" class="fixed inset-0 hidden" style="z-index: 99999;" aria-labelledby="modal-title" role="dialog"
    aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
            onclick="closeCancelModal()"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
            class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                    <div
                        class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
                    </div>
                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                            Xoá sản phẩm
                        </h3>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500">
                                Bạn có chắc chắn muốn xoá sản phẩm này không? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" id="confirm-cancel-btn"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Xoá ngay
                </button>
                <button type="button" onclick="closeCancelModal()"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Thoát
                </button>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/../partials/footer.php'; ?>

<script>
    // Follow button - only attach if element exists
    const btnFollow = document.getElementById('btn-follow');
    if (btnFollow) {
        btnFollow.addEventListener('click', function (e) {
            e.preventDefault();
            const btn = this;
            const shopId = btn.getAttribute('data-shop-id');
            const countSpan = document.getElementById('follower-count');

            // Disable button while processing
            btn.disabled = true;
            btn.classList.add('opacity-50');

            fetch('/shop/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ shop_id: shopId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update button UI
                        if (data.status === 'followed') {
                            btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Đang theo dõi';
                            btn.classList.remove('border-[#2C67C8]', 'text-[#2C67C8]', 'hover:bg-blue-50');
                            btn.classList.add('bg-gray-100', 'text-gray-600', 'border-gray-300');
                        } else {
                            btn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Theo dõi';
                            btn.classList.add('border-[#2C67C8]', 'text-[#2C67C8]', 'hover:bg-blue-50');
                            btn.classList.remove('bg-gray-100', 'text-gray-600', 'border-gray-300');
                        }
                        // Update count
                        if (countSpan) {
                            countSpan.innerText = data.new_count;
                        }
                    } else {
                        alert(data.message || 'Có lỗi xảy ra');
                        if (data.message && data.message.includes('đăng nhập')) {
                            window.location.href = '/login';
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Có lỗi xảy ra, vui lòng thử lại');
                })
                .finally(() => {
                    // Re-enable button
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                });
        });
    }
</script>
<script>
    let currentProductId = null;

    function cancelProduct(event, productId) {
        event.preventDefault(); // Prevent link click
        event.stopPropagation();

        currentProductId = productId;
        const modal = document.getElementById('cancel-modal');
        modal.classList.remove('hidden');
    }

    function closeCancelModal() {
        document.getElementById('cancel-modal').classList.add('hidden');
        currentProductId = null;
    }

    document.getElementById('confirm-cancel-btn').addEventListener('click', function () {
        if (!currentProductId) return;

        // Disable button to prevent double click
        this.disabled = true;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

        fetch(`/products/${currentProductId}/cancel-sale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: currentProductId })
        })
            .then(response => response.json())
            .then(data => {
                closeCancelModal();
                // Reset button
                const btn = document.getElementById('confirm-cancel-btn');
                btn.disabled = false;
                btn.innerText = 'Huỷ bán';

                if (data.success) {
                    // alert(data.message); // removed alert to be cleaner or maybe use a toast later
                    location.reload();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                closeCancelModal();
                const btn = document.getElementById('confirm-cancel-btn');
                btn.disabled = false;
                btn.innerText = 'Huỷ bán';
            });
    });
</script>