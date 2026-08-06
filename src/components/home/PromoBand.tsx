"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Package } from 'lucide-react';
import { demoSaleEndsAt, DEMO_MODE } from '@/lib/demo';

/**
 * Dải khuyến mãi giữa trang, dựng theo đúng khối "FLASH SALE" của mẫu: nền tối,
 * nhãn nhỏ có icon, tiêu đề rất lớn, dòng phụ, bốn ô đếm ngược, nút trắng, ảnh
 * bên phải và huy hiệu tròn.
 *
 * ĐỒNG HỒ ĐẾM NGƯỢC LÀ DEMO: Zoldify không có chương trình khuyến mãi nào, nên
 * mốc kết thúc là 23:59 hôm nay (xem src/lib/demo.ts). Tắt DEMO_MODE thì khối
 * này đổi sang nội dung thật về cơ chế giữ tiền, không còn đếm ngược.
 */
const BOXES: Array<{ key: 'd' | 'h' | 'm' | 's'; label: string }> = [
  { key: 'd', label: 'Ngày' },
  { key: 'h', label: 'Giờ' },
  { key: 'm', label: 'Phút' },
  { key: 's', label: 'Giây' },
];

function useCountdown(target: number) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function PromoBand({ lead }: { lead?: any }) {
  const [endsAt] = useState(() => demoSaleEndsAt());
  const t = useCountdown(endsAt);

  return (
    <section
      aria-labelledby="promo-band"
      className="relative overflow-hidden rounded-2xl bg-ink px-7 py-8 md:px-10 md:py-10"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="lg:max-w-[34%]">
          <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
            <Zap className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
            {DEMO_MODE ? 'Giờ vàng đồ cũ' : 'Mua đồ cũ an toàn'}
          </p>

          <h2
            id="promo-band"
            className="text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold leading-[1.08] text-white"
          >
            {DEMO_MODE ? 'Giảm tới 70%' : 'Không phải tin người lạ'}
          </h2>

          <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-white/70">
            {DEMO_MODE
              ? 'Đồ cũ sinh viên thanh lý nhanh, số lượng có hạn.'
              : 'Rủi ro của chợ đồ cũ nằm ở lúc chuyển tiền. Zoldify giữ tiền cho tới khi đơn xong.'}
          </p>

          <Link
            href="/search"
            className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-white/90"
          >
            Xem hàng đang bán
          </Link>
        </div>

        {DEMO_MODE && (
          <ul className="flex shrink-0 gap-3" aria-label="Thời gian còn lại">
            {BOXES.map(({ key, label }) => (
              <li
                key={key}
                className="flex min-w-[68px] flex-col items-center rounded-xl bg-white/10 px-3 py-4 text-center md:min-w-[76px]"
              >
                <span className="text-2xl font-extrabold tabular-nums text-white md:text-[28px]">
                  {t ? String(t[key]).padStart(2, '0') : '--'}
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-wide text-white/60">{label}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="relative hidden shrink-0 lg:block">
          <div className="h-[168px] w-[224px] overflow-hidden rounded-xl bg-white/10">
            {lead?.image ? (
              <img src={lead.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-10 w-10 text-white/40" aria-hidden="true" />
              </div>
            )}
          </div>
          <span className="absolute -right-3 -top-4 flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full bg-brand text-center text-white shadow-lg">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-white/80">Tới</span>
            <span className="text-lg font-extrabold leading-none">70%</span>
          </span>
        </div>
      </div>
    </section>
  );
}
