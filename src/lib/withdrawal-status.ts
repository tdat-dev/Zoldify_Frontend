import type { StatusTone } from './status-tone';

/**
 * Trạng thái lệnh rút tiền — MỘT nguồn duy nhất cho trang ví và trang quản trị.
 *
 * Viết thành file riêng ngay từ đầu, không chờ tới lúc có bản sao thứ hai. Bộ
 * trạng thái đơn hàng đã đi hết con đường đó: bốn nơi tự khai một danh sách,
 * bản ở trang quản trị thiếu hai giá trị, nên admin không cách nào chuyển đơn
 * sang hai trạng thái ấy và đơn đang ở đó thì hiện ra ô trống.
 *
 * Giá trị lấy từ `WithdrawalStatus` trong
 * `Zoldify_Backend/src/money/withdrawals/entities/withdrawal.entity.ts`.
 */
export const WITHDRAWAL_STATUSES = [
  'pending',
  'approved',
  'completed',
  'rejected',
] as const;

export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

/**
 * Thứ tự trên là thứ tự vòng đời, không phải bảng chữ cái: chờ duyệt → đã duyệt
 * → đã chuyển, và `rejected` đứng cuối vì nó là nhánh rẽ ra chứ không phải bước
 * tiếp theo của `approved`.
 */
const TONE: Record<WithdrawalStatus, StatusTone> = {
  pending: 'pending',
  approved: 'progress',
  completed: 'success',
  rejected: 'danger',
};

export function withdrawalStatusTone(raw: unknown): StatusTone {
  return TONE[raw as WithdrawalStatus] ?? 'neutral';
}

/**
 * Tiền còn bị giữ hay không.
 *
 * Gửi lệnh là tiền rời `available` sang `withdrawal_pending` ngay lập tức.
 * Duyệt KHÔNG làm tiền chạy đi đâu cả — nó chỉ đổi nhãn. Mãi tới `completed`
 * tiền mới thật sự rời hệ thống, còn `rejected` thì trả lại chỗ cũ.
 *
 * Nên "đang bị giữ" gồm cả `pending` lẫn `approved`. Đếm thiếu `approved` là
 * cách dễ nhất để tổng hiển thị lệch với sổ cái.
 */
export function isHoldingMoney(raw: unknown): boolean {
  return raw === 'pending' || raw === 'approved';
}

/** Lệnh còn chờ admin làm gì đó. Dùng để bật/tắt nút trong trang quản trị. */
export function isActionable(raw: unknown): boolean {
  return raw === 'pending' || raw === 'approved';
}
