import Link from 'next/link';

/**
 * Thanh tiện ích mảnh trên cùng — khuôn lấy từ lazada.vn (xem 2026-08-08): một
 * dải chữ rất nhỏ, nền nhạt, chứa các lối đi phụ trợ mà người mua ít dùng nhưng
 * cần có (bán hàng, chăm sóc khách, theo dõi đơn). Nó nằm TRÊN chrome chính để
 * không giành chỗ với ô tìm kiếm.
 *
 * Mọi mục đều trỏ tới route CÓ THẬT trong src/app. Lazada có "SELL ON LAZADA /
 * CUSTOMER CARE / TRACK MY ORDER"; những trang Zoldify không có thì không dựng
 * link chết cho giống.
 */
const LINKS = [
  { href: '/product/create', label: 'Bán hàng cùng Zoldify' },
  { href: '/profile/orders', label: 'Đơn mua của tôi' },
  { href: '/shop/orders', label: 'Đơn bán của tôi' },
  { href: '/chat', label: 'Tin nhắn' },
  { href: '/notifications', label: 'Thông báo' },
];

export function AnnounceBar() {
  return (
    <div className="hidden border-b border-ink/10 bg-surface-card md:block">
      <div className="mx-auto flex max-w-[1500px] items-center justify-end gap-1 px-3">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-2 py-1.5 text-caption font-normal text-ink-muted transition-colors hover:text-brand hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
