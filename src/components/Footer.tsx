"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Bell, Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      {/* Footer - hiện trên cả mobile; pb-20 để không bị bottom nav che */}
      <footer className="bg-white border-t border-gray-200 py-[30px] pb-24 md:pb-[30px]">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 py-4 md:py-[30px]">
            {/* Service */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">MUA VÀ BÁN</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><Link href="/search" className="hover:text-brand transition-colors">Tìm sản phẩm</Link></li>
                <li><Link href="/product/create" className="hover:text-brand transition-colors">Đăng bán đồ cũ</Link></li>
                <li><Link href="/profile/orders" className="hover:text-brand transition-colors">Đơn mua của tôi</Link></li>
                <li><Link href="/shop/orders" className="hover:text-brand transition-colors">Đơn bán của tôi</Link></li>
                <li><Link href="/profile/wallet" className="hover:text-brand transition-colors">Ví Zoldify</Link></li>
              </ul>
            </div>

            {/* Pay */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">THANH TOÁN</h3>
              {/* Liệt kê bằng chữ đúng những gì trang checkout thật sự hỗ trợ.
                  Trước đây là logo Visa/Mastercard/JCB hotlink từ Wikimedia. */}
              <ul className="space-y-3 text-sm text-gray-700">
                <li>Thanh toán khi nhận hàng (COD)</li>
                <li>Ví Zoldify</li>
                <li>Thẻ ATM nội địa, thẻ quốc tế và QR qua PayOS</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wide">LIÊN HỆ</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-700" aria-hidden="true" />
                  <a href="mailto:admin@zoldify.com" className="hover:text-brand transition-colors">admin@zoldify.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-gray-700" aria-hidden="true" />
                  <Link href="/chat" className="hover:text-brand transition-colors">Nhắn tin với người bán</Link>
                </li>
                <li className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-700" aria-hidden="true" />
                  <Link href="/notifications" className="hover:text-brand transition-colors">Thông báo của tôi</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="text-center text-sm text-gray-700">
            <p>© {new Date().getFullYear()} Zoldify. Tất cả các quyền được bảo lưu.</p>
            <p className="mt-1">Quốc gia & Khu vực: Việt Nam</p>
            <p className="mt-1">Email: admin@zoldify.com</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation - Like Shopee/Lazada */}
      <nav aria-label="Điều hướng chính" className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-sticky pb-safe">
        <div className="flex h-16">
          {/* Trang chủ */}
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname === '/' || pathname === '/home' ? 'text-brand' : 'text-gray-600'}`}>
            <Home className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Trang chủ</span>
          </Link>

          {/* Tìm kiếm */}
          <Link href="/search" aria-current={pathname.startsWith('/search') ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname.startsWith('/search') ? 'text-brand' : 'text-gray-600'}`}>
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Tìm kiếm</span>
          </Link>

          {/* Đăng bán - Nút nổi bật */}
          <Link href="/product/create" className="w-1/5 flex flex-col items-center justify-center gap-0.5 -mt-2 text-brand">
            <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-accent rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <Plus className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold">Đăng bán</span>
          </Link>

          {/* Chat */}
          <Link href="/chat" aria-current={pathname.startsWith('/chat') ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname.startsWith('/chat') ? 'text-brand' : 'text-gray-600'}`}>
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Chat</span>
          </Link>

          {/* Tài khoản */}
          <Link href="/profile" aria-current={pathname.startsWith('/profile') ? 'page' : undefined} className={`w-1/5 flex flex-col items-center justify-center gap-0.5 ${pathname.startsWith('/profile') ? 'text-brand' : 'text-gray-600'}`}>
            <User className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Tài khoản</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
