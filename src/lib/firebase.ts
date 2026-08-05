import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

/** Chưa cấu hình Firebase thì tắt hẳn nút đăng nhập Google, không làm sập trang. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

/**
 * Khởi tạo lười và chỉ ở phía client.
 * Trước đây initializeApp chạy ngay khi import module, nên thiếu env là
 * prerender /login đổ vỡ và người dùng nhận trang trắng.
 */
export function getFirebaseAuth(): { auth: Auth; googleProvider: GoogleAuthProvider } | null {
  if (typeof window === 'undefined' || !isFirebaseConfigured) return null;
  try {
    if (!app) app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    if (!authInstance) authInstance = getAuth(app);
    if (!provider) provider = new GoogleAuthProvider();
    return { auth: authInstance, googleProvider: provider };
  } catch (err) {
    console.error('Firebase init failed', err);
    return null;
  }
}
