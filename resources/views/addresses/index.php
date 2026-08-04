<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10">
    <div class="max-w-[800px] mx-auto px-4 pt-4">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a href="/" class="hover:text-[#2C67C8]">Trang chủ</a>
            <span>&gt;</span>
            <a href="/profile" class="hover:text-[#2C67C8]">Tài khoản</a>
            <span>&gt;</span>
            <span class="text-gray-800">Địa chỉ giao hàng</span>
        </div>

        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-medium text-gray-800">Địa chỉ giao hàng</h1>
            <a href="/addresses/create"
                class="inline-flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#d73211] transition-colors">
                <i class="fa-solid fa-plus"></i>
                <span>Thêm địa chỉ</span>
            </a>
        </div>

        <!-- Flash Messages -->
        <?php if (!empty($_SESSION['success'])): ?>
            <div class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
                <i class="fa-solid fa-check-circle"></i>
                <?= htmlspecialchars($_SESSION['success']) ?>
            </div>
            <?php unset($_SESSION['success']); ?>
        <?php endif; ?>

        <?php if (!empty($_SESSION['error'])): ?>
            <div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                <i class="fa-solid fa-circle-exclamation"></i>
                <?= htmlspecialchars($_SESSION['error']) ?>
            </div>
            <?php unset($_SESSION['error']); ?>
        <?php endif; ?>

        <!-- Address List -->
        <?php if (empty($addresses)): ?>
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i class="fa-solid fa-location-dot text-3xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-800 mb-2">Chưa có địa chỉ nào</h3>
                <p class="text-gray-500 mb-4">Thêm địa chỉ giao hàng để đặt hàng nhanh hơn</p>
                <a href="/addresses/create"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#d73211] transition-colors">
                    <i class="fa-solid fa-plus"></i>
                    <span>Thêm địa chỉ đầu tiên</span>
                </a>
            </div>
        <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($addresses as $address): ?>
                    <div
                        class="bg-white rounded-lg shadow-sm p-5 border-l-4 <?= $address['is_default'] ? 'border-[#EE4D2D]' : 'border-transparent' ?>">
                        <div class="flex justify-between items-start gap-4">
                            <!-- Address Info -->
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="font-medium text-gray-800">
                                        <?= htmlspecialchars($address['recipient_name']) ?>
                                    </span>
                                    <span class="text-gray-400">|</span>
                                    <span class="text-gray-600">
                                        <?= htmlspecialchars($address['phone_number']) ?>
                                    </span>

                                    <?php if ($address['is_default']): ?>
                                        <span class="px-2 py-0.5 text-xs bg-[#EE4D2D] text-white rounded">Mặc định</span>
                                    <?php endif; ?>
                                </div>

                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        <?= htmlspecialchars($address['label']) ?>
                                    </span>
                                </div>

                                <p class="text-gray-600 text-sm">
                                    <?= htmlspecialchars($address['full_address'] ?: $address['street_address']) ?>
                                </p>
                            </div>

                            <!-- Actions -->
                            <div class="flex items-center gap-2">
                                <a href="/addresses/edit?id=<?= $address['id'] ?>"
                                    class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                    Sửa
                                </a>

                                <?php if (!$address['is_default']): ?>
                                    <form action="/addresses/set-default" method="POST" class="inline">
                                        <input type="hidden" name="id" value="<?= $address['id'] ?>">
                                        <button type="submit"
                                            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                            Đặt mặc định
                                        </button>
                                    </form>

                                    <form action="/addresses/delete" method="POST" class="inline"
                                        onsubmit="return confirm('Bạn có chắc muốn xóa địa chỉ này?')">
                                        <input type="hidden" name="id" value="<?= $address['id'] ?>">
                                        <button type="submit"
                                            class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                                            Xóa
                                        </button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Back Link -->
        <div class="mt-6 text-center">
            <a href="/profile" class="text-gray-500 hover:text-[#EE4D2D] transition-colors">
                <i class="fa-solid fa-arrow-left mr-2"></i>
                Quay lại trang cá nhân
            </a>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>