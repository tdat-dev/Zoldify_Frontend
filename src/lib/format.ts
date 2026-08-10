import { API_ORIGIN } from './config';

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

/**
 * Định dạng tiền, một chỗ duy nhất cho toàn site.
 *
 * ĐỊNH HƯỚNG ĐA QUỐC GIA — đọc trước khi sửa:
 * Backend hiện KHÔNG có cột `currency` ở bất kỳ bảng nào (giá là
 * `decimal(15,2)` trần trong `catalog/products/entities/product.entity.ts`).
 * Nghĩa là mọi con số trong hệ thống đều ngầm hiểu là đồng Việt Nam, và giao
 * diện không có cách nào biết một số tiền thuộc tiền tệ gì.
 *
 * Nên hàm này NHẬN vào tiền tệ thay vì gán chết `vi-VN`/`₫`, và tạm mặc định
 * VND cho tới khi backend thêm cột. Khi có cột rồi thì chỗ phải sửa là lời gọi
 * (`formatPrice(item.price, item.currency)`), không phải bới lại toàn site.
 *
 * Không tự quy đổi tỉ giá ở đây: quy đổi cần nguồn tỉ giá và thời điểm chốt giá,
 * đó là việc của backend chứ không phải của một hàm định dạng.
 */
const LOCALE_BY_CURRENCY: Record<string, string> = {
  VND: 'vi-VN',
  USD: 'en-US',
  EUR: 'de-DE',
  JPY: 'ja-JP',
};

export const DEFAULT_CURRENCY = 'VND';

/**
 * Đường dẫn đầy đủ cho ảnh backend trả về.
 *
 * Backend trả khi thì URL tuyệt đối, khi thì đường dẫn tương đối. Ba trang từng
 * tự ghép bằng chuỗi VIẾT CỨNG `http://localhost:3000/` — lên môi trường thật
 * là ảnh chết hết, mà chỉ phát hiện được sau khi deploy. Ghép từ API_ORIGIN,
 * cùng nguồn mà mọi request REST đang dùng.
 */
export function imageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}

export function formatPrice(
  value: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      // Đồng không có phần lẻ; các tiền tệ khác giữ mặc định của Intl.
      maximumFractionDigits: currency === 'VND' ? 0 : undefined,
    }).format(n);
  } catch {
    // Mã tiền tệ lạ thì vẫn in ra số chứ không để trang vỡ.
    return `${n.toLocaleString(locale)} ${currency}`;
  }
}
