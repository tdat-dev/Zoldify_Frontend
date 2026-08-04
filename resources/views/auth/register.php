<?php
// 1. Đặt tiêu đề
$title = "Đăng ký - Zoldify";

// 2. Bắt đầu nội dung chính
ob_start();
?>

<!-- NỘI DUNG CHÍNH (Đã bỏ header/footer, chỉ giữ lại phần giữa) -->
<div class="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10">

    <!-- Cột Ảnh bên trái -->
    <div class="hidden lg:flex flex-col items-center justify-center w-[55%]">
        <img src="/images/homepage-text.png" alt="Zoldify Illustration"
            class="w-full h-auto object-contain drop-shadow-2xl no-drag" draggable="false">
        <div class="mt-8 text-center text-white">
            <h3 class="text-3xl font-bold mb-2">Tham gia Zoldify</h3>
            <p class="text-blue-100 text-lg">Cộng đồng trao đổi đồ cũ</p>
        </div>
    </div>

    <!-- Cột Form bên phải -->
    <div class="w-full lg:w-[45%] max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h2>
        </div>

        <form action="/register" method="post" class="space-y-4">
            <!-- Hiển thị lỗi chung -->
            <?php if (isset($errors['register'])): ?>
                <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">
                    <p class="font-bold"><i class="fa-solid fa-circle-exclamation mr-2"></i>Đăng ký thất bại</p>
                    <p class="text-sm"><?= htmlspecialchars($errors['register']) ?></p>
                </div>
            <?php endif; ?>

            <div class="flex flex-col md:flex-row gap-4">
                <div class="w-full">
                    <input type="text" name="username" placeholder="Họ và tên" required
                        value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '' ?>"
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700">
                    <?php if (isset($errors['username'])): ?>
                        <p class="text-red-500 text-sm mt-1 italic"><i
                                class="fa-solid fa-circle-exclamation mr-1"></i><?php echo $errors['username']; ?></p>
                    <?php endif; ?>
                </div>
            </div>

            <div>
                <input type="email" name="email" placeholder="Email" required
                    value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '' ?>"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700">
                <?php if (isset($errors['email'])): ?>
                    <p class="text-red-500 text-sm mt-1 italic"><i
                            class="fa-solid fa-circle-exclamation mr-1"></i><?php echo $errors['email']; ?></p>
                <?php endif; ?>
            </div>

            <div>
                <input type="text" name="phone" placeholder="Số điện thoại" required
                    value="<?php echo isset($_POST['phone']) ? htmlspecialchars($_POST['phone']) : '' ?>"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700">
                <?php if (isset($errors['phone'])): ?>
                    <p class="text-red-500 text-sm mt-1 italic"><i
                            class="fa-solid fa-circle-exclamation mr-1"></i><?php echo $errors['phone']; ?></p>
                <?php endif; ?>
            </div>

            <div class="relative">
                <input type="password" name="password" id="password-register" placeholder="Mật khẩu" required
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700">
                <span
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    id="togglePasswordRegister">
                    <i class="fa-regular fa-eye"></i>
                </span>
            </div>
            <?php if (isset($errors['password'])): ?>
                <p class="text-red-500 text-sm mt-1 italic"><i
                        class="fa-solid fa-circle-exclamation mr-1"></i><?php echo $errors['password']; ?></p>
            <?php endif; ?>

            <input type="submit" name="submit" value="ĐĂNG KÝ NGAY"
                class="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md mt-2">

            <div class="flex items-center my-4">
                <div class="flex-grow border-t border-gray-200"></div>
                <span class="mx-4 text-gray-400 text-xs font-medium uppercase">HOẶC</span>
                <div class="flex-grow border-t border-gray-200"></div>
            </div>

            <a href="/auth/google"
                class="flex items-center justify-center w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition duration-300 group bg-white">
                <img src="/images/google.png" alt="Google" class="w-5 h-5 mr-3">
                <span class="text-gray-700 font-medium group-hover:text-gray-900">Đăng ký bằng Google</span>
            </a>

            <div class="text-center mt-6">
                <p class="text-gray-500 text-sm">Đã có tài khoản? <a href="/login"
                        class="text-[#5A88FF] font-bold hover:underline">Đăng nhập</a></p>
            </div>
        </form>
    </div>
</div>

<?php
// 3. Kết thúc nội dung chính
$content = ob_get_clean();

// 4. Script riêng cho trang đăng ký
ob_start();
?>
<script>
    const togglePasswordRegister = document.getElementById('togglePasswordRegister');
    const passwordRegister = document.getElementById('password-register');
    if (togglePasswordRegister && passwordRegister) {
        togglePasswordRegister.addEventListener('click', function () {
            const type = passwordRegister.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordRegister.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
</script>
<?php
$scripts = ob_get_clean();

// 5. Gọi LayoutMaster
include __DIR__ . '/../layouts/auth.php';
?>