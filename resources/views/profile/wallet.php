<?php
use App\Helpers\TimeHelper;
include __DIR__ . '/../partials/head.php';
?>
<?php include __DIR__ . '/../partials/header.php'; ?>

<main class="bg-gray-50 min-h-screen pb-20 md:pb-12">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <!-- User Info Card (Simplified for sub-pages) -->
        <!-- User Info Card -->
        <?php $activeTab = 'wallet';
        include __DIR__ . '/../partials/profile_card.php'; ?>


        <!-- Content Area -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Balance Card -->
            <div class="md:col-span-1">
                <div class="rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden"
                    style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                    <div class="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                        <div>
                            <p class="text-gray-400 text-sm font-medium uppercase tracking-wider"
                                style="color: #9ca3af;">Số dư khả dụng</p>
                            <h3 class="text-4xl font-extrabold mt-2 tracking-tight text-white">
                                <?= number_format($balance, 0, ',', '.') ?> <span class="text-lg font-normal"
                                    style="color: rgba(255,255,255,0.7);">VNĐ</span>
                            </h3>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <!-- <button onclick="document.getElementById('depositModal').classList.remove('hidden')"
                                class="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                                Nạp tiền
                            </button> -->
                            <button onclick="ZDialog.warning('Thông báo', 'Tính năng rút tiền đang bảo trì.')"
                                class="w-full bg-transparent hover:bg-white/5 border border-white/20 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                                Rút tiền
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transaction History -->
            <div class="md:col-span-2">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800">Lịch sử giao dịch</h3>
                        <a href="#" class="text-sm text-blue-600 hover:underline">Xem tất cả</a>
                    </div>

                    <div class="p-0">
                        <?php if (empty($transactions)): ?>
                            <div class="p-8 text-center">
                                <div
                                    class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                    <i class="fa-solid fa-clock-rotate-left text-gray-400"></i>
                                </div>
                                <p class="text-gray-500 text-sm">Chưa có giao dịch nào gần đây.</p>
                            </div>
                        <?php else: ?>
                            <ul class="divide-y divide-gray-100">
                                <?php foreach ($transactions as $t): ?>
                                    <li class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="w-10 h-10 rounded-full flex items-center justify-center <?= $t['type'] == 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600' ?>">
                                                <i
                                                    class="fa-solid <?= $t['type'] == 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up' ?>"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm font-medium text-gray-900">
                                                    <?= $t['type'] == 'deposit' ? 'Nạp tiền vào ví' : ($t['type'] == 'withdraw' ? 'Rút tiền' : 'Giao dịch khác') ?>
                                                </p>
                                                <p class="text-xs text-gray-500">
                                                    <?= TimeHelper::formatDatetime($t['created_at']) ?>
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            class="font-bold text-sm <?= $t['type'] == 'deposit' || $t['type'] == 'refund' ? 'text-green-600' : 'text-gray-900' ?>">
                                            <?= $t['type'] == 'deposit' || $t['type'] == 'refund' ? '+' : '-' ?>
                                            <?= number_format($t['amount'], 0, ',', '.') ?>đ
                                        </span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Deposit Modal Removed -->

<?php include __DIR__ . '/../partials/footer.php'; ?>