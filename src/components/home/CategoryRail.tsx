import Link from 'next/link';
import { Package } from 'lucide-react';

/**
 * Hàng danh mục: cuộn ngang trên mobile, lưới trên desktop.
 *
 * Các sàn tham chiếu in kèm số lượng ("120+ Items") dưới mỗi danh mục. Ở đây
 * chỉ in khi API thật sự trả về con số — không ước lượng, không làm tròn lên.
 */
export function CategoryRail({ categories }: { categories: any[] }) {
  return (
    <>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:hidden">
        {categories.map((cat) => (
          <CategoryTile key={cat.id} cat={cat} className="w-[104px] shrink-0" />
        ))}
      </div>

      {/* 5 cột: danh mục thường là bội của 5 hoặc 10 nên lưới đầy, không rơi ra
          một hai ô lẻ ở dòng cuối như khi chia 8 cột. */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => (
          <CategoryTile key={cat.id} cat={cat} />
        ))}
      </div>
    </>
  );
}

function CategoryTile({ cat, className = '' }: { cat: any; className?: string }) {
  const count = Number(cat.product_count ?? cat.productCount);

  return (
    <Link
      href={`/category/${cat.slug || cat.id}`}
      className={`flex flex-col items-center gap-2 rounded-xl border border-ink/8 bg-surface-card p-3 text-center transition-colors hover:border-brand/40 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-surface-sunken">
        {cat.image ? (
          <img src={cat.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Package className="h-6 w-6 text-ink-faint" aria-hidden="true" />
        )}
      </div>
      <span className="line-clamp-2 text-xs font-medium leading-tight text-ink">{cat.name}</span>
      {Number.isFinite(count) && count > 0 && (
        <span className="text-[11px] text-ink-faint">{count} món</span>
      )}
    </Link>
  );
}
