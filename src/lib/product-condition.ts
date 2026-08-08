/**
 * Thang tình trạng món đồ — MỘT nguồn duy nhất cho cả trang đăng bán, trang sửa
 * tin, và mọi chỗ hiển thị sau này.
 *
 * Giá trị lấy từ DTO backend (`Zoldify_Backend/src/catalog/products/dto/
 * create-product.dto.ts`): `new | like_new | good | fair`.
 *
 * Vì sao tách ra file riêng: trước đây trang đăng bán và trang sửa tin mỗi trang
 * tự khai một danh sách, và cả hai đều sai theo kiểu khác nhau — trang đăng bán
 * gửi `used`/`refurbished`, trang sửa tin mặc định `used` rồi khi backend trả về
 * `like_new` thì select không có mục đó nên lưu lại là GHI ĐÈ MẤT tình trạng
 * thật. Hai bản sao thì sớm muộn cũng lệch nhau.
 */
export const CONDITION_VALUES = ['new', 'like_new', 'good', 'fair'] as const;
export type ConditionValue = (typeof CONDITION_VALUES)[number];

/** Mặc định khi đăng tin mới. Đồ cũ nên mặc định là "còn tốt", không phải "mới". */
export const DEFAULT_CONDITION: ConditionValue = 'good';

/**
 * Nhận bất cứ thứ gì backend trả về và ép về một giá trị hợp lệ.
 * Giá trị lạ (kể cả `used`/`refurbished` do bản cũ ghi vào DB) rơi về mặc định
 * thay vì làm select trống rỗng rồi lưu đè.
 */
export function normalizeCondition(raw: unknown): ConditionValue {
  return (CONDITION_VALUES as readonly string[]).includes(String(raw))
    ? (String(raw) as ConditionValue)
    : DEFAULT_CONDITION;
}
