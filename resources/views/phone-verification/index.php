<?php
/**
 * Phone Verification View
 * 
 * Xác minh số điện thoại bằng Firebase Phone Auth.
 * Firebase sẽ xử lý toàn bộ OTP flow phía client.
 */
$title = "Xác minh số điện thoại - Zoldify";

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
            <div class="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-mobile-screen-button text-3xl text-blue-500"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Xác minh số điện thoại</h2>
            <p class="text-gray-500 text-sm mt-2">
                <?= htmlspecialchars($message ?? 'Vui lòng xác minh số điện thoại để tiếp tục') ?>
            </p>
        </div>

        <!-- Step 1: Nhập SĐT -->
        <div id="step-phone" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <div class="flex">
                    <span
                        class="inline-flex items-center px-4 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                        +84
                    </span>
                    <input type="tel" id="phoneNumber" placeholder="901234567"
                        value="<?= htmlspecialchars(ltrim($currentPhone ?? '', '0')) ?>"
                        class="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        maxlength="10">
                </div>
                <p class="text-xs text-gray-400 mt-1">Nhập số điện thoại không bao gồm số 0 đầu</p>
            </div>

            <!-- reCAPTCHA container - Firebase cần element này -->
            <div id="recaptcha-container"></div>

            <button type="button" id="sendOtpBtn"
                class="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 cursor-pointer shadow-md">
                <span>Gửi mã OTP</span>
            </button>
        </div>

        <!-- Step 2: Nhập OTP -->
        <div id="step-otp" class="space-y-4 hidden">
            <div class="text-center mb-4">
                <p class="text-sm text-gray-600">
                    Mã OTP đã được gửi đến <span id="sentPhoneDisplay" class="font-semibold text-blue-600"></span>
                </p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nhập mã OTP</label>
                <div class="flex justify-center gap-2" id="otpInputs">
                    <input type="text" maxlength="1"
                        class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-index="0">
                    <input type="text" maxlength="1"
                        class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-index="1">
                    <input type="text" maxlength="1"
                        class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-index="2">
                    <input type="text" maxlength="1"
                        class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-index="3">
                    <input type="text" maxlength="1"
                        class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-index="4">
                    <input type="text" maxlength="1"
                        class="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-index="5">
                </div>
            </div>

            <button type="button" id="verifyOtpBtn"
                class="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition duration-300 cursor-pointer shadow-md">
                <span>Xác minh</span>
            </button>

            <div class="text-center">
                <button type="button" id="resendOtpBtn"
                    class="text-blue-500 text-sm hover:underline disabled:text-gray-400 disabled:no-underline" disabled>
                    Gửi lại mã (<span id="countdown">60</span>s)
                </button>
            </div>

            <button type="button" id="changePhoneBtn" class="w-full text-gray-500 text-sm hover:underline">
                ← Đổi số điện thoại
            </button>
        </div>

        <!-- Error message -->
        <div id="errorMessage" class="hidden mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
            <p class="text-sm" id="errorText"></p>
        </div>

        <!-- Success message -->
        <div id="successMessage"
            class="hidden mt-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg">
            <p class="text-sm"><i class="fa-solid fa-circle-check mr-2"></i>Xác minh thành công! Đang chuyển hướng...
            </p>
        </div>
    </div>
</div>

<?php
$content = ob_get_clean();

ob_start();
?>

<!-- Firebase SDK -->
<script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
    import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

    // Firebase config từ .env
    const firebaseConfig = {
        apiKey: "<?= $_ENV['FIREBASE_API_KEY'] ?? '' ?>",
        authDomain: "<?= $_ENV['FIREBASE_AUTH_DOMAIN'] ?? '' ?>",
        projectId: "<?= $_ENV['FIREBASE_PROJECT_ID'] ?? '' ?>",
        storageBucket: "<?= $_ENV['FIREBASE_STORAGE_BUCKET'] ?? '' ?>",
        messagingSenderId: "<?= $_ENV['FIREBASE_MESSAGING_SENDER_ID'] ?? '' ?>",
        appId: "<?= $_ENV['FIREBASE_APP_ID'] ?? '' ?>"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Đặt ngôn ngữ tiếng Việt cho Firebase
    auth.languageCode = 'vi';

    let confirmationResult = null;
    let countdownInterval = null;

    // DOM Elements
    const stepPhone = document.getElementById('step-phone');
    const stepOtp = document.getElementById('step-otp');
    const phoneInput = document.getElementById('phoneNumber');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const changePhoneBtn = document.getElementById('changePhoneBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const successMessage = document.getElementById('successMessage');
    const sentPhoneDisplay = document.getElementById('sentPhoneDisplay');
    const otpInputs = document.querySelectorAll('#otpInputs input');

    // Khởi tạo reCAPTCHA
    function setupRecaptcha() {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved
            },
            'expired-callback': () => {
                showError('reCAPTCHA hết hạn. Vui lòng thử lại.');
            }
        });
    }

    // Hiển thị lỗi
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        successMessage.classList.add('hidden');
    }

    // Ẩn lỗi
    function hideError() {
        errorMessage.classList.add('hidden');
    }

    // Format số điện thoại thành +84xxx
    function formatPhoneNumber(phone) {
        // Xóa khoảng trắng và ký tự đặc biệt
        phone = phone.replace(/[\s\-]/g, '');

        // Nếu bắt đầu bằng 0, bỏ 0 đi
        if (phone.startsWith('0')) {
            phone = phone.substring(1);
        }

        return '+84' + phone;
    }

    // Gửi OTP
    async function sendOtp() {
        hideError();

        const phone = phoneInput.value.trim();
        if (!phone || phone.length < 9) {
            showError('Vui lòng nhập số điện thoại hợp lệ');
            return;
        }

        const formattedPhone = formatPhoneNumber(phone);

        sendOtpBtn.disabled = true;
        sendOtpBtn.querySelector('span').textContent = 'Đang gửi...';

        try {
            if (!window.recaptchaVerifier) {
                setupRecaptcha();
            }

            confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);

            // Chuyển sang step OTP
            stepPhone.classList.add('hidden');
            stepOtp.classList.remove('hidden');
            sentPhoneDisplay.textContent = formattedPhone;

            // Focus vào ô OTP đầu tiên
            otpInputs[0].focus();

            // Bắt đầu countdown
            startCountdown();

        } catch (error) {
            console.error('Send OTP Error:', error);

            let errorMsg = 'Không thể gửi OTP. Vui lòng thử lại.';

            if (error.code === 'auth/invalid-phone-number') {
                errorMsg = 'Số điện thoại không hợp lệ';
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errorMsg = 'Xác thực reCAPTCHA thất bại. Vui lòng tải lại trang.';
            } else if (error.code === 'auth/billing-not-enabled') {
                errorMsg = 'Lỗi hệ thống: Firebase chưa bật Billing. Vui lòng thử lại bằng số điện thoại test (VD: 0900000000).';
            }

            showError(errorMsg);

            // Reset reCAPTCHA
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }

        sendOtpBtn.disabled = false;
        sendOtpBtn.querySelector('span').textContent = 'Gửi mã OTP';
    }

    // Lấy OTP từ các input
    function getOtpValue() {
        let otp = '';
        otpInputs.forEach(input => {
            otp += input.value;
        });
        return otp;
    }

    // Xác minh OTP
    async function verifyOtp() {
        hideError();

        const otp = getOtpValue();
        if (otp.length !== 6) {
            showError('Vui lòng nhập đủ 6 số OTP');
            return;
        }

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.querySelector('span').textContent = 'Đang xác minh...';

        try {
            // Xác minh OTP với Firebase
            const result = await confirmationResult.confirm(otp);

            // Lấy số điện thoại đã xác minh
            const verifiedPhone = result.user.phoneNumber;

            // Gửi về backend để cập nhật DB
            const response = await fetch('/verify-phone/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: verifiedPhone
                })
            });

            const data = await response.json();

            if (data.success) {
                successMessage.classList.remove('hidden');
                stepOtp.classList.add('hidden');

                // Redirect sau 1.5s
                setTimeout(() => {
                    window.location.href = data.redirect || '/';
                }, 1500);
            } else {
                showError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            }

        } catch (error) {
            console.error('Verify OTP Error:', error);

            let errorMsg = 'Mã OTP không đúng. Vui lòng thử lại.';

            if (error.code === 'auth/invalid-verification-code') {
                errorMsg = 'Mã OTP không đúng';
            } else if (error.code === 'auth/code-expired') {
                errorMsg = 'Mã OTP đã hết hạn. Vui lòng gửi lại.';
            }

            showError(errorMsg);
        }

        verifyOtpBtn.disabled = false;
        verifyOtpBtn.querySelector('span').textContent = 'Xác minh';
    }

    // Countdown gửi lại
    function startCountdown() {
        let seconds = 60;
        const countdownEl = document.getElementById('countdown');

        resendOtpBtn.disabled = true;

        countdownInterval = setInterval(() => {
            seconds--;
            countdownEl.textContent = seconds;

            if (seconds <= 0) {
                clearInterval(countdownInterval);
                resendOtpBtn.disabled = false;
                resendOtpBtn.innerHTML = 'Gửi lại mã';
            }
        }, 1000);
    }

    // Gửi lại OTP
    async function resendOtp() {
        // Reset reCAPTCHA
        if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
        }

        await sendOtp();
    }

    // Quay lại step nhập SĐT
    function changePhone() {
        stepOtp.classList.add('hidden');
        stepPhone.classList.remove('hidden');
        hideError();

        // Clear OTP inputs
        otpInputs.forEach(input => input.value = '');

        // Clear countdown
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }

    // Event listeners
    sendOtpBtn.addEventListener('click', sendOtp);
    verifyOtpBtn.addEventListener('click', verifyOtp);
    resendOtpBtn.addEventListener('click', resendOtp);
    changePhoneBtn.addEventListener('click', changePhone);

    // Enter key để submit
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendOtp();
    });

    // Auto-focus và auto-submit cho OTP inputs
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Chỉ cho phép số
            if (!/^\d*$/.test(value)) {
                e.target.value = '';
                return;
            }

            // Auto-focus sang ô tiếp theo
            if (value && index < 5) {
                otpInputs[index + 1].focus();
            }

            // Auto-verify khi nhập đủ 6 số
            if (getOtpValue().length === 6) {
                verifyOtp();
            }
        });

        // Backspace để quay lại ô trước
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        // Paste OTP
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

            pastedData.split('').forEach((char, i) => {
                if (otpInputs[i]) {
                    otpInputs[i].value = char;
                }
            });

            if (pastedData.length === 6) {
                verifyOtp();
            }
        });
    });

    // Init reCAPTCHA khi trang load
    setupRecaptcha();
</script>

<?php
$scripts = ob_get_clean();

include __DIR__ . '/../layouts/auth.php';
?>