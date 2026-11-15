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
// Ảnh ở public/media/quick-links/<key>.webp: icon 3D tạo bằng Vanta Motion
// (12/11/2026), cùng một khuôn prompt nên sáu cái đứng chung một họ.
const LINKS = [
  { href: '/product/create', key: 'sell' },
  { href: '/search?sort=newest', key: 'newest' },
  { href: '/search?price_max=100000&sort=newest', key: 'under100k' },
  { href: '/profile/orders', key: 'purchases' },
  { href: '/profile/wallet', key: 'wallet' },
  { href: '/chat', key: 'messages' },
];

export function QuickLinks() {
  const t = useTranslations('home');

  return (
    <nav aria-label={t('quickLinksLabel')} className="rounded-card bg-surface-card px-2 py-4">
      {/* Cuộn ngang BÊN TRONG khối ở màn hẹp, không đẩy tràn trang. */}
      <ul className="flex justify-start gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-around">
        {LINKS.map(({ href, key }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              className="group flex w-[92px] flex-col items-center gap-1.5 rounded-control px-1 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              {/* Ảnh nền trắng; mix-blend-multiply làm nền trắng tan vào thẻ nên
                  không lộ ô vuông khi thẻ đổi màu. */}
              <Image
                src={`/media/quick-links/${key}.webp`}
                alt=""
                aria-hidden="true"
                width={256}
                height={256}
                unoptimized
                draggable={false}
                className="pointer-events-none h-14 w-14 select-none mix-blend-multiply transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-active:scale-[0.97]"
              />
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
