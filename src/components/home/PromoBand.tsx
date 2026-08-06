import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

/**
 * Dải đậm màu cắt giữa hai lưới hàng — giữ đúng vai trò và hình khối của dải
 * "FLASH SALE" ở trang tham chiếu: nền tối, nhãn nhỏ có icon, tiêu đề rất lớn,
 * một dòng phụ, nút trắng, và các ô vuông xếp ngang bên phải.
 *
 * Zoldify không có chương trình giảm giá nên không dựng đồng hồ đếm ngược (đếm
 * ngược tới một mốc không tồn tại là bịa). Ba ô vuông thay bằng ba chặng của cơ
 * chế giữ tiền — vẫn là ba khối số/chữ xếp ngang, nhưng nói đúng thứ sàn làm.
 * Đánh số 1-2-3 chính đáng vì đây là trình tự thật, thứ tự là thông tin.
 */
const STEPS = [
  { n: '1', label: 'Bạn trả tiền', sub: 'Vào Zoldify' },
  { n: '2', label: 'Zoldify giữ', sub: 'Người bán chưa rút được' },
  { n: '3', label: 'Huỷ thì hoàn', sub: 'Khi chưa xác nhận' },
];

export function PromoBand() {
  return (
    <section
      aria-labelledby="promo-band"
      className="overflow-hidden rounded-2xl bg-ink px-7 py-8 md:px-10 md:py-10"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="lg:max-w-[38%]">
          <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-tint">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Mua đồ cũ an toàn
          </p>

          <h2
            id="promo-band"
            className="text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold leading-[1.1] text-white"
          >
            Không phải tin người lạ
          </h2>

          <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-white/70">
            Rủi ro của chợ đồ cũ nằm ở lúc chuyển tiền. Zoldify đứng giữa giữ tiền cho tới khi
            đơn xong.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-white/90"
          >
            Xem hàng đang bán
          </Link>
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:shrink-0">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex min-w-[128px] flex-col items-center rounded-xl bg-white/10 px-4 py-5 text-center"
            >
              <span className="text-2xl font-extrabold tabular-nums text-white">{s.n}</span>
              <span className="mt-2 text-[12.5px] font-bold text-white">{s.label}</span>
              <span className="mt-1 text-[11px] leading-tight text-white/70">{s.sub}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
