/**
 * Đọc cấu hình Firebase Ở PHÍA SERVER, không cần tiền tố NEXT_PUBLIC_.
 *
 * VÌ SAO PHẢI VÒNG QUA SERVER:
 * `NEXT_PUBLIC_` không phải một quy ước đặt tên tuỳ hứng — đó là cơ chế Next
 * dùng để quyết định biến nào được NHÚNG vào bundle gửi xuống trình duyệt. Mã
 * chạy trong trình duyệt không có process.env; Next thay thế
 * `process.env.NEXT_PUBLIC_X` bằng giá trị thật lúc build, và chỉ làm thế với
 * những biến mang tiền tố đó. Đọc `process.env.FIREBASE_API_KEY` trong một file
 * "use client" thì kết quả luôn là undefined, ở mọi môi trường.
 *
 * Nên muốn giữ tên biến KHÔNG có tiền tố (đỡ nhầm khi dựng máy), phải đọc ở
 * server rồi truyền xuống client như dữ liệu bình thường. Đó là việc file này
 * làm, cùng với FirebaseConfigProvider.
 *
 * ⚠️ ĐỪNG TƯỞNG BỎ TIỀN TỐ LÀ GIẤU ĐƯỢC KHOÁ. Ba giá trị này BẮT BUỘC phải tới
 * được trình duyệt, vì chính trình duyệt mới là nơi gọi Firebase. Ai xem mã
 * nguồn trang vẫn thấy chúng — y như trước. Firebase không bảo vệ bằng cách
 * giấu apiKey (nó không phải mật khẩu) mà bằng Authorized domains và Security
 * rules. Thay đổi ở đây thuần tuý là chỗ ĐẶT TÊN BIẾN, không phải mức bảo mật.
 *
 * Vẫn chấp nhận tên có tiền tố để không phá máy nào đã cấu hình theo lối cũ.
 *
 * KHÔNG import file này từ component "use client". Không dùng gói `server-only`
 * để chặn bằng máy vì gói đó chưa có trong dự án; chặn bằng quy ước ở đây, và
 * bằng việc chỉ có layout.tsx (server component) gọi nó.
 */
export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
} | null;

export function readFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain =
    process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Thiếu MỘT trong ba là coi như chưa cấu hình. Khởi tạo Firebase với cấu hình
  // khuyết sẽ ném lỗi ở giữa lúc người dùng bấm nút, thay vì tắt nút từ đầu.
  if (!apiKey || !authDomain || !projectId) return null;
  return { apiKey, authDomain, projectId };
}
