"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCategoryName } from '@/lib/categoryI18n';
import { imageUrl } from '@/lib/image-url';
import { ALL_CATEGORIES_ART, categoryArt } from './category-art';

/**
 * Lưới danh mục dạng ô — khuôn lấy từ khối "CATEGORIES" của shopee.vn (xem
 * 2026-08-08): một khối trắng, tiêu đề viết hoa mảnh ở trên, bên dưới là lưới ô
 * đều nhau ngăn bằng hairline, mỗi ô có hình ở giữa và tên bên dưới.
 *
 * Danh mục có ảnh minh hoạ riêng (category-art.ts) thì hiện ảnh đó. Không có thì
 * dùng ảnh API trả về; API cũng không có thì hiện chữ cái đầu chứ KHÔNG để một ô
 * xám rỗng — ô rỗng ở vị trí lẽ ra là ảnh đọc ra là "hỏng ảnh".
 *
 * Ô cuối "Tất cả danh mục" chỉ hiện ở lưới năm cột: chín danh mục trên năm cột
 * để trống một ô ở hàng cuối, trông như thiếu một mục. Ở lưới ba cột (điện
 * thoại) chín danh mục đã đầy 3×3, thêm ô này lại sinh ra hai ô trống.
 */
export function CategoryTiles({ categories }: { categories: any[] }) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const catName = useCategoryName();
  return (
    // h-full: cột bên phải cao theo ảnh flat-lay, không phải theo số danh mục.
    // Thiếu h-full thì thẻ trắng dừng ở chiều cao tự nhiên và để lộ một mảng nền
    // xám bên dưới — trông như thẻ bị cắt cụt.
    <section
      aria-labelledby="cat-tiles"
      className="flex h-full flex-col overflow-hidden rounded-card bg-surface-card"
    >
      <h2
        id="cat-tiles"
        className="border-b border-ink/10 px-5 py-3.5 text-small font-semibold uppercase tracking-wide text-ink-muted"
      >
        {t('categories')}
      </h2>

      {/* Viền trên TỪNG ô, không dùng gap-px trên nền màu: với gap-px, hàng cuối
          thiếu ô sẽ để lộ nguyên mảng nền xám ở chỗ trống — đo được khi 6 danh
          mục xếp trên lưới 5 cột. Viền từng ô thì ô trống đơn giản không tồn tại. */}
      {/* flex-1 + auto-rows-fr: thẻ này cao bằng cột bên phải (cột đó có ảnh
          nên cao hơn), nếu lưới giữ chiều cao tự nhiên thì dưới nó là một mảng
          trắng rỗng chừng 130px — đo được trên màn 1440. Cho các hàng chia đều
          phần cao dư thì ô giãn ra, không ai phải nhìn khoảng trắng vô nghĩa. */}
      <ul className="grid flex-1 auto-rows-fr grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => {
          const count = Number(cat.product_count ?? cat.productCount);
          const art = categoryArt(cat.slug);
          return (
            <Tile
              key={cat.id}
              href={`/${cat.slug || cat.id}`}
              label={catName(cat)}
              sub={Number.isFinite(count) && count > 0 ? t('itemCount', { count }) : null}
            >
              {art ? (
                <TileArt src={art} />
              ) : (
                <FallbackDisc image={cat.image} letter={String(catName(cat) || '?')} />
              )}
            </Tile>
          );
        })}
        <Tile
          href="/search"
          label={tCommon('allCategories')}
          sub={t('browseAll')}
          className="hidden lg:list-item"
        >
          <TileArt src={ALL_CATEGORIES_ART} />
        </Tile>
      </ul>
    </section>
  );
}

function Tile({
  href,
  label,
  sub,
  className = '',
  children,
}: {
  href: string;
  label: string;
  sub: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li className={`border-b border-r border-ink/10 ${className}`}>
      <Link
        href={href}
        className="group flex h-full flex-col items-center justify-center gap-2 bg-surface-card px-2 py-4 text-center transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
      >
        {children}
        <span className="clamp-2 text-caption font-normal leading-tight text-ink">{label}</span>
        {sub && (
          <span className="text-caption font-normal tabular-nums text-ink-faint">{sub}</span>
        )}
      </Link>
    </li>
  );
}

// Ảnh minh hoạ nền trắng, không đĩa bao quanh. mix-blend-multiply làm nền trắng
// tan vào ô, nên lúc hover ô đổi sang xám nhạt cũng không lộ khung vuông.
function TileArt({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={256}
      height={256}
      unoptimized
      draggable={false}
      className="h-16 w-16 select-none mix-blend-multiply transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
    />
  );
}

// Danh mục chưa có ảnh minh hoạ. Ảnh API trộn kiểu (cutout lẫn ảnh chụp nền
// trắng/xám) nên đặt trên đĩa TRẮNG + hairline cho nền vuông khỏi đâm ra; không
// có ảnh thì chữ cái đầu trên nền tint cho khỏi rỗng.
function FallbackDisc({ image, letter }: { image?: string; letter: string }) {
  return (
    <span
      className={
        image
          ? 'flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-ink/10'
          : 'flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brand-tint'
      }
    >
      {image ? (
        <img src={imageUrl(image, 400)} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[19px] font-bold text-brand" aria-hidden="true">
          {letter.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
