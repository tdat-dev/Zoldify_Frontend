/**
 * Một chỗ duy nhất định dạng tiền cho toàn site.
 * Trước đây trang chủ hiển thị cả "45.000đ" lẫn "đ45.000" trên cùng một màn hình.
 */
/**
 * "2 giờ trước", "3 ngày trước" — tín hiệu quan trọng nhất của chợ đồ cũ mà
 * khuôn thương mại điện tử không có chỗ đặt. Món đăng hôm nay đáng tin hơn món
 * treo ba tháng, và người mua đọc nó trước cả giá.
 */
export function timeAgo(value: any): string | null {
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return null;
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 0) return null;
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 2592000) return `${Math.floor(s / 86400)} ngày trước`;
  if (s < 31536000) return `${Math.floor(s / 2592000)} tháng trước`;
  return `${Math.floor(s / 31536000)} năm trước`;
}

export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toLocaleString('vi-VN')}₫`;
}
