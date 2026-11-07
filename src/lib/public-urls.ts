import { toSlug } from './slug';

/**
 * URL công khai của món hàng và shop. ID mới là định danh, slug chỉ để đọc và
 * chứa từ khoá: đổi tên tin thì URL cũ vẫn tìm ra món, rồi chuyển hướng về URL
 * mới. Vì vậy `/product/123` và `/product/ten-mon-i123` cũ (app, tin nhắn, link
 * đã chia sẻ) vẫn dùng được.
 *
 * Món hàng nằm ngay gốc như Shopee. Tên rỗng thì không có slug để phân biệt với
 * danh mục, nên giữ `/product/123`.
 */
export function productPath(p: { id: number; slug?: string | null; name?: string | null }): string {
  const slug = toSlug(p.slug || p.name || '');
  return slug ? `/${slug}-i${p.id}` : `/product/${p.id}`;
}

/** Nhận cả `123` lẫn `ten-mon-i123`. Chuỗi khác trả null để trang báo 404. */
export function parseProductId(segment: string): number | null {
  const match = /^(?:[a-z0-9-]*-i)?([1-9]\d*)$/.exec(segment);
  return match ? Number(match[1]) : null;
}

/**
 * Route gốc phân biệt món hàng với danh mục bằng đuôi `-i<id>`. Backend chặn tạo
 * danh mục có slug kiểu này (categories.service.ts), nên hai loại không đụng nhau.
 */
export function isProductSegment(segment: string): boolean {
  return /^[a-z0-9-]*-i[1-9]\d*$/.test(segment);
}

export function shopPath(u: { id: number; full_name?: string | null }): string {
  const slug = toSlug(u.full_name || '');
  return slug ? `/shop/${slug}-${u.id}` : `/shop/${u.id}`;
}

/** Số cuối cùng trong đoạn đường dẫn là ID người bán. */
export function parseShopId(segment: string): number | null {
  const match = /^(?:[a-z0-9-]*-)?([1-9]\d*)$/.exec(segment);
  return match ? Number(match[1]) : null;
}
