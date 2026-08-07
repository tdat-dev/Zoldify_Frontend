"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Bell, ChevronDown, User, Key, MessageSquare, Wallet, ShoppingBag, Plus,
  Package, ClipboardList, LogOut, Search, ShoppingCart, Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notification.service';
import { categoryService } from '@/services/category.service';

/**
 * Header một việc: TÌM. Logo trái, ô tìm kiếm chiếm phần giữa, ba icon phải,
 * và một hàng từ khoá gợi ý ngay dưới.
 *
 * Bản trước có thêm menu ngang năm mục (Trang chủ / Tất cả hàng / Mới đăng /
 * Nhiều người xem / Đăng bán). Bốn trong năm mục đó đều dẫn về cùng trang
 * /search chỉ khác tham số sort — tức là menu bày ra bốn cửa cho một căn
 * phòng, đẩy ô tìm kiếm co lại còn 360px trong khi nó mới là việc người ta vào
 * đây để làm. Đã gỡ; các lối đó nằm trong từ khoá gợi ý và menu tài khoản.
 *
 * Từ khoá gợi ý lấy từ danh mục THẬT của API, không phải danh sách tự nghĩ.
 */
export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadNotis, setUnreadNotis] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hotCategories, setHotCategories] = useState<any[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [pathname, searchParams]);

  // Hỏng thì không có hàng gợi ý, header vẫn dùng bình thường.
  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setHotCategories((res.data?.data?.result || []).slice(0, 6)))
      .catch(() => setHotCategories([]));
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
      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center gap-3 px-4 md:gap-6">
        <Link href="/" aria-label="Zoldify — về trang chủ" className="flex shrink-0 items-center">
          <img src="/images/logouni.png" alt="Zoldify" className="h-8 w-auto" decoding="async" />
        </Link>

        {/* Ô tìm kiếm chiếm hết phần giữa còn lại. Không giới hạn 360px nữa: đây
            là việc chính của trang, nó được quyền rộng. */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="hidden min-w-0 flex-1 md:flex"
        >
          <label htmlFor="site-search" className="sr-only">Tìm sản phẩm</label>
          <div className="flex h-11 w-full items-center gap-2.5 rounded-full border border-ink/12 bg-surface-sunken pl-5 pr-1.5 transition-colors focus-within:border-brand/50 focus-within:bg-surface-card focus-within:ring-2 focus-within:ring-brand/15">
            <input
              id="site-search"
              type="search"
              name="q"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm giáo trình, máy tính, xe đạp…"
              className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder-ink-faint focus:outline-none"
            />
            <button
              type="submit"
              className="h-8 shrink-0 rounded-full bg-brand px-4 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Tìm
            </button>
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0 md:gap-2.5">
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

      {/* Ô tìm kiếm riêng cho mobile: màn hẹp không đủ chỗ đặt cạnh logo. */}
      <form onSubmit={handleSearchSubmit} role="search" className="px-4 pb-2.5 md:hidden">
        <label htmlFor="site-search-mobile" className="sr-only">Tìm sản phẩm</label>
        <div className="flex h-11 items-center gap-2 rounded-full border border-ink/12 bg-surface-sunken pl-4 pr-1.5 focus-within:border-brand/50 focus-within:bg-surface-card focus-within:ring-2 focus-within:ring-brand/15">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            id="site-search-mobile"
            type="search"
            name="q"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm giáo trình, máy tính, xe đạp…"
            className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder-ink-faint focus:outline-none"
          />
          <button
            type="submit"
            className="h-8 shrink-0 rounded-full bg-brand px-3.5 text-small font-semibold text-white"
          >
            Tìm
          </button>
        </div>
      </form>

      {/* Hàng từ khoá gợi ý. Cuộn ngang BÊN TRONG ở màn hẹp, không đẩy tràn trang.
          Chỉ hiện khi API trả về danh mục thật — không dựng danh sách tự nghĩ. */}
      {hotCategories.length > 0 && (
        <div className="border-t border-ink/8">
          <div className="mx-auto flex max-w-[1240px] items-center gap-2 overflow-x-auto px-4 py-2.5">
            <span className="shrink-0 text-small text-ink-faint">Hay tìm:</span>
            {hotCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug || cat.id}`}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-small text-ink-muted transition-colors hover:bg-surface-sunken hover:text-brand"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/product/create"
              className="ml-auto hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-small font-semibold text-brand transition-colors hover:bg-brand-tint md:flex"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Đăng bán
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
