<?php
$title = "Xác minh Email - Zoldify";
ob_start();
?>

<div class="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10">

    <!-- Cột Ảnh bên trái -->
    <div class="hidden lg:flex items-center justify-center w-[55%]">
        <img src="/images/homepage-text.png" alt="Zoldify Illustration"
            class="w-full h-auto object-contain drop-shadow-2xl no-drag" draggable="false">
    </div>

    <!-- Cột Form bên phải -->
    <div class="w-full lg:w-[40%] max-w-[450px] bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div class="text-center mb-6">
            <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-envelope-circle-check text-4xl text-blue-500"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Xác minh Email</h2>
            <p class="text-gray-400 text-sm mt-2">
                Chúng tôi đã gửi mã xác minh đến<br>
                <span class="text-blue-600 font-semibold">
                    <?= htmlspecialchars($email ?? '') ?>
                </span>
            </p>
        </div>

        <!-- Hiển thị thông báo thành công -->
        <?php if (isset($success)): ?>
            <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                <p class="text-sm"><i class="fa-solid fa-circle-check mr-2"></i>
                    <?= htmlspecialchars($success) ?>
                </p>
            </div>
        <?php endif; ?>

        <!-- Hiển thị lỗi -->
        <?php if (isset($error)): ?>
            <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">
                <p class="text-sm"><i class="fa-solid fa-circle-exclamation mr-2"></i>
                    <?= htmlspecialchars($error) ?>
                </p>
            </div>
        <?php endif; ?>

        <!-- Form nhập OTP -->
        <form action="/verify-email" method="post" class="space-y-5">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Nhập mã OTP (6 số)</label>
                <input type="text" name="otp" placeholder="000000" maxlength="6" required
                    class="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-2xl font-bold tracking-[0.5em]"
                    pattern="[0-9]{6}" inputmode="numeric" autocomplete="one-time-code">
            </div>

            <button type="submit"
                class="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md uppercase tracking-wide text-sm">
                <i class="fa-solid fa-check mr-2"></i>Xác minh
            </button>
        </form>

        <!-- Separator -->
        <div class="flex items-center my-5">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="mx-4 text-gray-400 text-xs">hoặc</span>
            <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <!-- Gửi lại mã -->
        <form action="/verify-email/resend" method="post">
            <button type="submit"
                class="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition duration-300">
                <i class="fa-solid fa-rotate-right mr-2"></i>Gửi lại mã xác minh
            </button>
        </form>

        <!-- Thông tin bổ sung -->
        <div class="mt-6 text-center">
            <p class="text-gray-400 text-sm">
                <i class="fa-solid fa-clock mr-1"></i>Mã sẽ hết hạn sau <span class="font-semibold text-gray-600">1
                    giờ</span>
            </p>
            <p class="text-gray-400 text-xs mt-2">
                Kiểm tra hộp thư spam nếu không thấy email
            </p>
        </div>

        <!-- Link quay lại -->
        <div class="text-center mt-6 pt-4 border-t border-gray-100">
            <a href="/login" class="text-gray-500 text-sm hover:text-gray-700">
                <i class="fa-solid fa-arrow-left mr-1"></i>Quay lại đăng nhập
            </a>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();
$scripts = '';
include __DIR__ . '/../layouts/auth.php';
?>