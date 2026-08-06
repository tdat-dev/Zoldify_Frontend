"use client";

import Link from 'next/link';
import { ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format';

/**
 * Hero chia đôi theo đúng bộ xương của các sàn tham chiếu: chữ bên trái,
 * hình bên phải.
 *
 * Khác một điểm có chủ ý: bên phải KHÔNG dùng ảnh stock sinh ra, mà xếp
 * chính hàng thật đang đăng. Sàn mua bán khoe hàng có thật thì đáng tin hơn
 * khoe ảnh minh hoạ, và nó tự cập nhật theo kho.
 *
 * Không có "25K+ khách hàng", không sao đánh giá, không đếm ngược flash sale —
 * Zoldify không có mấy thứ đó, bịa ra là nói dối người dùng.
 */
export function HomeHero({ showcase }: { showcase: any[] }) {
  const items = showcase.slice(0, 3);

  return (
    <section aria-labelledby="hero-title" className="overflow-hidden rounded-2xl bg-brand-tint">
      <div className="grid items-center gap-8 p-6 md:grid-cols-2 md:gap-10 md:p-10 lg:p-12">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent">
            Chợ đồ cũ của sinh viên
          </p>

          <h1
            id="hero-title"
            className="text-[clamp(1.9rem,4.2vw,3.1rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink [text-wrap:balance]"
          >
            Đồ cũ trong trường,
            <br className="hidden sm:block" />{' '}
            <span className="text-brand">bán nhanh mua rẻ</span>
          </h1>

          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-muted [text-wrap:pretty]">
            Giáo trình, laptop, đồ ký túc xá — mua bán giữa sinh viên với nhau. Tiền chuyển cho
            Zoldify giữ, không chuyển thẳng cho người lạ.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Tìm đồ cần mua
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/product/create"
              className="inline-flex items-center gap-2 rounded-xl border border-ink/20 bg-surface-card px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/35"
            >
              Đăng bán đồ cũ
            </Link>
          </div>

          <p className="mt-6 flex items-start gap-2 text-[13px] text-ink-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" aria-hidden="true" />
            Trong lúc hàng đang đi, người bán thấy đơn nhưng chưa rút được tiền.
          </p>
        </div>

        <div className="relative">
          {items.length > 0 ? (
            // Món đầu chiếm cả hàng trên (ảnh ngang), hai món sau chia đôi hàng
            // dưới. Bản trước dùng row-span cho thẻ trái: lưới kéo giãn thẻ cho
            // bằng cột bên cạnh nên dưới giá thừa ra một mảng trắng lớn, nhìn
            // như vỡ layout. Lưới này mọi thẻ đều tự cao theo nội dung.
            <ul className="grid grid-cols-2 gap-3">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className={`overflow-hidden rounded-xl bg-surface-card shadow-sm ${i === 0 ? 'col-span-2' : ''}`}
                >
                  <Link href={`/product/${item.id}`} className="block">
                    <div
                      className={`relative overflow-hidden bg-surface-sunken ${i === 0 ? 'aspect-[16/9]' : 'aspect-square'}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-xs text-ink-muted">{item.name}</p>
                      <p className="mt-1 text-sm font-bold text-price">{formatPrice(item.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            // Chưa có hàng hoặc API chưa trả: một khối im lặng, không phải khung
            // ảnh vỡ và cũng không phải sản phẩm bịa.
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-ink/15 bg-surface-card/60 p-8 text-center">
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
