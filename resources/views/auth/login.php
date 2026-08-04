<?php
// 1. Đặt tiêu đề cho trang này
$title = "Đăng nhập - Zoldify";

// 2. Bắt đầu ghi nhớ nội dung HTML bên dưới (chưa in ra màn hình ngay)
ob_start();
?>

<!-- NỘI DUNG CHÍNH (Chỉ cần phần cái khung trắng và ảnh) -->
<div class="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10">

    <!-- Cột Ảnh bên trái -->
    <div class="hidden lg:flex items-center justify-center w-[55%]">
        <img src="/images/homepage-text.png" alt="Zoldify Illustration"
            class="w-full h-auto object-contain drop-shadow-2xl no-drag" draggable="false">
    </div>

    <!-- Cột Form bên phải -->
    <div class="w-full lg:w-[40%] max-w-[450px] bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div class="text-center mb-6">
            <h2 class="text-3xl font-bold text-gray-800">Chào mừng trở lại!</h2>
            <p class="text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục mua sắm</p>
        </div>

        <form action="/login" method="post" class="space-y-4">
            <?php if (isset($_SESSION['success'])): ?>
            <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-r-lg" role="alert">
                <p class="font-bold"><i class="fa-solid fa-circle-check mr-2"></i>Thành công</p>
                <p class="text-sm">
                    <?= htmlspecialchars($_SESSION['success']) ?>
                </p>
            </div>
            <?php unset($_SESSION['success']); ?>
            <?php endif; ?>
            <!-- (Giữ nguyên code hiển thị lỗi PHP cũ của em ở đây) -->
            <?php if (isset($errors['login'])): ?>
            <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-r-lg" role="alert">
                <p class="font-bold"><i class="fa-solid fa-circle-exclamation mr-2"></i>Đăng nhập thất bại</p>
                <p class="text-sm"><?= htmlspecialchars($errors['login']) ?></p>
            </div>
            <?php endif; ?>

            <div>
                <input type="text" name="username" placeholder="Email hoặc Số điện thoại" required
                    value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '' ?>"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
            </div>

            <div class="relative">
                <input type="password" name="password" id="password" placeholder="Mật khẩu" required
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                <span
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                    id="togglePassword">
                    <i class="fa-regular fa-eye"></i>
                </span>
            </div>

            <input type="submit" name="submit" value="ĐĂNG NHẬP"
                class="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md uppercase tracking-wide text-sm">

            <div class="text-center pt-2">
                <a href="/forgot-password" class="text-[#5A88FF] hover:text-blue-700 text-sm font-medium">Quên mật
                    khẩu?</a>
            </div>

            <!-- Separator -->
            <div class="flex items-center my-4">
                <div class="flex-grow border-t border-gray-200"></div>
                <span class="mx-4 text-gray-400 text-xs font-medium uppercase">HOẶC</span>
                <div class="flex-grow border-t border-gray-200"></div>
            </div>

            <button type="button" id="googleLoginBtn"
                class="flex items-center justify-center w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition duration-300 group bg-white">
                <img src="/images/google.png" alt="Google" class="w-5 h-5 mr-3">
                <span class="text-gray-700 font-medium group-hover:text-gray-900">Đăng nhập bằng Google</span>
            </button>

            <div class="text-center mt-6">
                <p class="text-gray-500 text-sm">Chưa có tài khoản? <a href="/register"
                        class="text-[#5A88FF] font-bold hover:underline">Đăng ký ngay</a></p>
            </div>
        </form>
    </div>
</div>

<?php
// 3. Kết thúc ghi nhớ, lấy toàn bộ nội dung HTML ở trên ném vào biến $content
$content = ob_get_clean();

// 4. Định nghĩa Scripts riêng cho trang này (nếu có muốn tách ra cho gọn)
ob_start();
?>
<!-- Firebase SDK -->
<script type="module">
import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Firebase config - lấy từ .env qua PHP
const firebaseConfig = {
    apiKey: "<?= $_ENV['FIREBASE_API_KEY'] ?? '' ?>",
    authDomain: "<?= $_ENV['FIREBASE_AUTH_DOMAIN'] ?? '' ?>",
    projectId: "<?= $_ENV['FIREBASE_PROJECT_ID'] ?? '' ?>",
    storageBucket: "<?= $_ENV['FIREBASE_STORAGE_BUCKET'] ?? '' ?>",
    messagingSenderId: "<?= $_ENV['FIREBASE_MESSAGING_SENDER_ID'] ?? '' ?>",
    appId: "<?= $_ENV['FIREBASE_APP_ID'] ?? '' ?>",
    measurementId: "<?= $_ENV['FIREBASE_MEASUREMENT_ID'] ?? '' ?>"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Xử lý click nút Google Login
document.getElementById('googleLoginBtn').addEventListener('click', async function() {
    const btn = this;
    const originalText = btn.querySelector('span').textContent;

    try {
        // Hiển thị loading
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Đang xử lý...';

        // Mở popup Google Sign-In
        const result = await signInWithPopup(auth, provider);

        // Lấy ID token từ Firebase
        const idToken = await result.user.getIdToken();

        // Gửi token về backend để xác thực
        const response = await fetch('/auth/firebase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken: idToken
            })
        });

        const data = await response.json();

        if (data.success) {
            // Đăng nhập thành công → redirect
            window.location.href = data.redirect || '/';
        } else {
            // Hiển thị lỗi
            alert(data.message || 'Đăng nhập thất bại');
            btn.disabled = false;
            btn.querySelector('span').textContent = originalText;
        }

    } catch (error) {
        console.error('Google Sign-In Error:', error);

        // Xử lý các loại lỗi
        if (error.code === 'auth/popup-closed-by-user') {
            // User đóng popup, không cần thông báo
        } else if (error.code === 'auth/cancelled-popup-request') {
            // Popup bị cancel
        } else if (error.code === 'auth/unauthorized-domain') {
            alert('Lỗi Cấu Hình Firebase: Tên miền "' + window.location.hostname +
                '" chưa được thêm vào Authorized Domains trong Firebase Console.');
        } else {
            alert('Đăng nhập Google thất bại. Vui lòng thử lại. Lỗi: ' + error.message);
        }

        btn.disabled = false;
        btn.querySelector('span').textContent = originalText;
    }
});
</script>

<script>
// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');
if (togglePassword && password) {
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
}
</script>
<?php
$scripts = ob_get_clean();

// 5. Gọi Layout Master ra và "đổ" dữ liệu vào
include __DIR__ . '/../layouts/auth.php';
?>