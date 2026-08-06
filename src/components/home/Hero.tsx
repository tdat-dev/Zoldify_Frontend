"use client";

import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { Stars } from './Stars';
import { DEMO_SOCIAL } from '@/lib/demo';

/**
 * Hero theo đúng bố cục trang tham chiếu: panel bo góc nền xanh nhạt, chữ bên
 * trái (nhãn nhỏ → tiêu đề hai dòng, dòng sau đổi màu → mô tả → hai nút →
 * dải chứng thực), ảnh bên phải, huy hiệu tròn góc trên phải.
 *
 * Ba chỗ trang mẫu dùng số bịa được thay bằng số THẬT lấy từ API:
 * - "25K+ Happy Customers / 4.9/5 (2.5K Reviews)" -> số món đang bán, số danh mục.
 * - "UP TO 50% OFF" -> giá món rẻ nhất đang có.
 * Zoldify không có khuyến mãi, không có điểm đánh giá tổng, nên không vẽ ra.
 */
export function Hero({
  showcase,
  totalProducts,
  totalCategories,
}: {
  showcase: any[];
  totalProducts: number | null;
  totalCategories: number | null;
}) {
  const lead = showcase[0];
  const cheapest = showcase.length
    ? showcase.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
    : null;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden rounded-2xl bg-brand-tint"
    >
      <div className="grid items-center gap-8 p-7 md:grid-cols-2 md:gap-6 md:p-10 lg:p-12">
        <div>
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            Chợ đồ cũ của sinh viên
          </p>

          <h1
            id="hero-title"
            className="text-[clamp(2rem,4vw,3.15rem)] font-extrabold leading-[1.12] tracking-[-0.025em] text-ink"
          >
            Đồ cũ còn tốt,
            <br />
            <span className="text-brand">giá sinh viên</span>
          </h1>

          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-muted">
            Giáo trình, laptop, đồ ký túc xá — mua bán giữa sinh viên với nhau, tiền để Zoldify
            giữ cho tới khi đơn xong.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Xem hàng đang bán
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/product/create"
              className="inline-flex items-center gap-2 rounded-lg bg-surface-card px-6 py-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-white"
            >
              Đăng bán đồ cũ
            </Link>
          </div>

          {/* Dải chứng thực như mẫu. Số lượt mua bán và điểm đánh giá là SỐ DEMO
              (src/lib/demo.ts); số món đang bán và số danh mục là số THẬT lấy
              từ meta.total của API. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="flex -space-x-2" aria-hidden="true">
                {DEMO_SOCIAL.initials.map((ch, i) => (
                  <span
                    key={ch}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-tint text-[11px] font-bold text-white ${
                      ['bg-brand', 'bg-brand-accent', 'bg-amber-500', 'bg-emerald-600'][i % 4]
                    }`}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <p className="text-[13px] leading-tight">
                <span className="font-extrabold text-ink">{DEMO_SOCIAL.customers}</span>{' '}
                <span className="text-ink-muted">{DEMO_SOCIAL.customersLabel}</span>
                <br />
                <span className="mt-0.5 inline-flex items-center gap-1.5">
                  <Stars rating={DEMO_SOCIAL.rating} size={11} />
                  <span className="text-ink-muted">
                    {DEMO_SOCIAL.rating}/5 ({DEMO_SOCIAL.reviews} đánh giá)
                  </span>
                </span>
              </p>
            </div>

            {(totalProducts !== null || totalCategories !== null) && (
              <p className="text-[13px] text-ink-muted">
                {totalProducts !== null && (
                  <>
                    <span className="font-extrabold text-ink">{totalProducts}</span> món đang bán
                  </>
                )}
                {totalProducts !== null && totalCategories !== null && ' · '}
                {totalCategories !== null && (
                  <>
                    <span className="font-extrabold text-ink">{totalCategories}</span> danh mục
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          {lead ? (
            <Link href={`/product/${lead.id}`} className="block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-card">
                {lead.image ? (
                  <img src={lead.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-14 w-14 text-ink-faint" aria-hidden="true" />
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-ink/15 bg-surface-card/70 p-8 text-center">
              <p className="max-w-[26ch] text-sm text-ink-muted">
                Hàng đang bán sẽ hiện ở đây. Có đồ cũ không dùng nữa thì đăng lên trước đi.
              </p>
            </div>
          )}

          {/* Huy hiệu tròn: trang mẫu ghi "UP TO 50% OFF". Zoldify không giảm giá,
              nên ghi giá món rẻ nhất đang bán — một con số thật, kiểm được. */}
          {cheapest && (
            <div className="absolute -right-1 -top-3 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-brand text-center text-white shadow-lg md:h-28 md:w-28">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
                Rẻ nhất từ
              </span>
              <span className="mt-0.5 text-sm font-extrabold leading-tight md:text-base">
                {formatPrice(cheapest.price)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
