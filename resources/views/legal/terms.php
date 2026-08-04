<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Điều Khoản Sử Dụng</h1>
            <p class="text-sm text-gray-500 mb-8">Cập nhật lần cuối:
                <?= date('d/m/Y') ?>
            </p>

            <div class="prose prose-gray max-w-none space-y-6 text-gray-700">
                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">1. Chấp nhận điều khoản</h2>
                    <p>Bằng việc truy cập và sử dụng
                        <?= $siteSettings['general']['site_name'] ?? 'Zoldify' ?> ("Dịch vụ"), bạn đồng ý tuân thủ và bị
                        ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của điều
                        khoản, bạn không nên sử dụng Dịch vụ.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">2. Mô tả dịch vụ</h2>
                    <p>
                        <?= $siteSettings['general']['site_name'] ?? 'Zoldify' ?> là một nền tảng thương mại điện tử cho
                        phép người dùng mua và bán các sản phẩm. Chúng tôi cung cấp nền tảng kết nối người mua và người
                        bán, nhưng không trực tiếp tham gia vào các giao dịch giữa các bên.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">3. Tài khoản người dùng</h2>
                    <p>Khi tạo tài khoản, bạn đồng ý:</p>
                    <ul class="list-disc pl-6 space-y-2 mt-2">
                        <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                        <li>Bảo mật thông tin đăng nhập và không chia sẻ cho người khác</li>
                        <li>Chịu trách nhiệm về mọi hoạt động xảy ra dưới tài khoản của bạn</li>
                        <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">4. Quy tắc sử dụng</h2>
                    <p>Khi sử dụng Dịch vụ, bạn cam kết không:</p>
                    <ul class="list-disc pl-6 space-y-2 mt-2">
                        <li>Vi phạm pháp luật Việt Nam và quốc tế</li>
                        <li>Đăng tải nội dung bất hợp pháp, xúc phạm hoặc lừa đảo</li>
                        <li>Bán hàng giả, hàng nhái hoặc hàng cấm</li>
                        <li>Sử dụng bot, script hoặc công cụ tự động để thao túng hệ thống</li>
                        <li>Spam hoặc quấy rối người dùng khác</li>
                        <li>Thu thập thông tin người dùng mà không được phép</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">5. Giao dịch mua bán</h2>
                    <ul class="list-disc pl-6 space-y-2">
                        <li><strong>Người bán:</strong> Chịu trách nhiệm về chất lượng sản phẩm, mô tả chính xác, và
                            giao hàng đúng hẹn.</li>
                        <li><strong>Người mua:</strong> Có trách nhiệm thanh toán đầy đủ và nhận hàng theo thỏa thuận.
                        </li>
                        <li><strong>Tranh chấp:</strong> Chúng tôi hỗ trợ giải quyết tranh chấp nhưng quyết định cuối
                            cùng có thể cần sự can thiệp của cơ quan pháp luật.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">6. Sở hữu trí tuệ</h2>
                    <p>Tất cả nội dung, logo, giao diện và phần mềm trên
                        <?= $siteSettings['general']['site_name'] ?? 'Zoldify' ?> thuộc sở hữu của chúng tôi hoặc các
                        bên cấp phép. Bạn không được sao chép, sửa đổi hoặc phân phối mà không có sự cho phép bằng văn
                        bản.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">7. Giới hạn trách nhiệm</h2>
                    <p>Chúng tôi nỗ lực cung cấp dịch vụ ổn định và an toàn, nhưng không đảm bảo Dịch vụ sẽ không bị
                        gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm về các thiệt hại gián tiếp phát
                        sinh từ việc sử dụng Dịch vụ.</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">8. Chấm dứt</h2>
                    <p>Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu vi phạm Điều khoản sử dụng mà
                        không cần thông báo trước. Bạn cũng có thể yêu cầu xóa tài khoản bất cứ lúc nào.</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">9. Thay đổi điều khoản</h2>
                    <p>Chúng tôi có thể cập nhật Điều khoản sử dụng theo thời gian. Thay đổi quan trọng sẽ được thông
                        báo qua email hoặc thông báo trên website. Việc tiếp tục sử dụng Dịch vụ sau khi thay đổi có
                        hiệu lực đồng nghĩa với việc bạn chấp nhận điều khoản mới.</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">10. Luật áp dụng</h2>
                    <p>Điều khoản sử dụng này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết
                        tại tòa án có thẩm quyền tại Việt Nam.</p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-gray-800 mb-3">11. Liên hệ</h2>
                    <p>Nếu bạn có câu hỏi về Điều khoản sử dụng này, vui lòng liên hệ:</p>
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