<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:py-10">
    <div class="max-w-[600px] mx-auto px-4">
        <div class="bg-white rounded-sm shadow-sm p-8 text-center animate-fade-in-up">
            <div
                class="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fa-solid fa-check text-4xl"></i>
            </div>

            <h1 class="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
            <p class="text-gray-500 mb-8">Cảm ơn bạn đã mua hàng tại UniMarket. Đơn hàng của bạn đang được xử lý.</p>

            <div class="flex gap-4 justify-center">
                <a href="/products"
                    class="px-6 py-2.5 bg-[#EE4D2D] text-white font-medium rounded-sm hover:bg-[#d73211] transition-colors shadow-sm">
                    Tiếp tục mua sắm
                </a>
                <a href="#"
                    class="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-sm hover:bg-gray-50 transition-colors">
                    Xem đơn hàng
                </a>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>