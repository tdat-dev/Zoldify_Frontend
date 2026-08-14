"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

/** Tiêu đề section + link "Xem tất cả" bên phải, đúng nhịp của các sàn tham chiếu. */
export function SectionHeader({
  id,
  title,
  href,
  linkText,
}: {
  id: string;
  title: string;
  href?: string;
  /** Bo trong thi dung nhan chung "Xem tat ca". */
  linkText?: string;
}) {
  const t = useTranslations('home');
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      {/* 17/19px semibold thay cho 20/24px extrabold: tiêu đề mục trước đây gần
          bằng h1 hero, nên trang có 21 chỗ chữ đậm và không còn điểm neo mắt.
          Khi mọi thứ đều đậm thì không gì đậm cả. */}
      <h2
        id={id}
        className="text-[17px] font-semibold tracking-[-0.01em] text-ink md:text-[19px] [text-wrap:balance]"
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 py-1 text-[13px] font-medium text-brand transition-colors hover:text-brand-dark"
        >
          {linkText || t('seeAll')}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
