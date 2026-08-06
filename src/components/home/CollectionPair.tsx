import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';

/**
 * Hai thẻ ngang lớn, đúng khối "Featured Collections" của trang tham chiếu:
 * nền màu nhạt, chữ bên trái, ảnh tràn bên phải, nút nhỏ bên dưới chữ.
 *
 * Nội dung lấy từ danh mục THẬT trong hệ thống (hai danh mục đầu), không phải
 * bộ sưu tập tự đặt tên. Link dẫn thẳng tới trang danh mục đó.
 */
export function CollectionPair({ categories }: { categories: any[] }) {
  const pair = categories.slice(0, 2);
  if (pair.length < 2) return null;

  const tints = ['bg-brand-tint', 'bg-amber-50'];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {pair.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug || cat.id}`}
          className={`group grid grid-cols-[minmax(0,1fr)_42%] items-stretch overflow-hidden rounded-2xl ${tints[i]}`}
        >
          <div className="min-w-0 p-6 md:p-7">
            <h3 className="text-lg font-extrabold text-ink md:text-xl">{cat.name}</h3>
            <p className="mt-1 text-[13px] text-ink-muted">Hàng cũ còn dùng tốt</p>
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-surface-card px-4 py-2 text-[13px] font-semibold text-ink shadow-sm transition-colors group-hover:bg-white">
              Xem danh mục
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>

          {/* Ảnh tràn kín nửa phải, cao bằng thẻ — bản trước để một ô vuông nhỏ
              lửng lơ nên thẻ trông rỗng, không giống khối bộ sưu tập của mẫu. */}
          <div className="relative min-h-[152px] overflow-hidden bg-surface-card/60">
            {cat.image ? (
              <img
                src={cat.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-9 w-9 text-ink-faint" aria-hidden="true" />
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
