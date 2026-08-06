import { ShieldCheck, RotateCcw, Wallet, Store } from 'lucide-react';

/**
 * Dải 4 mục ngay dưới hero, đúng kiểu trang tham chiếu: icon trong ô bo góc có
 * nền màu nhạt riêng, tiêu đề đậm, một dòng phụ mờ hơn, ngăn nhau bằng vạch dọc.
 *
 * Trang mẫu ghi "Free Shipping / Easy Returns / Secure Checkout / 24/7 Support".
 * Zoldify không bao ship, không có tổng đài 24/7, nên bốn mục dưới đây là bốn
 * việc sàn làm thật, đã đối chiếu backend.
 */
const ITEMS = [
  {
    icon: ShieldCheck,
    tint: 'bg-blue-50 text-blue-600',
    title: 'Zoldify giữ tiền',
    body: 'Không vào thẳng túi người bán',
  },
  {
    icon: RotateCcw,
    tint: 'bg-emerald-50 text-emerald-600',
    title: 'Huỷ đơn là hoàn',
    body: 'Khi người bán chưa xác nhận',
  },
  {
    icon: Wallet,
    tint: 'bg-violet-50 text-violet-600',
    title: 'Trả kiểu nào cũng được',
    body: 'COD, ví Zoldify, thẻ qua PayOS',
  },
  {
    icon: Store,
    tint: 'bg-amber-50 text-amber-600',
    title: 'Xem được người bán',
    body: 'Biết họ đang bán gì khác',
  },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Zoldify hoạt động thế nào"
      className="rounded-xl border border-ink/8 bg-surface-card"
    >
      <ul className="grid divide-y divide-ink/8 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {ITEMS.map(({ icon: Icon, tint, title, body }) => (
          <li key={title} className="flex items-center gap-3.5 px-5 py-5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-ink">{title}</p>
              <p className="truncate text-[12px] text-ink-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
