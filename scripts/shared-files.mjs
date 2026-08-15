/**
 * Danh sách file dùng chung giữa `Zoldify_Frontend` (bản gốc) và
 * `Zoldify_Admin` (bản sao).
 *
 * ⚠️  MỌI FILE Ở ĐÂY ĐỀU LÀ BẢN SAO. Sửa chúng trong repo này là sai chỗ —
 *     sửa ở `Zoldify_Frontend` rồi chạy `npm run sync:shared`.
 *
 * Vì sao lại chấp nhận nhân bản: hai repo tách hẳn nhau nên không có đường
 * import chung nào mà không phải dựng monorepo hoặc phát hành một gói riêng.
 * Cả hai đều đắt hơn mức đáng, xem
 * `Zoldify_Backend/docs/system-design/2026-08-13-tach-admin-frontend.md` mục 2.
 *
 * Vì sao phải có cổng kiểm: repo này đã dính đúng lỗi hai bản trôi khỏi nhau.
 * Bộ trạng thái đơn hàng từng có BỐN bản; bản nằm ở trang quản trị thiếu hai
 * giá trị, nên admin không có cách nào chuyển đơn sang hai trạng thái đó, và
 * đơn đang ở hai trạng thái ấy hiện ra ô trống. Không ai cố ý làm hỏng — các
 * bản sao chỉ đơn giản là được sửa vào những ngày khác nhau.
 *
 * `check-shared.mjs` chạy trong CI của cả hai repo và đỏ ngay khi lệch.
 */

/** Repo gốc, tính tương đối từ thư mục gốc của repo này. */
export const SOURCE_REPO = '../Zoldify_Frontend';

/**
 * Đường dẫn tính từ gốc repo, giống hệt nhau ở cả hai bên.
 *
 * KHÔNG đưa `src/api/schema.d.ts` vào đây: nó sinh tự động từ
 * `openapi.json` của backend bằng `npm run gen:api`. Thứ sinh được thì không
 * cần bản sao để mà trôi.
 */
export const SHARED_FILES = [
  // Nền thiết kế — token màu, chữ, bo góc, z-index
  'tailwind.config.ts',
  'src/app/globals.css',

  // Tầng gọi API và phiên đăng nhập
  'src/lib/config.ts',
  'src/lib/http.ts',
  'src/lib/session.ts',
  'src/api/index.ts',
  'src/context/AuthContext.tsx',

  // Định dạng và trạng thái — nguồn duy nhất cho nhãn và màu
  'src/lib/format.ts',
  'src/lib/status-tone.ts',
  'src/lib/order-status.ts',
  'src/lib/product-status.ts',
  'src/lib/withdrawal-status.ts',

  // Component nguyên thuỷ cả hai app đều dùng
  'src/components/Toast.tsx',
  'src/components/BackButton.tsx',
  'src/components/EmptyState.tsx',
  'src/components/StockControl.tsx',

  // Service khu quản trị gọi tới
  // LƯU Ý: withdrawal.service.ts KHÔNG nằm ở đây vì bản Admin có thêm
  // các hàm adminList/approve/reject/complete mà Frontend không cần.
  'src/services/category.service.ts',
  'src/services/order.service.ts',
  'src/services/product.service.ts',
  'src/services/setting.service.ts',
  'src/services/upload.service.ts',

  // Cấu hình i18n (bộ khoá dịch thì KHÔNG dùng chung — xem README)
  'src/i18n/request.ts',
];
