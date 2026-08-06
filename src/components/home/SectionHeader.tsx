import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Tiêu đề section + link "Xem tất cả" bên phải, đúng nhịp của các sàn tham chiếu. */
export function SectionHeader({
  id,
  title,
  href,
  linkText = 'Xem tất cả',
}: {
  id: string;
  title: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 id={id} className="text-lg font-bold tracking-[-0.01em] text-ink md:text-xl">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 py-1 text-[13px] font-medium text-brand transition-colors hover:text-brand-dark"
        >
          {linkText}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
