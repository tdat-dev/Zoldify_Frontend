"use client";

import React from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 text-sm mt-2">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Mật khẩu mới</label>
            <input type="password" placeholder="Tối thiểu 6 ký tự" required minLength={6} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Xác nhận mật khẩu</label>
            <input type="password" placeholder="Nhập lại mật khẩu mới" required minLength={6} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
          </div>

          <button type="submit" className="w-full bg-[#5A88FF] text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition shadow-md uppercase text-sm mt-4">
            ĐẶT LẠI MẬT KHẨU
          </button>
        </form>

      </div>
    </div>
  );
}
