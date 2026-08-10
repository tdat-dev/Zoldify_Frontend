import type { StatusTone } from './status-tone';

/**
 * Trạng thái một tin đăng, khớp enum backend
 * (catalog/products/entities/product.entity.ts:17-23).
 *
 * Trang "Tin đã đăng" của người bán trước đây KHÔNG hiện trạng thái nào cả.
 * Người bán có tin bị từ chối duyệt (`rejected`) hoặc còn đang chờ duyệt
 * (`pending`) không có cách nào biết — họ chỉ thấy tin nằm trong danh sách và
 * tưởng nó đang được rao bán.
 *
 * Lưu ý: `active` nghĩa là ĐANG MỞ BÁN, không phải "mới". Trang danh mục từng
 * dùng nó để gắn nhãn "Mới" cho mọi món.
 */
export const PRODUCT_STATUSES = ['draft', 'pending', 'active', 'sold', 'rejected'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

const TONE: Record<ProductStatus, StatusTone> = {
  draft: 'neutral',
  pending: 'pending',
  active: 'success',
  sold: 'progress',
  rejected: 'danger',
};

export function isProductStatus(raw: unknown): raw is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(String(raw));
}

export function productStatusTone(raw: unknown): StatusTone {
  return isProductStatus(raw) ? TONE[raw] : 'neutral';
}
