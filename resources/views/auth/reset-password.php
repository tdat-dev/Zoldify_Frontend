<?php
// 1. Title
$title = "Đặt lại mật khẩu - Zoldify";

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
        <div class="text-center mb-6">
            <h2 class="text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
            <p class="text-gray-400 text-sm mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form action="/reset-password" method="post" class="space-y-4">
            <?php if (isset($_SESSION['error'])): ?>
                <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">
                    <p class="font-bold"><i class="fa-solid fa-circle-exclamation mr-2"></i>Lỗi</p>
                    <p class="text-sm"><?= htmlspecialchars($_SESSION['error']) ?></p>
                </div>
                <?php unset($_SESSION['error']); ?>
            <?php endif; ?>

            <div>
                <label class="block text-gray-600 text-sm font-medium mb-2">Mật khẩu mới</label>
                <div class="relative">
                    <input type="password" name="password" id="password" placeholder="Mật khẩu mới (min 6 ký tự)" required minlength="6"
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <span class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600" id="togglePassword">
                        <i class="fa-regular fa-eye"></i>
                    </span>
                </div>
            </div>

            <div>
                <label class="block text-gray-600 text-sm font-medium mb-2">Xác nhận mật khẩu</label>
                <div class="relative">
                    <input type="password" name="password_confirm" id="password_confirm" placeholder="Nhập lại mật khẩu mới" required minlength="6"
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                </div>
            </div>

            <input type="submit" value="ĐỔI MẬT KHẨU"
                class="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md uppercase tracking-wide text-sm">
        </form>
    </div>
</div>

<?php
$content = ob_get_clean();

// Script for toggling password
ob_start();
?>
<script>
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirm');
    
    if (togglePassword && password) {
        togglePassword.addEventListener('click', function () {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            if(passwordConfirm) passwordConfirm.setAttribute('type', type);
            
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
</script>
<?php
$scripts = ob_get_clean();

include __DIR__ . '/../layouts/auth.php';
?>
