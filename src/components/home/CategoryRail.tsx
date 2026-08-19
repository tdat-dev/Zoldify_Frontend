"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Grid3x3, Package } from 'lucide-react';
import { useCategoryName } from '@/lib/categoryI18n';

/**
 * Hàng danh mục kiểu "Shop by Category" của trang tham chiếu: các ô trắng bo
 * góc, ảnh vuông ở giữa, tên danh mục, và một dòng đếm bên dưới.
 *
 * Ô cuối là "Xem tất cả" (trang mẫu cũng để ô này), nên hàng luôn đầy 8 ô kể cả
 * khi số danh mục lẻ. Dòng đếm chỉ in khi API trả về số thật.
 */
export function CategoryRail({ categories }: { categories: any[] }) {
  const t = useTranslations('home');
  const catName = useCategoryName();
  const shown = categories.slice(0, 7);

  return (
    <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-8">
      {shown.map((cat) => {
        const count = Number(cat.product_count ?? cat.productCount);
        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug || cat.id}`}
            className="flex w-[112px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-xl border border-ink/8 bg-surface-card px-2 py-4 text-center transition-colors hover:border-brand/40 sm:w-auto"
          >
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-sunken">
              {cat.image ? (
                <img src={cat.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <Package className="h-6 w-6 text-ink-faint" aria-hidden="true" />
              )}
            </div>
            <span className="line-clamp-2 text-[12.5px] font-semibold leading-tight text-ink">
              {catName(cat)}
            </span>
            {Number.isFinite(count) && count > 0 && (
              <span className="text-[11px] text-ink-faint">{t('itemCount', { count })}</span>
            )}
          </Link>
        );
      })}

      <Link
        href="/search"
        className="flex w-[112px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-xl border border-ink/8 bg-surface-card px-2 py-4 text-center transition-colors hover:border-brand/40 sm:w-auto"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-sunken">
          <Grid3x3 className="h-5 w-5 text-ink-muted" aria-hidden="true" />
        </div>
        <span className="text-[12.5px] font-semibold leading-tight text-ink">{t('allCategories')}</span>
        <span className="text-[11px] text-ink-faint">{t('browseAll')}</span>
      </Link>
    </div>
  );
}
