"use client";

import React from 'react';
import Link from 'next/link';

export default function ChangePasswordPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Profile Tabs Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex gap-4 overflow-x-auto">
          <Link href="/profile" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">Thông tin cá nhân</Link>
          <Link href="/profile/change-password" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md whitespace-nowrap">Đổi mật khẩu</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>

            <form className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input type="password" required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="flex items-center gap-4">
                <button type="button" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
