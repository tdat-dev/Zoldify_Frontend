"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Plus, Wallet, ShoppingBag, MessageSquare, Clock, Tag, type LucideIcon,
} from 'lucide-react';

/**
 * Hàng lối tắt icon tròn — khuôn lấy từ shopee.vn (xem 2026-08-08): ngay dưới
 * chrome là một hàng biểu tượng tròn dẫn tới các chức năng chính, chữ nhỏ bên
 * dưới, cuộn ngang khi hẹp.
 *
 * Shopee để "Flash Sale / Vouchers / Telco & Bills" — dịch vụ của họ. Zoldify
 * đặt vào đó những việc sàn này làm THẬT, không bịa dịch vụ cho giống.
 */
// Nhãn giữ ở dạng KHOÁ, dịch lúc render. Viết thẳng chữ tiếng Việt vào mảng
// hằng này là cách sáu lối tắt đứng yên khi cả trang đã đổi sang tiếng Anh.
const LINKS: { href: string; key: string; icon: LucideIcon }[] = [
  { href: '/product/create', key: 'sell', icon: Plus },
  { href: '/search?sort=newest', key: 'newest', icon: Clock },
  { href: '/search?price_max=100000&sort=newest', key: 'under100k', icon: Tag },
  { href: '/profile/orders', key: 'purchases', icon: ShoppingBag },
  { href: '/profile/wallet', key: 'wallet', icon: Wallet },
  { href: '/chat', key: 'messages', icon: MessageSquare },
];

export function QuickLinks() {
  const t = useTranslations('home');

  return (
    <nav aria-label={t('quickLinksLabel')} className="rounded-card bg-surface-card px-2 py-4">
      {/* Cuộn ngang BÊN TRONG khối ở màn hẹp, không đẩy tràn trang. */}
      <ul className="flex justify-start gap-1 overflow-x-auto md:justify-around">
        {LINKS.map(({ href, key, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              className="flex w-[84px] flex-col items-center gap-2 rounded-control px-1 py-2 transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint">
                <Icon className="h-[21px] w-[21px] text-brand" aria-hidden="true" />
              </span>
              <span className="text-center text-caption font-normal leading-tight text-ink">
                {t(`quick_${key}`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
