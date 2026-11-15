/**
 * Tiền vào hay tiền ra — nguồn DUY NHẤT.
 *
 * Backend có HAI bộ từ vựng cho việc này, tuỳ bảng:
 *   payments.type            -> PaymentType      : order_payment | wallet_topup
 *   wallet_transactions.type -> TransactionType  : topup | payment | refund | withdrawal
 *
 * Frontend trước đây kiểm `t.type === 'deposit'`. Chuỗi 'deposit' KHÔNG có
 * trong bộ nào cả. Hậu quả: mọi giao dịch rơi vào nhánh còn lại, nên một lần
 * NẠP 500.000 ₫ hiện ra là "−500.000 ₫ · Thanh toán đơn hàng" — mũi tên đỏ,
 * dấu trừ, nhãn sai. Đây là lỗi hiển thị tiền, loại tệ nhất.
 *
 * Nhận cả hai bộ vì màn hình ví có thể được nối vào một trong hai endpoint;
 * đoán một bộ rồi bỏ bộ kia chính là cách lỗi cũ sinh ra.
 */
export type MoneyFlow = 'in' | 'out' | 'unknown';

// Bộ thứ ba: GET /wallets/transactions đọc sổ cái, type là LedgerTxType
// (topup | order_hold | escrow_release | escrow_refund | withdrawal_approve |
// withdrawal_complete | adjustment) và amount có dấu: dương vào ví, âm ra ví.
const IN = new Set(['wallet_topup', 'topup', 'refund', 'escrow_release', 'escrow_refund']);
const OUT = new Set(['order_payment', 'payment', 'withdrawal', 'order_hold', 'withdrawal_approve']);

/** Có `amount` có dấu (dòng sổ cái) thì tin dấu hơn tin tên loại. */
export function moneyFlow(rawType: unknown, signedAmount?: number): MoneyFlow {
  if (typeof signedAmount === 'number' && signedAmount !== 0) return signedAmount > 0 ? 'in' : 'out';
  const t = String(rawType ?? '');
  if (IN.has(t)) return 'in';
  if (OUT.has(t)) return 'out';
  return 'unknown';
}

/**
 * Khoá i18n cho nhãn giao dịch. Trả về null khi không nhận ra kiểu — nơi gọi
 * hiện nguyên văn giá trị backend trả về thay vì gán bừa một nhãn gần đúng.
 */
export function moneyLabelKey(rawType: unknown): string | null {
  const t = String(rawType ?? '');
  const known: Record<string, string> = {
    wallet_topup: 'topup',
    topup: 'topup',
    order_payment: 'payment',
    payment: 'payment',
    refund: 'refund',
    withdrawal: 'withdrawal',
    order_hold: 'payment',
    escrow_release: 'sale',
    escrow_refund: 'refund',
    withdrawal_approve: 'withdrawal',
    withdrawal_complete: 'withdrawal',
    adjustment: 'adjustment',
  };
  return known[t] ?? null;
}
