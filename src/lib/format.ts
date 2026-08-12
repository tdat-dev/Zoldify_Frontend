import { API_ORIGIN } from './config';

/**
 * Một chỗ duy nhất định dạng tiền cho toàn site.
 * Trước đây trang chủ hiển thị cả "45.000đ" lẫn "đ45.000" trên cùng một màn hình.
 */
/**
 * "2 giờ trước", "3 ngày trước" — tín hiệu quan trọng nhất của chợ đồ cũ mà
 * khuôn thương mại điện tử không có chỗ đặt. Món đăng hôm nay đáng tin hơn món
 * treo ba tháng, và người mua đọc nó trước cả giá.
 *
 * ⚠️ CHƯA CÓ TRANG NÀO GỌI HÀM NÀY. Grep toàn src chỉ ra đúng một kết quả: dòng
 * khai báo bên dưới. Ý tưởng được viết ra rồi bỏ dở giữa chừng — giữ lại vì nó
 * đúng, nhưng đừng tưởng "món này đăng bao lâu rồi" đang hiện ở đâu đó.
 *
 * Dùng Intl.RelativeTimeFormat thay vì sáu câu chép tay: trình duyệt đã có sẵn
 * bảng từ cho mọi ngôn ngữ, kể cả số nhiều và cách chia mà tiếng Việt không có
 * nhưng tiếng Anh thì có ("1 day ago" / "2 days ago"). Bản cũ ghép chuỗi tay
 * nên chỉ đúng một thứ tiếng, và sẽ đẻ ra "2 day ago" nếu ai đó dịch máy móc.
 */
const STEPS: [limit: number, unit: Intl.RelativeTimeFormatUnit][] = [
  [60, 'second'],
  [3600, 'minute'],
  [86400, 'hour'],
  [2592000, 'day'],
  [31536000, 'month'],
  [Infinity, 'year'],
];

const SECONDS_IN: Record<string, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
  month: 2592000,
  year: 31536000,
};

export function timeAgo(value: any, locale = 'vi'): string | null {
  const at = new Date(value).getTime();
  if (!Number.isFinite(at)) return null;
  const seconds = Math.floor((Date.now() - at) / 1000);
  if (seconds < 0) return null;

  const [, unit] = STEPS.find(([limit]) => seconds < limit)!;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  // Số ÂM vì đây là chuyện đã qua. Đưa số dương vào sẽ ra "trong 2 giờ nữa".
  return rtf.format(-Math.floor(seconds / SECONDS_IN[unit]), unit);
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
