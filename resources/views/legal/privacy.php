<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Chính Sách Bảo Mật</h1>
            <p class="text-sm text-gray-500 mb-8">Cập nhật lần cuối:
                <?= date('d/m/Y') ?>
            </p>

            <div class="prose prose-gray max-w-none space-y-6 text-gray-700">
                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">1. Giới thiệu</h2>
                    <p>Chào mừng bạn đến với
                        <?= $siteSettings['general']['site_name'] ?? 'Zoldify' ?> ("chúng tôi"). Chúng tôi cam kết bảo
                        vệ quyền riêng tư và dữ liệu cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi
                        thu thập, sử dụng, chia sẻ và bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ của chúng
                        tôi.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">2. Thông tin chúng tôi thu thập</h2>
                    <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
                    <ul class="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Thông tin cá nhân:</strong> Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng
                            khi bạn đăng ký tài khoản hoặc đặt hàng.</li>
                        <li><strong>Thông tin đăng nhập:</strong> Thông tin tài khoản Google nếu bạn sử dụng đăng nhập
                            bằng Google OAuth.</li>
                        <li><strong>Thông tin giao dịch:</strong> Lịch sử mua hàng, sản phẩm đã xem, giỏ hàng.</li>
                        <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị, cookie và các
                            công nghệ tương tự.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">3. Mục đích sử dụng thông tin</h2>
                    <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
                    <ul class="list-disc pl-6 space-y-2 mt-2">
                        <li>Xử lý đơn hàng và giao dịch của bạn</li>
                        <li>Cung cấp hỗ trợ khách hàng</li>
                        <li>Cải thiện trải nghiệm người dùng và dịch vụ</li>
                        <li>Gửi thông báo về đơn hàng, khuyến mãi (nếu bạn đồng ý)</li>
                        <li>Bảo mật tài khoản và phát hiện gian lận</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">4. Chia sẻ thông tin</h2>
                    <p>Chúng tôi không bán thông tin cá nhân của bạn. Tuy nhiên, chúng tôi có thể chia sẻ thông tin với:
                    </p>
                    <ul class="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Đối tác vận chuyển:</strong> Để giao hàng đến địa chỉ của bạn</li>
                        <li><strong>Đối tác thanh toán:</strong> Để xử lý các giao dịch thanh toán an toàn</li>
                        <li><strong>Cơ quan pháp luật:</strong> Khi được yêu cầu theo quy định pháp luật</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">5. Bảo mật dữ liệu</h2>
                    <p>Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân
                        của bạn khỏi truy cập trái phép, mất mát hoặc tiết lộ, bao gồm mã hóa SSL, xác thực hai yếu tố,
                        và kiểm soát truy cập nghiêm ngặt.</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">6. Quyền của bạn</h2>
                    <p>Bạn có quyền:</p>
                    <ul class="list-disc pl-6 space-y-2 mt-2">
                        <li>Truy cập và xem thông tin cá nhân của mình</li>
                        <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
                        <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                        <li>Từ chối nhận email marketing</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">7. Cookie</h2>
                    <p>Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn, ghi nhớ tùy chọn và phân tích lưu
                        lượng truy cập. Bạn có thể quản lý cài đặt cookie trong trình duyệt của mình.</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">8. Liên hệ</h2>
                    <p>Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ:</p>
                    <ul class="list-none mt-2 space-y-1">
                        <li><strong>Email:</strong>
                            <?= htmlspecialchars($siteSettings['contact']['contact_email'] ?? 'support@zoldify.com') ?>
                        </li>
                        <li><strong>Website:</strong>
                            <?= $siteSettings['general']['site_url'] ?? 'https://zoldify.com' ?>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </div>
</main>

<?php include __DIR__ . '/../partials/footer.php'; ?>