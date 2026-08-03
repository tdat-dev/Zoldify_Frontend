"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Package, Wallet, MapPin, Key } from 'lucide-react';
import http from '@/lib/http';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user.service';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(authUser?.full_name || '');
  const [email] = useState(authUser?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
  if (!authUser) return;
  setSaving(true);
  try {
    const res = await http.patch('/auth/profile', { full_name: fullName });
    const updatedUser = res.data.data;
    updateUser(updatedUser);
    toast('Cập nhật thành công', 'success');
  } catch (err: any) {
    toast(err.response?.data?.message || 'Cập nhật thất bại', 'error');
  } finally {
    setSaving(false);
  }
};



  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between overflow-x-auto">
           <div className="flex gap-4">
             <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md whitespace-nowrap">
               <User className="w-4 h-4" /> Thông tin cá nhân
             </Link>
             <Link href="/profile/orders" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
               <Package className="w-4 h-4" /> Đơn hàng
             </Link>
             <Link href="/profile/wallet" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
               <Wallet className="w-4 h-4" /> Ví & Thanh toán
             </Link>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b">Thông tin cá nhân</h2>

          <div className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <Link href="/profile/change-password" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Key className="w-4 h-4" />
                  Đổi mật khẩu
                </Link>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng</label>
                <Link href="/addresses" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Quản lý địa chỉ giao hàng
                </Link>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
