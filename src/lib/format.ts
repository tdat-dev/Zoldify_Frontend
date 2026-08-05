/**
 * Một chỗ duy nhất định dạng tiền cho toàn site.
 * Trước đây trang chủ hiển thị cả "45.000đ" lẫn "đ45.000" trên cùng một màn hình.
 */
export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toLocaleString('vi-VN')}₫`;
}
