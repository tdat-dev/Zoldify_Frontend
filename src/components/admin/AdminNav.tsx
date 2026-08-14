"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Settings, Banknote } from 'lucide-react';

/**
 * Điều hướng khu quản trị.
 *
 * Trước đây KHÔNG CÓ. admin/layout.tsx chỉ là cổng kiểm quyền, còn thanh bên
 * duy nhất trong cả khu nằm chép cứng trong admin/settings/page.tsx. Nghĩa là
 * từ /admin/products không có đường nào sang /admin/orders ngoài nút Back của
 * trình duyệt — trừ khi bạn tình cờ đang đứng ở trang Cài đặt.
 *
 * Đặt trong layout nên mọi trang admin đều có, và chỉ có một bản.
 */
const ITEMS = [
  { href: '/admin', key: 'overview', Icon: LayoutDashboard },
  { href: '/admin/orders', key: 'ordTitle', Icon: ShoppingCart },
  { href: '/admin/products', key: 'prodTitle', Icon: Package },
  { href: '/admin/categories', key: 'catTitle', Icon: FolderTree },
  { href: '/admin/users', key: 'usrTitle', Icon: Users },
  { href: '/admin/withdrawals', key: 'wdNav', Icon: Banknote },
  { href: '/admin/settings', key: 'settings', Icon: Settings },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const t = useTranslations('admin');

  return (
    <nav
      aria-label={t('navLabel')}
      className="sticky top-0 z-10 border-b border-ink/10 bg-surface-card"
    >
      <ul className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4">
        {ITEMS.map(({ href, key, Icon }) => {
          // So khớp chính xác: '/admin' là tiền tố của mọi đường dẫn con nên
          // startsWith sẽ tô sáng "Tổng quan" trên mọi trang.
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-3.5 text-small transition-colors ${
                  active
                    ? 'border-brand font-semibold text-brand'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
