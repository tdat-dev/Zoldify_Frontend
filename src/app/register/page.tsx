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
          <h3 className="text-3xl font-bold mb-2">Tham gia Zoldify</h3>
          <p className="text-blue-600 text-lg">Cộng đồng trao đổi đồ cũ</p>
        </div>
      </div>

      {/* Cột Form bên phải */}
      <div className="w-full lg:w-[45%] max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 ? 'Tạo tài khoản mới' : 'Xác thực OTP'}
          </h2>
          {step === 2 && (
            <p className="text-gray-500 mt-2 text-sm">
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
              <input 
                type="text" 
                name="username" 
                placeholder="Họ và tên" 
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>

            <div>
              <input 
                type="text" 
                name="phone" 
                placeholder="Số điện thoại (Tuỳ chọn)" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>

            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Mật khẩu" 
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md mt-2 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'TIẾP TỤC'}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Đã có tài khoản? <Link href="/login" className="text-[#5A88FF] font-bold hover:underline">Đăng nhập</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-6">
            <div>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Nhập mã OTP 6 số" 
                required 
                maxLength={6} 
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-2xl tracking-widest font-mono" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md mt-2 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'XÁC THỰC OTP'}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-gray-500 text-sm hover:text-gray-700 underline"
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
