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
import { categoryService } from '@/services/category.service';

/**
 * Chrome hai tầng theo đúng bố cục Amazon (xem amazon.com ngày 2026-08-08):
 *   tầng 1 — nền gần đen: logo · ô tìm kiếm có dropdown danh mục · tài khoản · giỏ
 *   tầng 2 — nền nhạt hơn một bậc: nút "Tất cả" + các lối tắt dạng chữ
 *
 * Giữ nhận diện Zoldify: logo của mình, nút tìm màu xanh thương hiệu chứ không
 * phải vàng cam của Amazon. Bố cục là thứ cả ngành dùng chung; logo và bảng màu
 * nhận diện thì không.
 *
 * Ô tìm kiếm có dropdown danh mục và nó lọc THẬT — trang /search đã được sửa
 * cùng ngày để đọc category_id, sort, price_min, price_max từ URL. Trước đó nó
 * chỉ đọc `q`, nên mọi tham số khác đều là link chết.
 */
export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadNotis, setUnreadNotis] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeCat, setScopeCat] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setScopeCat(searchParams.get('category_id') || '');
  }, [pathname, searchParams]);

  // Hỏng thì dropdown chỉ còn "Tất cả" và tầng 2 rỗng; header vẫn dùng được.
  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(res.data?.data?.result || []))
      .catch(() => setCategories([]));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const q = searchQuery.trim();
    if (q) params.set('q', q);
    if (scopeCat) params.set('category_id', scopeCat);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
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
      className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-price px-1 text-[10px] font-bold text-white"
    >
      {n > 99 ? '99+' : n}
    </span>
  );

  /* Ô bấm ở chrome: viền trong suốt, hiện viền trắng mảnh khi trỏ hoặc focus —
     đúng cách Amazon đánh dấu vùng bấm được trên nền tối, và nó cho bàn phím một
     dấu hiệu thấy rõ thay vì chỉ đổi màu chữ. */
  const chromeItem =
    'flex items-center rounded-control border border-transparent px-2 py-1.5 text-white transition-colors hover:border-white/70 focus:outline-none focus-visible:border-white';

  return (
    <header className="sticky top-0 z-sticky w-full">
      {/* ---------- Tầng 1 ---------- */}
      <div className="bg-chrome">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-3 py-2 md:gap-3">
          <Link
            href="/"
            aria-label="Zoldify — về trang chủ"
            className={`${chromeItem} shrink-0`}
          >
            {/* Logo gốc là chữ xanh đậm; trên nền gần đen sẽ chìm. Lật thành
                trắng đặc thay vì xin thêm một file logo bản trắng. */}
            <img
              src="/images/logouni.png"
              alt="Zoldify"
              className="h-7 w-auto brightness-0 invert md:h-8"
              decoding="async"
            />
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="hidden min-w-0 flex-1 md:flex"
          >
            <label htmlFor="site-search" className="sr-only">Tìm sản phẩm</label>
            <label htmlFor="search-scope" className="sr-only">Giới hạn trong danh mục</label>
            <div className="flex h-10 w-full overflow-hidden rounded-control">
              <select
                id="search-scope"
                value={scopeCat}
                onChange={(e) => setScopeCat(e.target.value)}
                className="h-full shrink-0 border-r border-ink/16 bg-surface-sunken px-2 text-small text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
              >
                <option value="">Tất cả</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                id="site-search"
                type="search"
                name="q"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm giáo trình, máy tính, xe đạp…"
                className="min-w-0 flex-1 bg-surface-card px-3 text-body text-ink placeholder-ink-faint focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="flex w-12 shrink-0 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-dark"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            <Link
              href="/notifications"
              aria-label={unreadNotis > 0 ? `Thông báo, ${unreadNotis} chưa đọc` : 'Thông báo'}
              className={`${chromeItem} relative`}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadNotis > 0 && badge(unreadNotis)}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-expanded={isUserMenuOpen}
                  className={`${chromeItem} gap-1`}
                >
                  {/* Hai dòng chồng nhau, dòng trên nhỏ và mờ — đúng nhịp
                      "Hello, sign in / Account & Lists" của Amazon. */}
                  <span className="hidden text-left leading-tight lg:block">
                    <span className="block text-[11px] text-white/75">
                      Chào, {user?.full_name?.split(' ').slice(-1)[0] || 'bạn'}
                    </span>
                    <span className="block text-small font-bold">Tài khoản</span>
                  </span>
                  <User className="h-5 w-5 lg:hidden" aria-hidden="true" />
                  <ChevronDown className="hidden h-3.5 w-3.5 text-white/70 lg:block" aria-hidden="true" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full z-dropdown mt-1 w-[250px] overflow-hidden rounded-control border border-ink/12 bg-surface-card shadow-float">
                    <p className="truncate border-b border-ink/10 px-4 py-3 text-small font-semibold text-ink">
                      Chào, {user?.full_name || 'bạn'}
                    </p>
                    <div className="border-b border-ink/10 py-1.5">
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
                          className="flex items-center gap-3 px-4 py-2 text-small text-ink transition-colors hover:bg-surface-sunken"
                        >
                          <Icon className="h-[18px] w-[18px] text-ink-muted" aria-hidden="true" /> {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-b border-ink/10 py-1.5">
                      <p className="px-4 py-1 text-caption uppercase tracking-wide text-ink-faint">Bán hàng</p>
                      {[
                        { href: '/product/create', icon: Plus, label: 'Đăng bán đồ cũ' },
                        { href: '/profile/products', icon: Package, label: 'Sản phẩm của tôi' },
                        { href: '/shop/orders', icon: ClipboardList, label: 'Đơn bán' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-small text-ink transition-colors hover:bg-surface-sunken"
                        >
                          <Icon className="h-[18px] w-[18px] text-ink-muted" aria-hidden="true" /> {label}
                        </Link>
                      ))}
                    </div>
                    {user?.role === 'admin' && (
                      <div className="border-b border-ink/10 py-1.5">
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-small text-ink transition-colors hover:bg-surface-sunken"
                        >
                          <Shield className="h-[18px] w-[18px] text-ink-muted" aria-hidden="true" /> Quản trị
                        </Link>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-small font-semibold text-price transition-colors hover:bg-price-bg"
                    >
                      <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={`${chromeItem} gap-1.5`}>
                <User className="h-5 w-5 lg:hidden" aria-hidden="true" />
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block text-[11px] text-white/75">Xin chào</span>
                  <span className="block text-small font-bold">Đăng nhập</span>
                </span>
              </Link>
            )}

            <Link href="/cart" aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : 'Giỏ hàng'} className={`${chromeItem} relative gap-1.5`}>
              <ShoppingCart className="h-[22px] w-[22px]" aria-hidden="true" />
              <span className="hidden text-small font-bold lg:block">Giỏ hàng</span>
              {cartCount > 0 && badge(cartCount)}
            </Link>
          </div>
        </div>

        {/* Ô tìm kiếm riêng cho mobile: màn hẹp không đủ chỗ đặt cạnh logo. */}
        <form onSubmit={handleSearchSubmit} role="search" className="px-3 pb-2 md:hidden">
          <label htmlFor="site-search-mobile" className="sr-only">Tìm sản phẩm</label>
          <div className="flex h-10 overflow-hidden rounded-control">
            <input
              id="site-search-mobile"
              type="search"
              name="q"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm giáo trình, máy tính, xe đạp…"
              className="min-w-0 flex-1 bg-surface-card px-3 text-body text-ink placeholder-ink-faint focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="flex w-11 shrink-0 items-center justify-center bg-brand text-white"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>

      {/* ---------- Tầng 2 ---------- */}
      <nav aria-label="Lối tắt" className="bg-chrome-soft">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-3 py-1">
          <Link href="/search" className={`${chromeItem} shrink-0 gap-1.5 whitespace-nowrap text-small font-bold`}>
            <Menu className="h-4 w-4" aria-hidden="true" />
            Tất cả
          </Link>
          <Link href="/search?sort=newest" className={`${chromeItem} shrink-0 whitespace-nowrap text-small`}>
            Mới đăng
          </Link>
          <Link href="/search?price_max=100000&sort=newest" className={`${chromeItem} shrink-0 whitespace-nowrap text-small`}>
            Dưới 100k
          </Link>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug || cat.id}`}
              className={`${chromeItem} shrink-0 whitespace-nowrap text-small`}
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/product/create" className={`${chromeItem} ml-auto shrink-0 whitespace-nowrap text-small font-bold`}>
            Đăng bán đồ cũ
          </Link>
        </div>
      </nav>
    </header>
  );
}
