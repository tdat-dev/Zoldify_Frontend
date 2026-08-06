/**
 * ============================================================================
 *  SỐ LIỆU DEMO — KHÔNG PHẢI DỮ LIỆU THẬT
 * ============================================================================
 *
 * Trang chủ được dựng theo một mẫu thương mại điện tử có sao đánh giá, nhãn
 * giảm giá, giá gạch ngang, đếm ngược khuyến mãi và số lượng khách hàng.
 * Backend Zoldify hiện KHÔNG có bất kỳ dữ liệu nào trong số đó:
 *
 *   - API danh sách sản phẩm không trả điểm đánh giá tổng hay số lượt đánh giá
 *     (đánh giá chỉ có ở trang chi tiết, tính từ danh sách review).
 *   - Sản phẩm không có giá gốc / giá so sánh, nên không tính được phần trăm giảm.
 *   - Không có chương trình khuyến mãi nào, nên không có mốc thời gian để đếm ngược.
 *   - Không có bảng wishlist.
 *
 * Mọi con số ở file này là BỊA để bản demo trông giống mẫu. Gom vào một chỗ để
 * khi backend có dữ liệu thật thì chỉ phải sửa đúng file này.
 *
 * CÁCH TẮT: đặt DEMO_MODE = false. Toàn bộ sao, nhãn giảm giá, giá gạch, đếm
 * ngược và số khách hàng sẽ biến mất; trang vẫn chạy bình thường bằng dữ liệu
 * thật (tên, giá, tồn kho, đã bán, tình trạng, người bán).
 *
 * CÁCH NỐI DỮ LIỆU THẬT: giữ DEMO_MODE = true nhưng sửa từng hàm bên dưới để
 * đọc trường thật khi có (ví dụ `item.rating ?? demoRating(...)`), rồi tắt hẳn
 * khi backend trả đủ.
 */

export const DEMO_MODE = true;

/** Băm ổn định từ id -> số 0..1, để mỗi sản phẩm luôn ra cùng một con số. */
function seeded(id: number | string, salt: number): number {
  const n = Number(id) || String(id).length;
  const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** BỊA: điểm đánh giá 3.8–5.0 và số lượt 60–1500. */
export function demoRating(item: any): { rating: number; count: number } | null {
  if (!DEMO_MODE) return null;
  const r = 3.8 + seeded(item?.id ?? 0, 1) * 1.2;
  const c = Math.round(60 + seeded(item?.id ?? 0, 2) * 1440);
  return { rating: Math.round(r * 10) / 10, count: c };
}

/**
 * BỊA: khoảng 55% số món có "giảm giá" 10–35%. Giá gốc suy ngược từ giá đang
 * bán, nên giá thật hiển thị vẫn đúng — chỉ có giá gạch ngang là bịa.
 */
export function demoDiscount(item: any): { percent: number; original: number } | null {
  if (!DEMO_MODE) return null;
  const price = Number(item?.price);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (seeded(item?.id ?? 0, 3) > 0.55) return null;
  const percent = Math.round(10 + seeded(item?.id ?? 0, 4) * 25);
  return { percent, original: Math.round(price / (1 - percent / 100)) };
}

/** BỊA: mốc kết thúc "khuyến mãi" = 23:59:59 hôm nay, để đồng hồ có cái mà đếm. */
export function demoSaleEndsAt(): number {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/** BỊA: dải chứng thực ở hero. */
export const DEMO_SOCIAL = {
  customers: '25K+',
  customersLabel: 'sinh viên đã mua bán',
  rating: 4.9,
  reviews: '2.5K',
  /** Chữ cái đầu cho các vòng tròn đại diện — không dùng ảnh người thật. */
  initials: ['A', 'H', 'M', 'T'],
};
