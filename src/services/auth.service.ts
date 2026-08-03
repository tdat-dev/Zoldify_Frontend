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
};
