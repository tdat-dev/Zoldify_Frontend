"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Bell, ChevronDown, User, Key, MessageSquare, Wallet, ShoppingBag, Plus,
  Package, ClipboardList, LogOut, Search, ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { notificationService } from '@/services/notification.service';

/**
 * Header MỘT TẦNG.
 *
 * Bản trước là chrome hai tầng — dáng của Amazon, nhận ra ngay từ xa. Bỏ tầng
 * thứ hai là thay đổi lớn nhất; phần duyệt danh mục đã nằm trên trang chủ và
 * trong bộ lọc của /search, không cần một hàng nav riêng chiếm chỗ vĩnh viễn.
 *
 * Hai chỗ còn lại được đổi cho đúng bản chất sản phẩm, không phải đổi cho khác:
 *
 * 1. "ĐĂNG BÁN" LÀ NÚT ĐẶC, ngang hàng với ô tìm kiếm.
 *    Amazon, Shopee và Lazada đều là B2C: người bán là doanh nghiệp, làm việc ở
 *    một seller center riêng, nên "Sell" chỉ là một dòng chữ nhỏ trong thanh
 *    tiện ích. Zoldify là C2C — ai vào cũng đang ngồi cạnh một món không dùng
 *    nữa. Để hành động bán ngang hàng với hành động tìm là phát biểu đúng mô
 *    hình sản phẩm ngay ở header.
 *
 * 2. DROPDOWN TRONG Ô TÌM KIẾM LÀ TẦM TIỀN, không phải danh mục.
 *    Amazon lọc theo loại hàng vì họ bán hàng mới sản xuất hàng loạt. Ở sàn đồ
 *    cũ, câu hỏi đầu tiên là "có gì trong tầm tiền của mình". Đây là cùng một ý
 *    đã thử ở thanh nav tầng hai, nhưng đặt vào trong ô tìm kiếm thì nó là một
 *    phần của việc tìm chứ không phải một hàng nav mượn hình của người khác.
 *
 * Cả hai tham số đều lọc THẬT: /search đọc q, price_min, price_max từ URL.
 */
// Nhãn qua khoá `priceBands` dùng chung với /search và /category, thay vì viết
// cứng tiếng Việt — header hiện trên MỌI trang nên đây là lỗ i18n dễ thấy nhất.
const PRICE_SCOPES = [
  { value: '', key: 'any' },
  { value: '0-100000', key: 'under100k' },
  { value: '100000-300000', key: '100to300k' },
  { value: '300000-1000000', key: '300kTo1m' },
  { value: '1000000-', key: 'over1m' },
] as const;

export default function Header() {
  const t = useTranslations('header');
  const tc = useTranslations('common');
  const tBands = useTranslations('priceBands');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadNotis, setUnreadNotis] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceScope, setPriceScope] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  // Giữ ô tìm kiếm và tầm tiền khớp với URL, để mở một link lọc sẵn thì header
  // phản ánh đúng thứ đang xem chứ không hiện "Mọi giá".
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    const min = searchParams.get('price_min') || '';
    const max = searchParams.get('price_max') || '';
    setPriceScope(min || max ? `${min || '0'}-${max}` : '');
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const q = searchQuery.trim();
    if (q) params.set('q', q);
    if (priceScope) {
      const [min, max] = priceScope.split('-');
      if (min && min !== '0') params.set('price_min', min);
      if (max) params.set('price_max', max);
    }
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

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-control text-ink transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

  /* Ô tìm kiếm: một hộp, tầm tiền nằm BÊN TRONG bên trái, kính lúp bên phải.
     Không nút vuông đặc màu ở đuôi — đó là chi tiết Amazon/eBay rõ nhất. */
  const searchBox =
    'flex h-11 w-full items-center rounded-control border border-ink/16 bg-surface-card transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20';

  return (
    <header className="sticky top-0 z-sticky w-full border-b border-ink/10 bg-surface-card">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
        <Link
          href="/"
          aria-label={t('home')}
          className="flex shrink-0 items-center rounded-control focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <img src="/images/logo.webp" alt="Zoldify" className="h-8 w-auto" decoding="async" />
        </Link>

        {/* Ô tìm kiếm: chiếm hết phần giữa ở desktop, xuống hàng riêng ở mobile. */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="order-last w-full min-w-0 md:order-none md:w-auto md:flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            {tc('searchAria')}
          </label>
          <label htmlFor="price-scope" className="sr-only">
            {t('browseByPrice')}
          </label>
          <div className={searchBox}>
            <select
              id="price-scope"
              value={priceScope}
              onChange={(e) => setPriceScope(e.target.value)}
              className="h-full shrink-0 cursor-pointer rounded-l-control border-r border-ink/12 bg-transparent pl-3 pr-2 text-small text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40"
            >
              {PRICE_SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {tBands(s.key)}
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
              placeholder={tc('searchPlaceholder')}
              className="min-w-0 flex-1 bg-transparent px-3 text-body text-ink placeholder-ink-faint focus:outline-none"
            />
            <button
              type="submit"
              aria-label={tc('search')}
              className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-surface-sunken hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 md:gap-2">
          {/* Nút đặc, ngang hàng với ô tìm kiếm. Đây là nửa còn lại của một sàn
              C2C, không phải một lối phụ giấu trong menu. */}
          <Link
            href="/product/create"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control bg-brand px-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 md:px-4"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('sellShort')}</span>
          </Link>

          <Link
            href="/notifications"
            aria-label={unreadNotis > 0 ? t('notificationsUnread', { count: unreadNotis }) : t('notifications')}
            className={iconBtn}
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
                aria-label={t('account')}
                className={`${iconBtn} w-auto gap-1 px-2`}
              >
                <User className="h-5 w-5" aria-hidden="true" />
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-muted lg:block" aria-hidden="true" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-dropdown mt-1 w-[250px] overflow-hidden rounded-control border border-ink/12 bg-surface-card shadow-float">
                  <p className="truncate border-b border-ink/10 px-4 py-3 text-small font-semibold text-ink">
                    {t('greeting', { name: user?.full_name || t('you') })}
                  </p>
                  <div className="border-b border-ink/10 py-1.5">
                    {[
                      { href: '/profile', icon: User, label: t('myProfile') },
                      { href: '/profile/change-password', icon: Key, label: t('changePassword') },
                      { href: '/chat', icon: MessageSquare, label: t('messages') },
                      { href: '/profile/wallet', icon: Wallet, label: t('wallet') },
                      { href: '/profile/orders', icon: ShoppingBag, label: t('myOrders') },
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
                    <p className="px-4 py-1 text-caption uppercase tracking-wide text-ink-faint">
                      {t('sellingGroup')}
                    </p>
                    {[
                      { href: '/product/create', icon: Plus, label: t('sell') },
                      { href: '/profile/products', icon: Package, label: t('myProducts') },
                      { href: '/shop/orders', icon: ClipboardList, label: t('sellerOrders') },
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
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-small font-semibold text-price transition-colors hover:bg-price-bg"
                  >
                    <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`${iconBtn} w-auto gap-1.5 px-2.5`}
              aria-label={t('login')}
            >
              <User className="h-5 w-5" aria-hidden="true" />
              <span className="hidden text-small font-semibold lg:inline">{t('login')}</span>
            </Link>
          )}

          <Link
            href="/cart"
            aria-label={cartCount > 0 ? t('cartCount', { count: cartCount }) : t('cart')}
            className={iconBtn}
          >
            <ShoppingCart className="h-[22px] w-[22px]" aria-hidden="true" />
            {cartCount > 0 && badge(cartCount)}
          </Link>
        </div>
      </div>
    </header>
  );
}
