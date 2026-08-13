"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signInWithPopup } from 'firebase/auth';
import http from '@/lib/http';
import { getFirebaseAuth } from '@/lib/firebase';
import { useFirebaseConfig } from '@/context/FirebaseConfigContext';
import { writeSession } from '@/lib/session';
import { authSecondary } from './AuthShell';

/**
 * Đăng nhập bằng Google.
 *
 * BA ĐỜI CỦA CÁI NÚT NÀY, ghi lại vì hai đầu đều sai theo hai cách khác nhau:
 *
 * 1. Bản đầu bọc trong `{isFirebaseConfigured && ...}`. Thiếu cấu hình thì nút
 *    biến mất, im lặng, không dấu vết. Người dựng máy mới không có cách nào
 *    biết là mình thiếu gì.
 *
 * 2. Bản sửa cho nó luôn hiện, kèm một dòng xám "Firebase isn't connected yet"
 *    và khung đỏ "Google sign-in isn't available" khi bấm. Chữa được chuyện
 *    debug, nhưng đem tên hạ tầng ra khoe với người mua hàng — họ không biết
 *    Firebase là gì, chỉ thấy trang này hỏng.
 *
 * Nay: nút vẫn LUÔN có mặt (người dựng máy nhìn thấy nó tồn tại), nhưng khi
 * chưa cấu hình thì nó ở trạng thái mờ, không bấm được, `title` là một câu
 * người thường đọc được — không có chữ Firebase, không có mã lỗi. Lý do kỹ
 * thuật đi vào console, đúng chỗ của nó.
 *
 * `aria-disabled` thay vì `disabled` thật: nút `disabled` bị bỏ khỏi thứ tự
 * tab, nên người dùng bàn phím và trình đọc màn hình không hề biết là có lựa
 * chọn này và nó đang tắt.
 */
export function GoogleButton({
  label,
  onError,
}: {
  label: string;
  onError: (message: string) => void;
}) {
  const t = useTranslations('auth');
  // Cau hinh doc o server roi truyen xuong — xem lib/firebase-config.ts.
  const config = useFirebaseConfig();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    const fb = getFirebaseAuth(config);
    if (!fb) {
      // Câu cho người dùng: nói họ làm gì tiếp theo, không nói vì sao hỏng.
      onError(t('googleUnavailable'));
      // Câu cho người dựng: nói đúng cái thiếu.
      console.warn(
        '[auth] Google sign-in tat: thieu FIREBASE_API_KEY / FIREBASE_AUTH_DOMAIN / FIREBASE_PROJECT_ID. ' +
          'Doc o phia server (lib/firebase-config.ts) nen KHONG can tien to NEXT_PUBLIC_. ' +
          'Sua xong phai khoi dong lai dev server: Next doc bien moi truong luc khoi dong.',
      );
      return;
    }
    setBusy(true);
    try {
      const result = await signInWithPopup(fb.auth, fb.googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await http.post('/auth/firebase', { idToken });
      const { access_token, user } = res.data.data;
      // Đăng nhập bằng Google mặc định là ghi nhớ: người ta chọn nhà cung cấp
      // danh tính chính vì không muốn đăng nhập lại mỗi lần.
      writeSession(access_token, user, true);
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

  const off = !config;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={off || busy}
      title={off ? t('googleTooltipOff') : undefined}
      className={`${authSecondary} ${off ? 'cursor-not-allowed opacity-45' : ''}`}
    >
      {/* SVG nội tuyến: trước đây hotlink svgrepo.com, hỏng là mất luôn hình. */}
      <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C39 36.2 44 31 44 24c0-1.2-.1-2.4-.4-3.5z" />
      </svg>
      {busy ? t('googleWorking') : label}
    </button>
  );
}
