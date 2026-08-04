<!-- Page Header -->
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h1>
        <p class="text-gray-500 text-sm mt-1">Quản lý cấu hình website</p>
    </div>
</div>

<!-- Alert Messages -->
<?php if (isset($_SESSION['success'])): ?>
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
        <?= $_SESSION['success'];
        unset($_SESSION['success']); ?>
    </div>
<?php endif; ?>

<?php if (isset($_SESSION['error'])): ?>
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
        <?= $_SESSION['error'];
        unset($_SESSION['error']); ?>
    </div>
<?php endif; ?>

<!-- Settings Tabs -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200">
        <nav class="flex -mb-px" id="settingsTabs">
            <button type="button"
                class="tab-btn active px-6 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600"
                data-tab="general">
                <i class="fa-solid fa-globe mr-2"></i>Thông tin chung
            </button>
            <button type="button"
                class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                data-tab="contact">
                <i class="fa-solid fa-address-book mr-2"></i>Liên hệ
            </button>
            <button type="button"
                class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                data-tab="email">
                <i class="fa-solid fa-envelope mr-2"></i>Email SMTP
            </button>
            <button type="button"
                class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                data-tab="payment">
                <i class="fa-solid fa-credit-card mr-2"></i>Thanh toán
            </button>
            <button type="button"
                class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                data-tab="social">
                <i class="fa-solid fa-share-nodes mr-2"></i>Mạng xã hội
            </button>
            <button type="button"
                class="tab-btn px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                data-tab="maintenance">
                <i class="fa-solid fa-tools mr-2"></i>Bảo trì
            </button>
        </nav>
    </div>

    <!-- Tab Contents -->
    <div class="p-6">
        <!-- General Settings -->
        <div id="tab-general" class="tab-content">
            <form action="/admin/settings/update" method="POST" class="space-y-6">
                <input type="hidden" name="group" value="general">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tên Website</label>
                        <input type="text" name="site_name"
                            value="<?= htmlspecialchars($settings['general']['site_name'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả Website</label>
                        <input type="text" name="site_description"
                            value="<?= htmlspecialchars($settings['general']['site_description'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>

                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
                </button>
            </form>

            <!-- Logo & Favicon Upload -->
            <div class="mt-8 pt-8 border-t border-gray-200">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Logo & Favicon</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Logo -->
                    <div class="p-4 border border-gray-200 rounded-lg">
                        <p class="text-sm font-medium text-gray-700 mb-3">Logo Website</p>
                        <?php if (!empty($settings['general']['site_logo'])): ?>
                            <img src="<?= $settings['general']['site_logo'] ?>" alt="Logo" class="h-16 mb-3">
                        <?php else: ?>
                            <div class="h-16 w-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-3">
                                <i class="fa-solid fa-image text-2xl"></i>
                            </div>
                        <?php endif; ?>
                        <form action="/admin/settings/upload-image" method="POST" enctype="multipart/form-data"
                            class="flex gap-2">
                            <input type="hidden" name="type" value="logo">
                            <input type="file" name="image" accept="image/*" class="text-sm">
                            <button type="submit"
                                class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Upload</button>
                        </form>
                    </div>

                    <!-- Favicon -->
                    <div class="p-4 border border-gray-200 rounded-lg">
                        <p class="text-sm font-medium text-gray-700 mb-3">Favicon</p>
                        <?php if (!empty($settings['general']['site_favicon'])): ?>
                            <img src="<?= $settings['general']['site_favicon'] ?>" alt="Favicon" class="h-16 mb-3">
                        <?php else: ?>
                            <div class="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-3">
                                <i class="fa-solid fa-image"></i>
                            </div>
                        <?php endif; ?>
                        <form action="/admin/settings/upload-image" method="POST" enctype="multipart/form-data"
                            class="flex gap-2">
                            <input type="hidden" name="type" value="favicon">
                            <input type="file" name="image" accept="image/*,.ico" class="text-sm">
                            <button type="submit"
                                class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Upload</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Settings -->
        <div id="tab-contact" class="tab-content hidden">
            <form action="/admin/settings/update" method="POST" class="space-y-6">
                <input type="hidden" name="group" value="contact">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
                        <input type="email" name="contact_email"
                            value="<?= htmlspecialchars($settings['contact']['contact_email'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input type="text" name="contact_phone"
                            value="<?= htmlspecialchars($settings['contact']['contact_phone'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                    <textarea name="contact_address" rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><?= htmlspecialchars($settings['contact']['contact_address'] ?? '') ?></textarea>
                </div>

                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
                </button>
            </form>
        </div>

        <!-- Email SMTP Settings -->
        <div id="tab-email" class="tab-content hidden">
            <form action="/admin/settings/update" method="POST" class="space-y-6">
                <input type="hidden" name="group" value="email">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                        <input type="text" name="smtp_host" placeholder="smtp.gmail.com"
                            value="<?= htmlspecialchars($settings['email']['smtp_host'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                        <input type="text" name="smtp_port" placeholder="587"
                            value="<?= htmlspecialchars($settings['email']['smtp_port'] ?? '587') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                        <input type="text" name="smtp_username"
                            value="<?= htmlspecialchars($settings['email']['smtp_username'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                        <input type="password" name="smtp_password"
                            value="<?= htmlspecialchars($settings['email']['smtp_password'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                        <select name="smtp_encryption"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="tls" <?= ($settings['email']['smtp_encryption'] ?? '') === 'tls' ? 'selected' : '' ?>>TLS</option>
                            <option value="ssl" <?= ($settings['email']['smtp_encryption'] ?? '') === 'ssl' ? 'selected' : '' ?>>SSL</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tên người gửi</label>
                        <input type="text" name="mail_from_name"
                            value="<?= htmlspecialchars($settings['email']['mail_from_name'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email người gửi</label>
                        <input type="email" name="mail_from_email"
                            value="<?= htmlspecialchars($settings['email']['mail_from_email'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>

                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
                </button>
            </form>
        </div>

        <!-- Payment Settings -->
        <div id="tab-payment" class="tab-content hidden">
            <form action="/admin/settings/update" method="POST" class="space-y-6">
                <input type="hidden" name="group" value="payment">

                <div class="grid grid-cols-1 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                        <select name="payment_gateway"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">-- Chọn cổng thanh toán --</option>
                            <option value="vnpay" <?= ($settings['payment']['payment_gateway'] ?? '') === 'vnpay' ? 'selected' : '' ?>>VNPay</option>
                            <option value="momo" <?= ($settings['payment']['payment_gateway'] ?? '') === 'momo' ? 'selected' : '' ?>>MoMo</option>
                            <option value="zalopay" <?= ($settings['payment']['payment_gateway'] ?? '') === 'zalopay' ? 'selected' : '' ?>>ZaloPay</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input type="text" name="payment_api_key"
                            value="<?= htmlspecialchars($settings['payment']['payment_api_key'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                        <input type="password" name="payment_secret_key"
                            value="<?= htmlspecialchars($settings['payment']['payment_secret_key'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>

                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
                </button>
            </form>
        </div>

        <!-- Social Settings -->
        <div id="tab-social" class="tab-content hidden">
            <form action="/admin/settings/update" method="POST" class="space-y-6">
                <input type="hidden" name="group" value="social">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fa-brands fa-facebook text-blue-600 mr-2"></i>Facebook
                        </label>
                        <input type="url" name="social_facebook" placeholder="https://facebook.com/..."
                            value="<?= htmlspecialchars($settings['social']['social_facebook'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fa-solid fa-comment-dots text-blue-500 mr-2"></i>Zalo
                        </label>
                        <input type="text" name="social_zalo" placeholder="Số điện thoại Zalo"
                            value="<?= htmlspecialchars($settings['social']['social_zalo'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fa-brands fa-instagram text-pink-600 mr-2"></i>Instagram
                        </label>
                        <input type="url" name="social_instagram" placeholder="https://instagram.com/..."
                            value="<?= htmlspecialchars($settings['social']['social_instagram'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fa-brands fa-youtube text-red-600 mr-2"></i>YouTube
                        </label>
                        <input type="url" name="social_youtube" placeholder="https://youtube.com/..."
                            value="<?= htmlspecialchars($settings['social']['social_youtube'] ?? '') ?>"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>

                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
                </button>
            </form>
        </div>

        <!-- Maintenance Settings -->
        <div id="tab-maintenance" class="tab-content hidden">
            <div class="space-y-6">
                <!-- Toggle Maintenance -->
                <div
                    class="p-6 border rounded-lg <?= ($settings['maintenance']['maintenance_mode'] ?? '0') === '1' ? 'border-red-300 bg-red-50' : 'border-gray-200' ?>">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">Chế độ bảo trì</h3>
                            <p class="text-sm text-gray-500 mt-1">Khi bật, người dùng sẽ không thể truy cập website</p>
                        </div>
                        <form action="/admin/settings/toggle-maintenance" method="POST">
                            <?php if (($settings['maintenance']['maintenance_mode'] ?? '0') === '1'): ?>
                                <button type="submit"
                                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    <i class="fa-solid fa-toggle-on mr-2"></i>TẮT bảo trì
                                </button>
                            <?php else: ?>
                                <button type="button" id="enableMaintenanceBtn"
                                    class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                                    <i class="fa-solid fa-toggle-off mr-2"></i>BẬT bảo trì
                                </button>
                                <script>
                                    document.getElementById('enableMaintenanceBtn').addEventListener('click', async function () {
                                        const confirmed = await ZDialog.confirm(
                                            'Xác nhận bảo trì',
                                            'Bạn có chắc muốn BẬT chế độ bảo trì? Người dùng sẽ không thể truy cập website!',
                                            { confirmText: 'BẬT bảo trì', cancelText: 'Hủy' }
                                        );
                                        if (confirmed) {
                                            this.closest('form').submit();
                                        }
                                    });
                                </script>
                            <?php endif; ?>
                        </form>
                    </div>
                </div>

                <!-- Maintenance Message -->
                <form action="/admin/settings/update" method="POST" class="space-y-4">
                    <input type="hidden" name="group" value="maintenance">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Thông báo bảo trì</label>
                        <textarea name="maintenance_message" rows="4"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><?= htmlspecialchars($settings['maintenance']['maintenance_message'] ?? '') ?></textarea>
                        <p class="text-xs text-gray-500 mt-1">Nội dung hiển thị cho người dùng khi website đang bảo trì
                        </p>
                    </div>

                    <button type="submit"
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Tab Switching Script -->
<script>
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active', 'border-blue-500', 'text-blue-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });

            // Add active to clicked tab
            this.classList.add('active', 'border-blue-500', 'text-blue-600');
            this.classList.remove('border-transparent', 'text-gray-500');

            // Hide all content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            // Show selected content
            const tabId = 'tab-' + this.dataset.tab;
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
</script>