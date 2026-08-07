"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Bell, ChevronDown, User, Key, MessageSquare, Wallet, ShoppingBag, Plus,
  Package, ClipboardList, LogOut, Search, ShoppingCart, Shield, Menu,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notification.service';

/**
 * Header dựng theo trang tham chiếu: logo trái, menu ngang giữa, ô tìm kiếm bo
 * tròn bên phải, rồi ba icon có badge.
 *
 * Mọi mục menu đều trỏ tới route CÓ THẬT — trang mẫu có "Deals / Brands /
 * About Us", Zoldify không có mấy trang đó nên không dựng link chết.
 */
const NAV = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Tất cả hàng', href: '/search' },
  { label: 'Mới đăng', href: '/search?sort=newest' },
  { label: 'Nhiều người xem', href: '/search?sort=most_viewed' },
  { label: 'Đăng bán', href: '/product/create' },
];

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [unreadNotis, setUnreadNotis] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setIsNavOpen(false);
  }, [pathname, searchParams]);

  /**
   * Trang chủ đã có một ô tìm kiếm lớn ngay trong hero, nên ô ở header là hành
   * động chính bị nhân đôi: hai ô cùng hiện một lúc trên cùng màn hình. Ở đây
   * nó chỉ xuất hiện khi người xem đã cuộn qua khỏi hero. Mọi trang khác giữ
   * nguyên ô tìm kiếm như cũ.
   */
  const isHome = pathname === '/';
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setPastHero(true);
      return;
    }
    const onScroll = () => setPastHero(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const showHeaderSearch = pastHero;

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadNotis(res.data?.data?.unread_count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const badge = (n: number) => (
    <span
      aria-hidden="true"
      className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-price px-1 text-[10px] font-bold text-white"
    >
      {n > 99 ? '99+' : n}
    </span>
  );

  return (
    <header className="sticky top-0 z-sticky w-full border-b border-ink/8 bg-surface-card">
      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center gap-4 px-4 md:gap-8">
        <button
          type="button"
          onClick={() => setIsNavOpen((v) => !v)}
          aria-expanded={isNavOpen}
          aria-label="Mở menu"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-surface-sunken lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link href="/" aria-label="Zoldify — về trang chủ" className="flex shrink-0 items-center">
          <img src="/images/logouni.png" alt="Zoldify" className="h-8 w-auto" decoding="async" />
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('?')[0]);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative block py-[23px] text-[13.5px] font-semibold transition-colors ${
                      active ? 'text-brand' : 'text-ink hover:text-brand'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-brand" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Ô tìm kiếm phải là một HỘP có viền và nền, đủ rộng, neo sát cụm icon —
            bản trước để nó không viền và hẹp nên trông trần trụi, treo lơ lửng
            giữa khoảng trống lớn sau menu. */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className={`ml-auto min-w-0 flex-1 justify-end lg:max-w-[360px] ${
            showHeaderSearch ? 'hidden md:flex' : 'hidden'
          }`}
        >
          <label htmlFor="site-search" className="sr-only">Tìm sản phẩm</label>
          {/* Pill bo tròn hoàn toàn, kính lúp bên PHẢI — theo đúng ảnh mẫu độ
              phân giải cao. Bản trước là hộp bo 8px với icon bên trái. */}
          <div className="flex h-10 w-full items-center gap-2.5 rounded-full border border-ink/10 bg-surface-sunken pl-4 pr-2 transition-colors focus-within:border-brand/50 focus-within:bg-surface-card focus-within:ring-2 focus-within:ring-brand/15">
            <input
              id="site-search"
              type="search"
              name="q"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm giáo trình, đồ cũ..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder-ink-faint focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-card hover:text-brand"
            >
              <Search className="h-[17px] w-[17px]" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Khi ô tìm kiếm ẩn, cụm icon phải tự giữ ml-auto ở mọi bề ngang, nếu
            không nó trôi vào giữa thanh header. */}
        <div
          className={`ml-auto flex shrink-0 items-center gap-1.5 md:gap-2.5 ${
            showHeaderSearch ? 'md:ml-0' : ''
          }`}
        >
          <Link
            href="/notifications"
            aria-label={unreadNotis > 0 ? `Thông báo, ${unreadNotis} chưa đọc` : 'Thông báo'}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-sunken"
          >
            <Bell className="h-[19px] w-[19px]" aria-hidden="true" />
            {unreadNotis > 0 && badge(unreadNotis)}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((v) => !v)}
                aria-expanded={isUserMenuOpen}
                aria-label="Tài khoản của tôi"
                className="flex h-10 items-center gap-1 rounded-lg px-2 text-ink transition-colors hover:bg-surface-sunken"
              >
                <User className="h-[19px] w-[19px]" aria-hidden="true" />
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-muted lg:block" aria-hidden="true" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-dropdown mt-2 w-[250px] overflow-hidden rounded-xl border border-ink/8 bg-surface-card shadow-xl">
                  <p className="truncate border-b border-ink/8 px-4 py-3 text-[13px] font-semibold text-ink">
                    Chào, {user?.full_name || 'bạn'}
                  </p>
                  <div className="border-b border-ink/8 py-1.5">
                    {[
                      { href: '/profile', icon: User, label: 'Hồ sơ của tôi' },
                      { href: '/profile/change-password', icon: Key, label: 'Đổi mật khẩu' },
                      { href: '/chat', icon: MessageSquare, label: 'Tin nhắn' },
                      { href: '/profile/wallet', icon: Wallet, label: 'Tiền của tôi' },
                      { href: '/profile/orders', icon: ShoppingBag, label: 'Đơn mua' },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-[13px] text-ink transition-colors hover:bg-surface-sunken"
                      >
                        <Icon className="h-[18px] w-[18px] text-ink-muted" aria-hidden="true" /> {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-b border-ink/8 py-1.5">
                    <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">Bán hàng</p>
                    {[
                      { href: '/product/create', icon: Plus, label: 'Thêm sản phẩm' },
                      { href: '/shop', icon: Package, label: 'Tất cả sản phẩm' },
                      { href: '/shop/orders', icon: ClipboardList, label: 'Đơn bán' },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-[13px] text-ink transition-colors hover:bg-surface-sunken"
                      >
                        <Icon className="h-[18px] w-[18px] text-ink-muted" aria-hidden="true" /> {label}
                      </Link>
                    ))}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="border-b border-ink/8 py-1.5">
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-[13px] text-ink transition-colors hover:bg-surface-sunken"
                      >
                        <Shield className="h-[18px] w-[18px] text-ink-muted" aria-hidden="true" /> Quản trị
                      </Link>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { setIsUserMenuOpen(false); logout(); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-semibold text-price transition-colors hover:bg-price-bg"
                  >
                    <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-surface-sunken"
            >
              <User className="h-[19px] w-[19px]" aria-hidden="true" />
              <span className="hidden lg:inline">Đăng nhập</span>
            </Link>
          )}

          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : 'Giỏ hàng'}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-sunken"
          >
            <ShoppingCart className="h-[19px] w-[19px]" aria-hidden="true" />
            {cartCount > 0 && badge(cartCount)}
          </Link>
        </div>
      </div>

      {/* Ô tìm kiếm riêng cho mobile: màn hẹp không đủ chỗ đặt cạnh logo.
          Trên trang chủ cũng ẩn cho tới khi cuộn qua hero, vì hero đã có ô lớn. */}
      {showHeaderSearch && (
      <form onSubmit={handleSearchSubmit} role="search" className="border-t border-ink/8 px-4 py-2.5 md:hidden">
        <label htmlFor="site-search-mobile" className="sr-only">Tìm sản phẩm</label>
        <div className="flex h-10 items-center gap-2 rounded-full bg-surface-sunken px-3.5 focus-within:ring-2 focus-within:ring-brand/30">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            id="site-search-mobile"
            type="search"
            name="q"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm giáo trình, đồ cũ..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder-ink-faint focus:outline-none"
          />
        </div>
      </form>
      )}

      {isNavOpen && (
        <nav aria-label="Điều hướng chính" className="border-t border-ink/8 px-4 py-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block py-2.5 text-[14px] font-semibold text-ink transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
