"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const { toast } = useToast();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp) {
      toast("Xác thực thành công. Chuyển đến trang đặt lại mật khẩu...", 'success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-10">

        {/* Image Column */}
        <div className="hidden lg:flex items-center justify-center w-[55%]">
          <img src="/images/auth-art.webp" alt="Zoldify" className="w-full h-auto object-contain drop-shadow-2xl opacity-50" draggable="false" />
        </div>

        {/* Form Column */}
        <div className="w-full lg:w-[40%] max-w-[450px] bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          
          {step === 2 ? (
            /* STEP 2: VERIFY OTP */
            <>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Xác thực OTP</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Nhập mã code 6 số đã được gửi tới email <br />
                  <span className="font-semibold text-blue-500">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP 6 số" required maxLength={6} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-2xl tracking-widest font-mono" />
                </div>

                <button type="submit" className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md uppercase tracking-wide text-sm">
                  XÁC NHẬN
                </button>

                <div className="text-center pt-2 flex justify-between items-center text-sm">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-700">Quay lại email</button>
                  <button type="button" className="text-brand hover:text-blue-700 font-medium">Gửi lại mã?</button>
                </div>
              </form>
            </>
          ) : (
            /* STEP 1: ENTER EMAIL */
            <>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Quên mật khẩu?</h2>
                <p className="text-gray-600 text-sm mt-1">Đừng lo! Nhập email của bạn để lấy lại mật khẩu.</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">Email đăng ký</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>

                <button type="submit" className="w-full bg-brand text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-300 shadow-md uppercase tracking-wide text-sm">
                  GỬI MÃ XÁC THỰC
                </button>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
