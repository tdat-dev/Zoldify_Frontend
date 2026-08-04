<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-[60vh] pb-20 md:py-10">
    <div class="max-w-[1200px] mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto border-t-4 border-[#2C67C8]">
            <div class="mb-6 inline-block p-4 bg-blue-50 rounded-full">
                <i class="fa-solid fa-headset text-5xl text-[#2C67C8]"></i>
            </div>

            <h1 class="text-3xl font-bold text-gray-800 mb-4">Trung Tâm Hỗ Trợ</h1>

            <p class="text-gray-600 mb-8 leading-relaxed">
                Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.<br>
                Đội ngũ hỗ trợ làm việc từ 8:00 - 22:00 tất cả các ngày trong tuần.
            </p>

            <div
                class="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-inner">
                <span class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Hotline Hỗ Trợ 24/7</span>
                <a href="tel:0355494014"
                    class="text-4xl md:text-5xl font-black text-[#2C67C8] hover:text-[#1a4b9c] transition-colors font-mono tracking-tight drop-shadow-sm">
                    0355494014
                </a>
                <div class="mt-4 flex gap-3">
                    <button
                        class="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-[#2C67C8] hover:border-[#2C67C8] transition-all flex items-center shadow-sm"
                        onclick="navigator.clipboard.writeText('0355494014').then(() => ZDialog.toast('Đã sao chép số điện thoại!', 'success'))">
                        <i class="fa-regular fa-copy mr-1.5"></i> Sao chép
                    </button>
                </div>
            </div>


        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>