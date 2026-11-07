/**
 * URL ảnh đã co cỡ và đổi định dạng ở biên Cloudflare.
 *
 * Ảnh người bán tải lên được gửi nguyên bản: một PNG 1,1 MB cho ô hàng rộng 180
 * điểm ảnh. Đo Lighthouse mobile 07/11: trang sản phẩm LCP 11,3 giây, trang chủ tải
 * 4,7 MB ảnh, trong khi HTML chỉ mất 150 ms.
 *
 * Chỉ dùng hai cỡ: mỗi cặp ảnh và cỡ tính một lượt trong hạn mức 5.000 mỗi tháng của
 * gói Free. `onerror=redirect` trả về ảnh gốc khi vượt hạn mức hoặc co lỗi, nên trang
 * chậm đi chứ không mất ảnh. Cách này chỉ chạy với ảnh cùng zone, nên ảnh ngoài
 * img.zoldify.com giữ nguyên.
 */
const NGUON = 'https://img.zoldify.com/';
const CO_ANH = 'https://zoldify.com/cdn-cgi/image';

export type ImageSize = 400 | 800;

export function imageUrl<T extends string | null | undefined>(src: T, width: ImageSize): T | string {
  if (!src || !src.startsWith(NGUON)) return src;
  return `${CO_ANH}/width=${width},format=auto,quality=80,onerror=redirect/${src}`;
}
