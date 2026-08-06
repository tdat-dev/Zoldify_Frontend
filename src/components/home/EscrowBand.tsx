import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Dải đậm màu cắt giữa hai lưới sản phẩm — giữ vai trò nhịp mà banner flash
 * sale đảm nhiệm ở các trang tham chiếu. Zoldify không có chương trình giảm giá
 * nào nên không dựng đồng hồ đếm ngược; thay bằng thứ Zoldify làm thật.
 *
 * Đánh số 1-2-3 ở đây là chính đáng chứ không phải trang trí: đây là một trình
 * tự thật, và thứ tự các bước là thông tin người đọc cần.
 */
const STEPS = [
  { n: '1', title: 'Bạn trả tiền', body: 'Tiền vào Zoldify khi đơn được thanh toán, không vào thẳng túi người bán.' },
  { n: '2', title: 'Zoldify giữ', body: 'Trong lúc hàng đang đi, người bán thấy đơn nhưng chưa rút được.' },
  { n: '3', title: 'Huỷ thì hoàn', body: 'Đơn còn chờ người bán xác nhận, bạn bấm huỷ là tiền quay về.' },
];

export function EscrowBand() {
  return (
    <section aria-labelledby="escrow-band" className="overflow-hidden rounded-2xl bg-brand-dark">
      <div className="grid gap-8 p-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] md:items-center md:gap-10 md:p-10">
        <div>
          <h2
            id="escrow-band"
            className="text-[clamp(1.35rem,2.4vw,1.9rem)] font-extrabold leading-tight text-white [text-wrap:balance]"
          >
            Tiền của bạn đi đường nào
          </h2>
          <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-white/75">
            Mua đồ cũ từ người lạ thì rủi ro nằm ở chỗ chuyển tiền. Zoldify đứng giữa để bạn
            không phải tin người lạ.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-dark transition-colors hover:bg-white/90"
          >
            Xem hàng đang bán
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-xl bg-white/10 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-brand-dark">
                {s.n}
              </span>
              <p className="mt-3 text-sm font-bold text-white">{s.title}</p>
              {/* /70 đo composite ra 3.81:1 trên nền thẻ mờ (white/10 chồng
                  brand-dark), dưới vạch 4.5 cho chữ 12px. /90 đạt ~5.4:1. */}
              <p className="mt-1.5 text-xs leading-relaxed text-white/90">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
