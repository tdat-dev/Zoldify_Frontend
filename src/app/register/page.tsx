"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.sendRegisterOtp(formData.username, formData.email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.verifyRegisterOtp(formData.email, otp, formData.password);
      router.push('/login?registered=1');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10 py-10">

      {/* Cột Ảnh bên trái */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[55%]">
        <img src="/images/homepage-text.png" alt="Zoldify Illustration" className="w-full h-auto object-contain drop-shadow-2xl" draggable={false} />
        <div className="mt-8 text-center text-gray-800">
          <p className="text-3xl font-bold mb-2">Tham gia Zoldify</p>
          <p className="text-blue-700 text-lg">Cộng đồng trao đổi đồ cũ</p>
        </div>
      </div>

      {/* Cột Form bên phải */}
      <div className="w-full lg:w-[45%] max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {step === 1 ? 'Tạo tài khoản mới' : 'Xác thực OTP'}
          </h1>
          {step === 2 && (
            <p className="text-gray-600 mt-2 text-sm">
              Mã xác thực đã được gửi đến email <br/> 
              <span className="font-semibold text-blue-600">{formData.email}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="w-full">
              <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
              <input
                id="reg-username"
                type="text"
                name="username"
                autoComplete="name"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Số điện thoại <span className="font-normal text-gray-600">(tuỳ chọn)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>

            <div className="relative">
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-2 top-[38px] p-2 cursor-pointer text-gray-600 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md mt-2 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'TIẾP TỤC'}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Đã có tài khoản? <Link href="/login" className="text-brand font-bold hover:underline">Đăng nhập</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-6">
            <div>
              <label htmlFor="reg-otp" className="block text-sm font-medium text-gray-700 mb-1.5">Mã OTP 6 số</label>
              <input
                id="reg-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-2xl tracking-widest font-mono" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md mt-2 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'XÁC THỰC OTP'}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-gray-600 text-sm hover:text-gray-700 underline"
              >
                Quay lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
