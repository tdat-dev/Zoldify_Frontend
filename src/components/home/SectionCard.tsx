import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Khối nội dung màu trắng nổi trên nền trang xám — kết cấu chung của Shopee,
 * Lazada và Amazon (xem cả ba ngày 2026-08-08). Trước đây nền trang và nền khối
 * cùng là trắng nên trang không có tầng nào: mọi thứ phẳng trên một mặt.
 *
 * Tiêu đề bên trái, một lối "xem tất cả" bên phải. Không eyebrow, không đánh số.
 */
export function SectionCard({
  id,
  title,
  href,
  linkText = 'Xem tất cả',
  bleed = false,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  linkText?: string;
  /** Cho nội dung chạm sát mép khối (dùng cho sổ hàng, để vạch kẻ kéo hết bề ngang). */
  bleed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-card bg-surface-card">
      <div className="flex items-baseline justify-between gap-4 px-4 pb-3 pt-4 md:px-5 md:pt-5">
        <h2 id={id} className="text-h2 text-ink">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-0.5 text-small font-medium text-brand transition-colors hover:text-brand-dark"
          >
            {linkText}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className={bleed ? '' : 'px-4 pb-4 md:px-5 md:pb-5'}>{children}</div>
    </section>
  );
}
