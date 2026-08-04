<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
    <div class="text-center">
        <div class="mb-8">
            <i class="fa-solid fa-face-sad-tear text-8xl text-slate-300"></i>
        </div>
        <h1 class="text-6xl font-bold text-slate-800 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-slate-600 mb-4">Không tìm thấy trang</h2>
        <p class="text-slate-500 mb-8 max-w-md mx-auto">
            <?= htmlspecialchars($message ?? 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.') ?>
        </p>
        <div class="flex gap-4 justify-center">
            <a href="/" class="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                <i class="fa-solid fa-home mr-2"></i> Về trang chủ
            </a>
            <button onclick="history.back()" class="px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                <i class="fa-solid fa-arrow-left mr-2"></i> Quay lại
            </button>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>
