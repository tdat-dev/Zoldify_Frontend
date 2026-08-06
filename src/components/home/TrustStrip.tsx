import { ShieldCheck, RotateCcw, Wallet, Store } from 'lucide-react';

/**
 * Dải tin cậy 4 mục như các sàn tham chiếu, nhưng dựng bằng MỘT hàng có vạch
 * ngăn chứ không phải 4 thẻ giống hệt nhau — craft-rules cấm lưới thẻ đồng dạng
 * làm vật liệu lấp section.
 *
 * Cả bốn câu đều là việc Zoldify làm thật, đã đối chiếu với backend:
 * escrow giữ tiền ở trạng thái HOLDING, huỷ đơn khi chưa xác nhận thì hoàn,
 * ba cách thanh toán có thật ở checkout, và mỗi món đều dẫn về trang người bán.
 */
const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Zoldify giữ tiền',
    body: 'Tiền vào Zoldify khi đơn được thanh toán, không vào thẳng túi người bán.',
  },
  {
    icon: RotateCcw,
    title: 'Huỷ đơn là hoàn',
    body: 'Đơn còn chờ người bán xác nhận, bạn bấm huỷ thì tiền quay về.',
  },
  {
    icon: Wallet,
    title: 'Trả kiểu nào cũng được',
    body: 'Thanh toán khi nhận hàng, ví Zoldify, hoặc thẻ nội địa và quốc tế qua PayOS.',
  },
  {
    icon: Store,
    title: 'Xem được người bán',
    body: 'Mỗi món đều dẫn tới trang người bán, xem họ đang bán gì khác.',
  },
];

export function TrustStrip() {
  return (
    <section aria-label="Zoldify hoạt động thế nào" className="rounded-2xl bg-surface-card px-2">
      <ul className="grid divide-y divide-ink/8 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-start gap-4 px-5 py-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
              <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
