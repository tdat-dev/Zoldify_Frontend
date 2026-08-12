"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ItemTile } from './ItemTile';

/**
 * Dải hàng cuộn ngang — khuôn "Best Sellers in ..." của amazon.com: một khối
 * trắng, tiêu đề đậm, một hàng ô hàng trượt ngang bên dưới.
 *
 * Cuộn BÊN TRONG khối (overflow-x-auto), không đẩy tràn trang. Không dựng nút
 * mũi tên trái/phải: ở đây chúng chỉ là trang trí vì vuốt và kéo thanh cuộn đã
 * làm được việc đó, còn nút thì phải tự quản trạng thái bật/tắt ở hai đầu.
 */
export function ItemStrip({
  id,
  title,
  items,
  href,
  linkText,
}: {
  id: string;
  title: string;
  items: any[];
  href?: string;
  /** Bo trong thi dung nhan chung. */
  linkText?: string;
}) {
  const t = useTranslations('home');
  return (
    <section aria-labelledby={id} className="rounded-card bg-surface-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-[19px] font-bold text-ink md:text-[21px]">
          {title}
        </h2>
        {href && (
          <Link href={href} className="shrink-0 text-small text-brand hover:text-brand-dark hover:underline">
            {linkText || t('seeAll')}
          </Link>
        )}
      </div>

      <ul className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {items.map((item) => (
          <li key={item.id} className="w-[150px] shrink-0 md:w-[172px]">
            <ItemTile item={item} size="md" />
          </li>
        ))}
      </ul>
    </section>
  );
}
