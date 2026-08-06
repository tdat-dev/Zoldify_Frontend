import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';

/**
 * Dải kêu gọi đăng bán, đặt cuối trang. Ở các trang tham chiếu chỗ này là
 * newsletter; Zoldify không có hệ thống gửi email nên dựng ô nhập mail vào đây
 * là dựng một control chết — thay bằng hành động sàn thật sự làm được.
 */
export function SellCta() {
  return (
    <section
      aria-labelledby="sell-cta"
      className="flex flex-col items-start gap-6 rounded-2xl bg-brand-tint p-7 sm:flex-row sm:items-center sm:justify-between md:p-9"
    >
      <div className="flex items-start gap-4">
        <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-card sm:flex">
          <Tag className="h-5 w-5 text-brand" aria-hidden="true" />
        </span>
        <div>
          <h2 id="sell-cta" className="text-lg font-extrabold text-ink md:text-xl">
            Có đồ cũ không dùng nữa?
          </h2>
          <p className="mt-1.5 max-w-[52ch] text-sm text-ink-muted">
            Giáo trình học xong, đồ ký túc lúc chuyển phòng, máy cũ vừa lên đời. Đăng lên cho
            người cần, đỡ phí.
          </p>
        </div>
      </div>

      <Link
        href="/product/create"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
      >
        Đăng bán đồ cũ
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
