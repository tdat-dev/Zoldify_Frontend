import http from '@/lib/http';

export const authService = {
  login(email: string, password: string) {
    return http.post('/auth/login', { email, password });
  },
  register(full_name: string, email: string, password: string, phone_number?: string) {
    return http.post('/auth/register', { full_name, email, password, phone_number });
  },
  sendRegisterOtp(full_name: string, email: string) {
    return http.post('/auth/register/send-otp', { full_name, email });
  },
  verifyRegisterOtp(email: string, otp: string, password: string) {
    return http.post('/auth/register/verify-otp', { email, otp, password });
  },
  getProfile() {
    return http.get('/auth/profile');
  },

  /**
   * Quên mật khẩu — HAI bước, không phải ba.
   *
   * Backend gộp "xác thực OTP" và "đặt mật khẩu mới" vào một lần gọi
   * (auth.controller.ts:152, ResetPasswordDto = email + otp + newPassword).
   * Không có endpoint chỉ để kiểm OTP, nên không thể có một trang
   * /reset-password đứng riêng — trang đó sẽ không có email lẫn otp trong tay.
   */
  sendForgotPasswordOtp(email: string) {
    return http.post('/auth/forgot-password/send-otp', { email });
  },
  resetPassword(email: string, otp: string, newPassword: string) {
    return http.post('/auth/forgot-password/reset', { email, otp, newPassword });
  },
};
