/**
 * Trạng thái đơn hàng — nguồn DUY NHẤT, khớp đúng enum backend
 * (ordering/orders/entities/order.entity.ts:17-25).
 *
 * Trước đây bản đồ trạng thái được chép tay vào /profile/orders và
 * /profile/orders/[id], và cả hai bản chép đều dựng theo một enum KHÔNG TỒN TẠI:
 *
 *   - `pending_payment` backend không có. Tab "Chờ thanh toán" gọi
 *     ?status=pending_payment nên vĩnh viễn rỗng, và nút "Thanh toán ngay" chỉ
 *     hiện khi status === 'pending_payment' nên chưa bao giờ được vẽ ra.
 *   - `completed` backend không có; tên thật là `delivered`. Tab "Đã giao" vĩnh
 *     viễn rỗng, còn đơn đã giao thật thì rơi vào nhánh mặc định và hiện cho
 *     người dùng đúng chữ "delivered".
 *   - `processing` và `refunded` bị bỏ sót hoàn toàn, cũng hiện ra chữ tiếng Anh.
 *
 * Ba lỗi khác nhau, một gốc: không ai có một chỗ để nhìn xem enum thật là gì.
 */
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Sắc thái dùng để chọn cặp token state-*-fg / state-*-bg trong globals.css. */
export type StatusTone = 'pending' | 'progress' | 'success' | 'danger' | 'neutral';

const TONE: Record<OrderStatus, StatusTone> = {
  pending: 'pending',
  confirmed: 'progress',
  processing: 'progress',
  shipping: 'progress',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
};

export function isOrderStatus(raw: unknown): raw is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(String(raw));
}

export function orderStatusTone(raw: unknown): StatusTone {
  return isOrderStatus(raw) ? TONE[raw] : 'neutral';
}

/**
 * Lớp CSS cho một sắc thái. Viết thẳng chuỗi đầy đủ chứ KHÔNG ghép
 * `bg-state-${tone}-bg`: Tailwind quét mã nguồn bằng văn bản, tên lớp ghép động
 * không nằm trong bản quét nên không sinh ra CSS nào — đúng loại lỗi im lặng đã
 * làm chết 21 lớp bo màu trước đó.
 */
export const TONE_CLASS: Record<StatusTone, string> = {
  pending: 'bg-state-pending-bg text-state-pending-fg',
  progress: 'bg-state-progress-bg text-state-progress-fg',
  success: 'bg-state-success-bg text-state-success-fg',
  danger: 'bg-state-danger-bg text-state-danger-fg',
  neutral: 'bg-state-neutral-bg text-state-neutral-fg',
};
