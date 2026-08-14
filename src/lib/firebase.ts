import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import type { FirebaseConfig } from './firebase-config';

/**
 * Khởi tạo Firebase từ cấu hình ĐƯỢC TRUYỀN VÀO, không tự đọc process.env.
 *
 * Bản trước đọc `process.env.NEXT_PUBLIC_FIREBASE_*` ngay trong file này. Cách
 * đó chạy được, nhưng buộc mọi biến phải mang tiền tố NEXT_PUBLIC_ — và
 * .env.example của dự án lại ghi tên KHÔNG có tiền tố, nên ai điền theo file
 * mẫu thì cờ cấu hình vẫn false và nút Google vẫn tắt, không dấu vết.
 *
 * Nay cấu hình đọc ở server (lib/firebase-config.ts) rồi đi xuống qua
 * FirebaseConfigProvider. File này chỉ nhận và dựng, không biết biến môi trường
 * tên là gì — nên đổi tên biến sau này không phải sửa tới đây.
 */
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

/**
 * Trả về null khi chưa cấu hình hoặc đang chạy trên server.
 *
 * Khởi tạo LƯỜI và chỉ ở phía client: bản đầu gọi initializeApp ngay lúc import
 * module, nên thiếu biến môi trường là prerender /login đổ vỡ và người dùng
 * nhận một trang trắng.
 */
export function getFirebaseAuth(
  config: FirebaseConfig,
): { auth: Auth; googleProvider: GoogleAuthProvider } | null {
  if (typeof window === 'undefined' || !config) return null;
  try {
    if (!app) app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    if (!authInstance) authInstance = getAuth(app);
    if (!provider) provider = new GoogleAuthProvider();
    return { auth: authInstance, googleProvider: provider };
  } catch (err) {
    console.error('Firebase init failed', err);
    return null;
  }
}
