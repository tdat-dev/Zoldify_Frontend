"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Package, ShoppingCart, DollarSign, Plus, List, ChevronRight, History, Loader2, FolderOpen } from 'lucide-react';
import { orderService } from '@/services/order.service';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ total_users: 0, total_products: 0, total_orders: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      orderService.getStats()
        .then((res) => setStats(res.data.data || res.data))
        .catch(() => { })
        .finally(() => setLoading(false));
    };
    fetchStats();
    const handler = () => fetchStats();
    window.addEventListener('admin-stats-refresh', handler);
    const interval = setInterval(fetchStats, 30000);
    return () => {
      window.removeEventListener('admin-stats-refresh', handler);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-600 text-sm mt-1">Chào mừng trở lại, Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Tổng Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_users.toLocaleString('vi-VN')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Tổng Sản phẩm</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_products.toLocaleString('vi-VN')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Đơn hàng</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_orders.toLocaleString('vi-VN')}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Doanh thu</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total_revenue.toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Hành động nhanh</h2>
          <div className="flex flex-col gap-3">
            <Link href="/product/create" className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Thêm sản phẩm</h4>
                <p className="text-xs text-gray-600">Tạo sản phẩm mới</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-gray-600" />
            </Link>

            <Link href="/admin/users" className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Quản lý Users</h4>
                <p className="text-xs text-gray-600">Danh sách người dùng</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-gray-600" />
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Quản lý Danh mục</h4>
                <p className="text-xs text-gray-600">Thêm, sửa, xóa danh mục</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-gray-600" />
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                <List className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Xem đơn hàng</h4>
                <p className="text-xs text-gray-600">Kiểm tra đơn mới</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-600 group-hover:text-gray-600" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-600">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">Chưa có hoạt động nào</h3>
            <p className="text-gray-600 text-sm max-w-xs">
              Các hoạt động mới sẽ xuất hiện tại đây khi hệ thống bắt đầu vận hành.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
