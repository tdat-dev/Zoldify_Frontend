"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Bell, HelpCircle, ChevronDown, User, Key, MessageSquare, Wallet, ShoppingBag, Plus, Package, ClipboardList, LogOut, Search, ShoppingCart,Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notification.service';
import { productService } from '@/services/product.service';

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadNotis, setUnreadNotis] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(['Laptop', 'Sách', 'Điện thoại', 'Tai nghe', 'Áo thun', 'Giày']);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [pathname, searchParams]);

  useEffect(() => {
    productService.getAll(1, 6, { sort: 'most_viewed' })
      .then((res) => {
        const list = res.data?.data?.result || [];
        const words = list
          .map((p: any) => (p.name || '').split(' ').slice(0, 2).join(' '))
          .filter((w: string) => w.length >= 3)
          .slice(0, 6);
        if (words.length > 0) setTrendingKeywords(words);
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadNotis(res.data?.data?.unread_count || 0);
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-gray-100 border-b border-gray-200 hidden md:block relative z-sticky">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="h-[34px] flex items-center justify-end gap-6 text-[13px] text-gray-700">
            <div className="relative group">
              <Link
                href="/notifications"
                aria-label={unreadNotis > 0 ? `Thông báo, ${unreadNotis} chưa đọc` : 'Thông báo'}
                className="flex items-center gap-1 hover:text-brand transition-colors py-2"
              >
                <div className="relative">
                  <Bell className="w-[18px] h-[18px]" aria-hidden="true" />
                  {unreadNotis > 0 && (
                    <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
                      {unreadNotis}
                    </span>
                  )}
                </div>
                <span>Thông Báo</span>
              </Link>
            </div>

            <a href="mailto:admin@zoldify.com" className="flex items-center gap-1 hover:text-brand transition-colors">
              <HelpCircle className="w-[18px] h-[18px]" aria-hidden="true" />
              <span>Hỗ Trợ</span>
            </a>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-gray-600 font-medium hover:text-brand transition-colors focus:outline-none"
                  >
                    <span>Chào, {user?.full_name || 'Người dùng'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[250px] bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <div className="py-2 border-b border-gray-100">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <User className="w-5 h-5" /> Hồ sơ của tôi
                        </Link>
                        <Link href="/profile/change-password" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <Key className="w-5 h-5" /> Đổi mật khẩu
                        </Link>
                        <Link href="/chat" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <MessageSquare className="w-5 h-5" /> Tin nhắn
                        </Link>
                        <Link href="/profile/wallet" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <Wallet className="w-5 h-5" /> Tiền của tôi
                        </Link>
                        <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <ShoppingBag className="w-5 h-5" /> Đơn mua
                        </Link>
                      </div>

                      <div className="py-2 border-b border-gray-100">
                        <div className="px-4 py-1 text-xs font-bold text-gray-600 uppercase tracking-wider">Bán hàng</div>
                        <Link href="/product/create" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <Plus className="w-5 h-5" /> Thêm sản phẩm
                        </Link>
                        <Link href="/shop" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <Package className="w-5 h-5" /> Tất cả sản phẩm
                        </Link>
                        <Link href="/shop/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <ClipboardList className="w-5 h-5" /> Đơn bán
                        </Link>
                      </div>
                      {user?.role === 'admin' && (
  <div className="py-2 border-b border-gray-100">
    <div className="px-4 py-1 text-xs font-bold text-gray-600 uppercase tracking-wider">Quản trị</div>
    <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand transition-colors" onClick={() => setIsUserMenuOpen(false)}>
      <Shield className="w-5 h-5" /> Admin
    </Link>
  </div>
)}

                      <div className="py-1 bg-gray-50">
                        <button 
                          onClick={() => { setIsUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-5 h-5" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium text-sm">Đăng nhập</Link>
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium text-sm">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <header className="md:hidden w-full z-sticky bg-gradient-to-r from-brand to-brand-accent font-sans sticky top-0">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <form className="flex-1" onSubmit={handleSearchSubmit} role="search">
              <label htmlFor="mobile-search" className="sr-only">Tìm sản phẩm</label>
              <div className="flex items-center bg-white rounded-full h-9 px-3 shadow-sm">
                <Search className="w-4 h-4 text-gray-600" aria-hidden="true" />
                <input
                  id="mobile-search"
                  type="search"
                  name="q"
                  enterKeyHint="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="flex-1 ml-2 text-sm text-gray-700 placeholder-gray-500 focus:outline-none bg-transparent"
                />
              </div>
            </form>
            <Link href="/cart" className="relative p-2" aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : 'Giỏ hàng'}>
              <ShoppingCart className="w-6 h-6 text-white" aria-hidden="true" />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute top-0 right-0 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold border border-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <Link href="/chat" className="relative p-2" aria-label="Tin nhắn">
              <MessageSquare className="w-6 h-6 text-white" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* DESKTOP HEADER */}
      <header className="hidden md:block w-full z-sticky bg-white font-sans shadow-sm sticky top-0">
        <div className="bg-white pb-3">
          <div className="max-w-[1200px] mx-auto px-4 pt-4">
            <div className="flex flex-row items-center gap-8">
              <Link href="/" aria-label="Zoldify — về trang chủ" className="flex items-center gap-2 flex-shrink-0 group no-underline text-2xl font-bold text-brand">
                 <img src="/images/logouni.png" alt="Zoldify" className="h-10 w-auto" />
              </Link>

              <div className="flex-1 relative">
                <form
                  onSubmit={handleSearchSubmit}
                  role="search"
                  className="flex h-[44px] border border-gray-300 rounded-lg overflow-hidden hover:border-brand focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition-all"
                >
                  <label htmlFor="desktop-search" className="sr-only">Tìm sản phẩm</label>
                  <input
                    id="desktop-search"
                    type="search"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm giáo trình, đồ gia dụng, quần áo..."
                    className="flex-1 px-4 text-sm text-[#333] placeholder-gray-500 focus:outline-none bg-transparent"
                  />
                  <button type="submit" aria-label="Tìm kiếm" className="w-[70px] bg-gradient-to-b from-brand to-brand-accent flex items-center justify-center hover:opacity-90 transition-opacity">
                    <Search className="w-5 h-5 text-white" aria-hidden="true" />
                  </button>
                </form>
                <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-gray-600 pl-1 justify-start">
                  {trendingKeywords.map((kw) => (
                    <Link
                      key={kw}
                      href={`/search?q=${encodeURIComponent(kw)}`}
                      onClick={(e) => {
                        if (pathname === '/search' && searchParams.get('q') === kw) {
                          e.preventDefault();
                          window.location.reload();
                        }
                      }}
                      className="inline-block py-1 hover:text-brand cursor-pointer"
                    >
                      {kw}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-8 flex-shrink-0">
                <Link href="/cart" aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : 'Giỏ hàng'} className="relative group p-1">
                  <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-brand transition-colors" aria-hidden="true" />
                  {cartCount > 0 && (
                    <span aria-hidden="true" className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/product/create" className="px-6 py-2.5 bg-gradient-to-r from-brand to-brand-accent text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform flex items-center gap-2 no-underline">
                  <Plus className="w-4 h-4" />
                  <span>Đăng Bán</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
