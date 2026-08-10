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

import type { StatusTone } from './status-tone';

export { TONE_CLASS } from './status-tone';
export type { StatusTone } from './status-tone';

const TONE: Record<OrderStatus, StatusTone> = {
  pending: 'pending',
  confirmed: 'progress',
  processing: 'progress',
  shipping: 'progress',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
};

/**
 * Chuỗi trạng thái bình thường của một đơn, đúng thứ tự. Dùng để vẽ tiến trình.
 *
 * `cancelled` và `refunded` KHÔNG nằm trên chuỗi này: chúng là điểm kết thúc rẽ
 * ngang, có thể xảy ra từ nhiều bước khác nhau. Nhét chúng vào cuối chuỗi sẽ
 * ngụ ý mọi đơn đều đi qua chúng.
 */
export const ORDER_FLOW = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'delivered',
] as const satisfies readonly OrderStatus[];

/** Vị trí trên chuỗi, -1 nếu trạng thái nằm ngoài luồng (huỷ / hoàn tiền). */
export function flowIndex(raw: unknown): number {
  return (ORDER_FLOW as readonly string[]).indexOf(String(raw));
}

export function isOrderStatus(raw: unknown): raw is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(String(raw));
}

export function orderStatusTone(raw: unknown): StatusTone {
  return isOrderStatus(raw) ? TONE[raw] : 'neutral';
}

