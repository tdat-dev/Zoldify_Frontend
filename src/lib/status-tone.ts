/**
 * Sắc thái trạng thái dùng chung cho mọi loại nhãn (đơn hàng, tin đăng, rút
 * tiền…), ánh xạ sang các cặp token state-*-fg / state-*-bg trong globals.css.
 *
 * Tách ra khỏi order-status.ts vì tin đăng và đơn hàng có bộ trạng thái khác
 * nhau nhưng cùng một bảng màu — chép bảng lớp sang file thứ hai là cách một
 * trong hai bản bắt đầu trôi khỏi bản kia.
 */
export type StatusTone = 'pending' | 'progress' | 'success' | 'danger' | 'neutral';

/**
 * Viết sẵn từng chuỗi đầy đủ, KHÔNG ghép `bg-state-${tone}-bg`: Tailwind quét
 * mã nguồn bằng văn bản nên tên lớp ghép động không sinh ra CSS nào.
 */
export const TONE_CLASS: Record<StatusTone, string> = {
  pending: 'bg-state-pending-bg text-state-pending-fg',
  progress: 'bg-state-progress-bg text-state-progress-fg',
  success: 'bg-state-success-bg text-state-success-fg',
  danger: 'bg-state-danger-bg text-state-danger-fg',
  neutral: 'bg-state-neutral-bg text-state-neutral-fg',
};
