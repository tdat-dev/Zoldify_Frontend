"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

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
const LINKS = [
  { href: '/product/create', key: 'sell', spriteColumn: 0, spriteRow: 0 },
  { href: '/search?sort=newest', key: 'newest', spriteColumn: 1, spriteRow: 0 },
  { href: '/search?price_max=100000&sort=newest', key: 'under100k', spriteColumn: 2, spriteRow: 0 },
  { href: '/profile/orders', key: 'purchases', spriteColumn: 0, spriteRow: 1 },
  { href: '/profile/wallet', key: 'wallet', spriteColumn: 1, spriteRow: 1 },
  { href: '/chat', key: 'messages', spriteColumn: 2, spriteRow: 1 },
];

export function QuickLinks() {
  const t = useTranslations('home');

  return (
    <nav aria-label={t('quickLinksLabel')} className="rounded-card bg-surface-card px-2 py-4">
      {/* Cuộn ngang BÊN TRONG khối ở màn hẹp, không đẩy tràn trang. */}
      <ul className="flex justify-start gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-around">
        {LINKS.map(({ href, key, spriteColumn, spriteRow }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              className="group flex w-[92px] flex-col items-center gap-1.5 rounded-control px-1 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <span className="relative h-16 w-16 overflow-hidden" aria-hidden="true">
                <Image
                  src="/media/quick-links-zoldify.webp"
                  alt=""
                  width={768}
                  height={512}
                  unoptimized
                  draggable={false}
                  className="pointer-events-none absolute h-[200%] w-[300%] max-w-none select-none object-fill transition-transform duration-200 ease-out group-hover:scale-[1.04] group-active:scale-[0.98]"
                  style={{
                    left: `${spriteColumn * -100}%`,
                    top: `${spriteRow * -100}%`,
                    transformOrigin: `${(spriteColumn + 0.5) * (100 / 3)}% ${(spriteRow + 0.5) * 50}%`,
                  }}
                />
              </span>
              <span className="text-center text-caption font-normal leading-tight text-ink transition-colors group-hover:text-brand group-focus-visible:text-brand">
                {t(`quick_${key}`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
