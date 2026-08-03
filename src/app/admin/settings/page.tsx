"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold text-blue-500">Zoldify Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li><Link href="/admin" className="flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Tổng quan</Link></li>
            <li><Link href="/admin/products" className="flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Sản phẩm</Link></li>
            <li><Link href="/admin/orders" className="flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Đơn hàng</Link></li>
            <li><Link href="/admin/users" className="flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Người dùng</Link></li>
            <li><Link href="/admin/settings" className="flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white">Cài đặt</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Placeholder */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Cài đặt hệ thống</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex min-w-max">
                  {['general', 'contact', 'email', 'payment', 'maintenance'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab === 'general' ? 'Thông tin chung' : 
                       tab === 'contact' ? 'Liên hệ' : 
                       tab === 'email' ? 'Email SMTP' : 
                       tab === 'payment' ? 'Thanh toán' : 'Bảo trì'}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                
                {/* General Settings */}
                {activeTab === 'general' && (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên Website</label>
                        <input type="text" defaultValue="Zoldify" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả Website</label>
                        <input type="text" defaultValue="Chợ đồ cũ sinh viên" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <button type="button" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Lưu thay đổi</button>
                  </form>
                )}

                {/* Maintenance Settings */}
                {activeTab === 'maintenance' && (
                  <div className="space-y-6">
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Chế độ bảo trì</h3>
                          <p className="text-sm text-gray-500 mt-1">Khi bật, người dùng sẽ không thể truy cập website</p>
                        </div>
                        <button type="button" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                          BẬT bảo trì
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Other Tabs Placeholder */}
                {(activeTab === 'contact' || activeTab === 'email' || activeTab === 'payment') && (
                  <div className="text-gray-500 text-sm">Nội dung cài đặt cho {activeTab} đang được xây dựng...</div>
                )}
                
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
