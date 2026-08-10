"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signInWithPopup } from 'firebase/auth';
import http from '@/lib/http';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { authSecondary } from './AuthShell';

/**
 * Đăng nhập bằng Google.
 *
 * VÌ SAO NÚT NÀY TỪNG "BIẾN MẤT": nó nằm trong `{isFirebaseConfigured && ...}`,
 * mà cờ đó đọc `process.env.NEXT_PUBLIC_FIREBASE_*`. Không có .env.local nên cờ
 * false và nút không được vẽ ra — im lặng, không dấu vết.
 *
 * Tệ hơn: .env.example ghi tên biến là `FIREBASE_API_KEY`, KHÔNG có tiền tố
 * NEXT_PUBLIC_. Next.js chỉ đưa biến có tiền tố đó xuống trình duyệt, nên ai
 * điền đúng theo file mẫu thì cờ vẫn cứ false và nút vẫn cứ không hiện. Tên
 * đúng phải là NEXT_PUBLIC_FIREBASE_API_KEY / _AUTH_DOMAIN / _PROJECT_ID.
 *
 * Nay nút LUÔN được vẽ. Chưa cấu hình thì bấm vào có câu nói rõ vì sao chưa
 * dùng được — một nút biến mất không giải thích được gì cho ai.
 */
export function GoogleButton({
  label,
  onError,
}: {
  label: string;
  onError: (message: string) => void;
}) {
  const t = useTranslations('auth');
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    const fb = getFirebaseAuth();
    if (!fb) {
      onError(t('googleUnavailable'));
      return;
    }
    setBusy(true);
    try {
      const result = await signInWithPopup(fb.auth, fb.googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await http.post('/auth/firebase', { idToken });
      const { access_token, user } = res.data.data;
      // Cùng BỘ HAI khoá mà AuthContext.login ghi và logout xoá. Ghi thiếu một
      // khoá thì phiên nửa vời: có token nhưng không có người dùng.
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err: any) {
      // Người dùng tự đóng cửa sổ popup không phải là lỗi — đừng bắt họ đọc
      // một dòng đỏ vì đã đổi ý.
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setBusy(false);
        return;
      }
      onError(err.response?.data?.message || t('googleFailed'));
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleClick} disabled={busy} className={authSecondary}>
        {/* SVG nội tuyến: trước đây hotlink svgrepo.com, hỏng là mất luôn hình. */}
        <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C39 36.2 44 31 44 24c0-1.2-.1-2.4-.4-3.5z" />
        </svg>
        {busy ? t('googleWorking') : label}
      </button>

      {!isFirebaseConfigured && (
        <p className="mt-2 text-caption leading-relaxed text-ink-faint">{t('googleNotSetUp')}</p>
      )}
    </>
  );
}
