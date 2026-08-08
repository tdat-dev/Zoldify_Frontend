import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitch } from './LocaleSwitch';

/**
 * Thanh tiện ích mảnh trên cùng — khuôn lấy từ lazada.vn (xem 2026-08-08): một
 * dải chữ rất nhỏ, nền nhạt, chứa các lối đi phụ trợ mà người mua ít dùng nhưng
 * cần có. Nó nằm TRÊN chrome chính để không giành chỗ với ô tìm kiếm.
 *
 * Đây cũng là chỗ đặt nút đổi ngôn ngữ: Lazada để "THAY ĐỔI NGÔN NGỮ" đúng ở
 * dải này, và nó là thứ người dùng chỉnh một lần rồi thôi nên không đáng chiếm
 * chỗ trong chrome chính.
 *
 * Mọi mục đều trỏ tới route CÓ THẬT trong src/app; trang nào Zoldify không có
 * thì không dựng link chết cho giống mẫu.
 */
const LINKS = [
  { href: '/product/create', key: 'sellWithUs' },
  { href: '/profile/orders', key: 'myOrders' },
  { href: '/shop/orders', key: 'sellerOrders' },
  { href: '/chat', key: 'messages' },
  { href: '/notifications', key: 'notifications' },
] as const;

export async function AnnounceBar() {
  const t = await getTranslations('utilityBar');

  return (
    <div className="hidden border-b border-ink/10 bg-surface-card md:block">
      <div className="mx-auto flex max-w-[1500px] items-center justify-end gap-1 px-3">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-2 py-1.5 text-caption font-normal text-ink-muted transition-colors hover:text-brand hover:underline"
          >
            {t(item.key)}
          </Link>
        ))}
        <span aria-hidden="true" className="mx-1 h-3.5 w-px bg-ink/15" />
        <LocaleSwitch className="py-1.5 text-ink-muted" />
      </div>
    </div>
  );
}
