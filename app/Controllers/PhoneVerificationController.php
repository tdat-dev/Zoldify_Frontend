<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\User;

/**
 * Phone Verification Controller
 * 
 * Xử lý xác minh số điện thoại bằng Firebase Phone Auth.
 * 
 * Flow:
 * 1. User vào trang /verify-phone
 * 2. Nhập SĐT → Firebase gửi OTP tự động
 * 3. User nhập OTP → Firebase verify phía client
 * 4. Client gọi /verify-phone/confirm với token
 * 5. Backend verify token và cập nhật DB
 * 
 * @package App\Controllers
 */
class PhoneVerificationController extends BaseController
{
    /**
     * Hiển thị trang xác minh SĐT
     */
    public function show(): void
    {
        $user = $this->requireAuth();

        // Đã verify rồi → redirect
        if (!empty($user['phone_verified'])) {
            $redirectTo = $_SESSION['redirect_after_phone_verification'] ?? '/profile';
            unset($_SESSION['redirect_after_phone_verification']);
            $this->redirect($redirectTo);
        }

        $this->view('phone-verification/index', [
            'user' => $user,
            'message' => $_SESSION['phone_verification_message'] ?? null,
            'currentPhone' => $user['phone_number'] ?? '',
        ]);

        unset($_SESSION['phone_verification_message']);
    }

    /**
     * Xác nhận xác minh thành công từ Firebase
     * 
     * Client gọi API này sau khi Firebase verify OTP thành công.
     * Truyền lên: phoneNumber đã xác minh
     */
    public function confirm(): void
    {
        $user = $this->requireAuth();
        $userId = (int) $user['id'];

        // Chỉ accept POST request
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonError('Method not allowed', 405);
            return;
        }

        $input = $this->getJsonInput();
        $phoneNumber = $input['phoneNumber'] ?? '';

        // Validate phone number format (Vietnam)
        if (!$this->isValidVietnamesePhone($phoneNumber)) {
            $this->jsonError('Số điện thoại không hợp lệ');
            return;
        }

        // Normalize phone number (remove +84, convert to 0)
        $normalizedPhone = $this->normalizePhoneNumber($phoneNumber);

        // Update database
        $userModel = new User();
        $success = $userModel->markPhoneAsVerified($userId, $normalizedPhone);

        if (!$success) {
            $this->jsonError('Không thể cập nhật thông tin. Vui lòng thử lại.');
            return;
        }

        // Update session
        $_SESSION['user']['phone_number'] = $normalizedPhone;
        $_SESSION['user']['phone_verified'] = 1;

        // Get redirect URL
        $redirectTo = $_SESSION['redirect_after_phone_verification'] ?? '/profile';
        unset($_SESSION['redirect_after_phone_verification']);

        $this->jsonSuccess('Xác minh số điện thoại thành công!', [
            'redirect' => $redirectTo
        ]);
    }

    /**
     * Validate số điện thoại Việt Nam
     * 
     * Chấp nhận các format:
     * - 0901234567 (local)
     * - +84901234567 (international)
     * - 84901234567 (without +)
     */
    private function isValidVietnamesePhone(string $phone): bool
    {
        // Remove spaces and dashes
        $phone = preg_replace('/[\s\-]/', '', $phone);

        // Pattern: +84 or 84 or 0, followed by 9-10 digits
        $pattern = '/^(\+?84|0)(3|5|7|8|9)[0-9]{8}$/';

        return (bool) preg_match($pattern, $phone);
    }

    /**
     * Normalize số điện thoại về format 0xxxxxxxxx
     */
    private function normalizePhoneNumber(string $phone): string
    {
        // Remove spaces, dashes
        $phone = preg_replace('/[\s\-]/', '', $phone);

        // Remove +84 or 84 prefix, add 0
        if (str_starts_with($phone, '+84')) {
            $phone = '0' . substr($phone, 3);
        } elseif (str_starts_with($phone, '84') && strlen($phone) > 10) {
            $phone = '0' . substr($phone, 2);
        }

        return $phone;
    }
}
