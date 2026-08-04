<!-- Footer - Ẩn trên mobile, chỉ hiện bottom nav -->
<footer class="hidden md:block bg-gray-100 py-[30px]">
    <div class="container mx-auto px-4 max-w-6xl">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 py-4 md:py-[30px]">
            <!-- Service -->
            <div>
                <h3 class="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wide">DỊCH VỤ KHÁCH HÀNG</h3>
                <ul class="space-y-3 text-sm text-gray-600">
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Trung Tâm Trợ Giúp
                            <?= $siteSettings['general']['site_name'] ?? 'Zoldify' ?></a></li>
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Hướng Dẫn Mua Hàng/Đặt Hàng</a></li>
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Hướng Dẫn Bán Hàng</a></li>
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Đơn Hàng</a></li>
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Trả Hàng/Hoàn Tiền</a></li>
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Liên Hệ
                            <?= $siteSettings['general']['site_name'] ?? 'Zoldify' ?></a></li>
                    <li><a href="#" class="hover:text-gray-800 transition-colors">Chính Sách Bảo Hành</a></li>
                    <li><a href="/privacy" class="hover:text-gray-800 transition-colors">Chính Sách Bảo Mật</a></li>
                    <li><a href="/terms" class="hover:text-gray-800 transition-colors">Điều Khoản Sử Dụng</a></li>
                </ul>
            </div>

            <!-- Pay -->
            <div>
                <h3 class="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wide">THANH TOÁN</h3>
                <div class="flex gap-3 flex-wrap">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa"
                        class="h-8 w-auto">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard"
                        class="h-8 w-auto">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" alt="JCB"
                        class="h-8 w-auto">
                </div>
            </div>

            <!-- Monitor -->
            <div>
                <h3 class="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wide">THEO DÕI
                    <?= strtoupper($siteSettings['general']['site_name'] ?? 'ZOLDIFY') ?>
                </h3>
                <ul class="space-y-3 text-sm text-gray-600">
                    <?php if (!empty($siteSettings['social']['social_facebook'])): ?>
                        <li class="flex items-center gap-3">
                            <i class="fa-brands fa-facebook text-base text-gray-700"></i>
                            <a href="<?= htmlspecialchars($siteSettings['social']['social_facebook']) ?>" target="_blank"
                                class="hover:text-gray-800 transition-colors">Facebook</a>
                        </li>
                    <?php endif; ?>

                    <?php if (!empty($siteSettings['social']['social_instagram'])): ?>
                        <li class="flex items-center gap-3">
                            <i class="fa-brands fa-square-instagram text-base text-gray-700"></i>
                            <a href="<?= htmlspecialchars($siteSettings['social']['social_instagram']) ?>" target="_blank"
                                class="hover:text-gray-800 transition-colors">Instagram</a>
                        </li>
                    <?php endif; ?>

                    <?php if (!empty($siteSettings['social']['social_youtube'])): ?>
                        <li class="flex items-center gap-3">
                            <i class="fa-brands fa-youtube text-base text-gray-700"></i>
                            <a href="<?= htmlspecialchars($siteSettings['social']['social_youtube']) ?>" target="_blank"
                                class="hover:text-gray-800 transition-colors">YouTube</a>
                        </li>
                    <?php endif; ?>

                    <?php if (!empty($siteSettings['social']['social_zalo'])): ?>
                        <li class="flex items-center gap-3">
                            <i class="fa-solid fa-comment-dots text-base text-gray-700"></i>
                            <a href="https://zalo.me/<?= htmlspecialchars($siteSettings['social']['social_zalo']) ?>"
                                target="_blank" class="hover:text-gray-800 transition-colors">Zalo</a>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        </div>
    </div>

    <div class="text-center text-sm text-gray-500">
        <p>©
            <?= date('Y') ?>
            <?= htmlspecialchars($siteSettings['general']['site_name'] ?? 'Zoldify') ?>. Tất cả các quyền được bảo lưu.
        </p>
        <p class="mt-1">Quốc gia & Khu vực: Việt Nam</p>
        <?php if (!empty($siteSettings['contact']['contact_email'])): ?>
            <p class="mt-1">Email:
                <?= htmlspecialchars($siteSettings['contact']['contact_email']) ?>
            </p>
        <?php endif; ?>
    </div>
</footer>

<!-- Socket.IO Client Library -->
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

<!-- Zoldify Custom Dialog System -->
<script src="/js/zoldify-dialog.js?v=<?= time() ?>"></script>

<!-- Chat Socket Client -->
<script src="/js/chat-socket.js?v=<?= time() ?>"></script>

<!-- Notification Toast (popup thông báo tin nhắn mới) -->
<script src="/js/notification-toast.js?v=<?= time() ?>"></script>

<!-- Khởi tạo kết nối nếu user đã đăng nhập -->
<?php if (isset($_SESSION['user']['id'])): ?>
    <script>
        // Kết nối Socket
        document.addEventListener('DOMContentLoaded', function () {
            window.chatSocket.connect(<?= $_SESSION['user']['id'] ?>);
        });
    </script>
<?php endif; ?>

<!-- Mobile Bottom Navigation - Like Shopee/Lazada -->
<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-[1000]"
    style="padding-bottom: env(safe-area-inset-bottom);">
    <div class="flex h-14">
        <!-- Trang chủ -->
        <a href="/" style="width: 20%;"
            class="flex flex-col items-center justify-center <?= ($_SERVER['REQUEST_URI'] === '/' || $_SERVER['REQUEST_URI'] === '/home') ? 'text-[#2C67C8]' : 'text-gray-500' ?>">
            <i class="fa-solid fa-house text-lg"></i>
            <span class="text-[9px] mt-0.5 font-medium">Trang chủ</span>
        </a>

        <!-- Tìm kiếm -->
        <a href="/search" style="width: 20%;"
            class="flex flex-col items-center justify-center <?= (strpos($_SERVER['REQUEST_URI'], '/search') === 0) ? 'text-[#2C67C8]' : 'text-gray-500' ?>">
            <i class="fa-solid fa-magnifying-glass text-lg"></i>
            <span class="text-[9px] mt-0.5 font-medium">Tìm kiếm</span>
        </a>

        <!-- Đăng bán - Nút nổi bật -->
        <a href="/products/create" style="width: 20%;" class="flex flex-col items-center justify-center -mt-2">
            <div
                class="w-10 h-10 bg-gradient-to-r from-[#2C67C8] to-[#1990AA] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <i class="fa-solid fa-plus text-white text-sm"></i>
            </div>
            <span class="text-[9px] mt-0.5 font-bold text-[#2C67C8]">Đăng bán</span>
        </a>

        <!-- Chat -->
        <a href="/chat" style="width: 20%;"
            class="flex flex-col items-center justify-center <?= (strpos($_SERVER['REQUEST_URI'], '/chat') === 0) ? 'text-[#2C67C8]' : 'text-gray-500' ?>">
            <i class="fa-regular fa-comment-dots text-lg"></i>
            <span class="text-[9px] mt-0.5 font-medium">Chat</span>
        </a>

        <!-- Tài khoản -->
        <a href="/profile" style="width: 20%;"
            class="flex flex-col items-center justify-center <?= (strpos($_SERVER['REQUEST_URI'], '/profile') === 0) ? 'text-[#2C67C8]' : 'text-gray-500' ?>">
            <i class="fa-regular fa-user text-lg"></i>
            <span class="text-[9px] mt-0.5 font-medium">Tài khoản</span>
        </a>
    </div>
</nav>