/**
 * Shop đã khai đủ địa chỉ lấy hàng chưa. Đúng 6 trường mà backend kiểm trước
 * khi cho đăng bán (assertSellerHasPickup trong products.service.ts); sửa bên
 * đó thì sửa cả đây.
 */
const REQUIRED_PICKUP_FIELDS = [
  'pickup_name',
  'pickup_phone',
  'pickup_address',
  'pickup_ward_name',
  'pickup_district_name',
  'pickup_province_name',
] as const;

export function hasPickupAddress(shop: Record<string, unknown> | null | undefined): boolean {
  if (!shop) return false;
  return REQUIRED_PICKUP_FIELDS.every((key) => {
    const value = shop[key];
    return typeof value === 'string' && value.trim() !== '';
  });
}

/**
 * Đường quay về sau khi lưu Cài đặt shop (?next=). Chỉ nhận đường dẫn nội bộ:
 * "//evil.com" hay "https://..." sẽ biến trang này thành chỗ chuyển hướng ra ngoài.
 */
export function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null;
  return raw;
}
