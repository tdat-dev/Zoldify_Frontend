"use client";

import Link from 'next/link';
import { ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format';

/**
 * Hero chia đôi: chữ trái, một mảng ảnh LỚN bên phải có khối màu đỡ phía sau,
 * kèm chip giá nổi lên — đúng cách các sàn tham chiếu tạo sức nặng mở đầu.
 *
 * Bản trước xếp ba thẻ nhỏ bên phải nên hero đọc ra như một mẩu lưới sản phẩm
 * chứ không phải mở đầu trang. Ảnh lấy từ món mới đăng gần nhất: hàng có thật,
 * không phải ảnh minh hoạ, và tự đổi theo kho.
 *
 * Không "25K+ khách hàng", không sao đánh giá, không đếm ngược — Zoldify không
 * có mấy thứ đó.
 */
export function HomeHero({ showcase }: { showcase: any[] }) {
  const lead = showcase[0];
  const second = showcase[1];

  return (
    <section
      aria-labelledby="hero-title"
      className="overflow-hidden rounded-2xl bg-brand-tint px-6 py-10 md:px-10 md:py-14 lg:px-14"
    >
      <div className="grid items-center gap-10 md:grid-cols-[1fr_minmax(0,1.05fr)] md:gap-12">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-surface-card px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-accent">
            Chợ đồ cũ của sinh viên
          </p>

          <h1
            id="hero-title"
            className="text-[clamp(2.1rem,4.6vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance]"
          >
            Đồ cũ trong trường,
            <br />
            <span className="text-brand">bán nhanh mua rẻ</span>
          </h1>

          <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-ink-muted [text-wrap:pretty]">
            Giáo trình, laptop, đồ ký túc xá — mua bán giữa sinh viên với nhau. Tiền chuyển cho
            Zoldify giữ, không chuyển thẳng cho người lạ.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              Tìm đồ cần mua
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/product/create"
              className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-surface-card px-7 py-3.5 text-sm font-bold text-ink transition-colors hover:border-ink/35"
            >
              Đăng bán đồ cũ
            </Link>
          </div>

          <p className="mt-7 flex items-start gap-2 text-[13px] text-ink-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
            Trong lúc hàng đang đi, người bán thấy đơn nhưng chưa rút được tiền.
          </p>
        </div>

        <div className="relative">
          {/* Khối màu đỡ phía sau ảnh, cho hero có chiều sâu thay vì một ô ảnh phẳng. */}
          <div
            aria-hidden="true"
            className="absolute -right-6 -top-6 hidden h-40 w-40 rounded-full bg-brand/12 md:block"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -left-8 hidden h-28 w-28 rounded-full bg-brand-accent/12 md:block"
          />

          {lead ? (
            <div className="relative">
              <Link
                href={`/product/${lead.id}`}
                className="block overflow-hidden rounded-2xl bg-surface-card shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
                  {lead.image ? (
                    <img src={lead.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-ink-faint" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Chip giá nổi lên mép ảnh, đúng nhịp của các trang tham chiếu —
                  nhưng là giá THẬT của món đang đăng. */}
              <div className="absolute -bottom-5 left-4 max-w-[78%] rounded-xl bg-surface-card p-3 shadow-lg ring-1 ring-ink/5">
                <p className="line-clamp-1 text-xs text-ink-muted">{lead.name}</p>
                <p className="mt-0.5 text-base font-extrabold text-price">
                  {formatPrice(lead.price)}
                </p>
              </div>

              {second && (
                <Link
                  href={`/product/${second.id}`}
                  className="absolute -right-3 top-6 hidden w-32 overflow-hidden rounded-xl bg-surface-card shadow-lg ring-1 ring-ink/5 lg:block"
                >
                  <div className="aspect-square overflow-hidden bg-surface-sunken">
                    {second.image ? (
                      <img src={second.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-ink-faint" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <p className="px-2 py-1.5 text-xs font-bold text-price">
                    {formatPrice(second.price)}
                  </p>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-surface-card/70 p-8 text-center">
              <p className="max-w-[28ch] text-sm text-ink-muted">
                Hàng đang bán sẽ hiện ở đây. Bạn có đồ cũ không dùng nữa thì đăng lên trước đi.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
