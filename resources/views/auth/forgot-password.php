<?php
// 1. Title
$title = "Quên mật khẩu - Zoldify";

// 2. Start buffering
ob_start();
?>

<!-- CONTENT -->
<div class="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10">

    <!-- Image Column -->
    <div class="hidden lg:flex items-center justify-center w-[55%]">
        <img src="/images/homepage-text.png" alt="Zoldify Illustration"
            class="w-full h-auto object-contain drop-shadow-2xl no-drag" draggable="false">
    </div>

    <!-- Form Column -->
    <div class="w-full lg:w-[40%] max-w-[450px] bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        
        <?php if ($step === 'verify'): ?>
            <!-- STEP 2: VERIFY OTP -->
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-gray-800">Xác thực OTP</h2>
                <p class="text-gray-400 text-sm mt-1">
                    Nhập mã code 6 số đã được gửi tới email <br>
                    <span class="font-semibold text-blue-500"><?= htmlspecialchars($_SESSION['reset_email'] ?? '') ?></span>
                </p>
            </div>

            <form action="/verify-otp" method="post" class="space-y-4">
                <?php if (isset($_SESSION['error'])): ?>
                    <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">
                        <p class="font-bold"><i class="fa-solid fa-circle-exclamation mr-2"></i>Lỗi</p>
                        <p class="text-sm"><?= htmlspecialchars($_SESSION['error']) ?></p>
                    </div>
                    <?php unset($_SESSION['error']); ?>
                <?php endif; ?>
                
                <?php if (isset($_SESSION['success'])): ?>
                    <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                        <p class="font-bold"><i class="fa-solid fa-circle-check mr-2"></i>Đã gửi mã</p>
                        <p class="text-sm"><?= htmlspecialchars($_SESSION['success']) ?></p>
                    </div>
                    <?php unset($_SESSION['success']); ?>
                <?php endif; ?>

                <div>
                    <input type="text" name="otp" placeholder="Nhập mã OTP 6 số" required maxlength="6"
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-2xl tracking-widest font-mono">
                </div>

                <input type="submit" value="XÁC NHẬN"
                    class="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md uppercase tracking-wide text-sm">

                <div class="text-center pt-2 flex justify-between items-center text-sm">
                    <a href="/login" class="text-gray-500 hover:text-gray-700">Quay lại đăng nhập</a>
                    <a href="/forgot-password?resend=1" class="text-[#5A88FF] hover:text-blue-700 font-medium">Gửi lại mã?</a>
                </div>
            </form>

        <?php else: ?>
            <!-- STEP 1: ENTER EMAIL -->
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-gray-800">Quên mật khẩu?</h2>
                <p class="text-gray-400 text-sm mt-1">Đừng lo! Nhập email của bạn để lấy lại mật khẩu.</p>
            </div>

            <form action="/forgot-password" method="post" class="space-y-4">
                <?php if (isset($_SESSION['error'])): ?>
                    <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">
                        <p class="font-bold"><i class="fa-solid fa-circle-exclamation mr-2"></i>Lỗi</p>
                        <p class="text-sm"><?= htmlspecialchars($_SESSION['error']) ?></p>
                    </div>
                    <?php unset($_SESSION['error']); ?>
                <?php endif; ?>

                <div>
                    <label class="block text-gray-600 text-sm font-medium mb-2">Email đăng ký</label>
                    <input type="email" name="email" placeholder="name@example.com" required
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                </div>

                <input type="submit" value="GỬI MÃ XÁC THỰC"
                    class="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md uppercase tracking-wide text-sm">

                <div class="text-center pt-2">
                    <a href="/login" class="text-gray-500 hover:text-gray-700 text-sm font-medium"><i class="fa-solid fa-arrow-left mr-1"></i> Quay lại đăng nhập</a>
                </div>
            </form>
        <?php endif; ?>
    </div>
</div>

<?php
$content = ob_get_clean();
include __DIR__ . '/../layouts/auth.php';
?>
