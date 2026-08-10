"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthShell, authField, authSubmit } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';

/**
 * Đăng nhập.
 *
 * Ba thứ đã sửa ở lượt này:
 *
 * 1. NÚT GOOGLE LUÔN HIỆN, không còn ẩn im lặng khi thiếu cấu hình Firebase
 *    (xem GoogleButton). Và nó lên TRÊN biểu mẫu email: ai có tài khoản Google
 *    thì đó là đường ngắn nhất, đặt nó dưới cùng là bắt họ đọc hết form trước.
 *
 * 2. ĐĂNG KÝ XONG KHÔNG AI NÓI GÌ. /register chuyển tới /login?registered=1
 *    nhưng trang này chưa bao giờ đọc tham số đó — người dùng vừa xác thực OTP
 *    xong bị ném về một biểu mẫu trống, không biết mình đã tạo tài khoản thành
 *    công hay vừa bị đá ra.
 *
 * 3. Email đã đăng ký được điền sẵn khi quay về từ trang đăng ký.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const t = useTranslations('auth');
  const searchParams = useSearchParams();

  const justRegistered = searchParams.get('registered') === '1';
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Nạp lại cả trang chứ không router.push: Header, giỏ hàng và thông báo
      // đều đọc phiên lúc mount, đẩy route sẽ để chúng ở trạng thái chưa đăng
      // nhập cho tới lần điều hướng sau.
      window.location.href = '/';
    } catch (err: any) {
      const msg = err.response?.data?.message || t('loginFailed');
      setError(Array.isArray(msg) ? msg[0] : msg);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('loginTitle')}
      lead={t('loginLead')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            {t('registerNow')}
          </Link>
        </>
      }
    >
      {justRegistered && !error && (
        <p className="mb-5 flex items-start gap-2 rounded-control bg-state-success-bg px-3.5 py-2.5 text-small text-state-success-fg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t('registered')}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-control bg-state-danger-bg px-3.5 py-2.5 text-small text-state-danger-fg"
        >
          {error}
        </p>
      )}

      <GoogleButton label={t('google')} onError={setError} />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
        <span className="text-small text-ink-faint">{t('orEmail')}</span>
        <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-small font-semibold text-ink">
            {t('email')}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authField}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="login-password" className="text-small font-semibold text-ink">
              {t('password')}
            </label>
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="flex items-center gap-1.5 text-small text-ink-muted transition-colors hover:text-brand"
            >
              {reveal ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {reveal ? t('hidePassword') : t('showPassword')}
            </button>
          </div>
          <input
            id="login-password"
            type={reveal ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authField}
          />
        </div>

        <button type="submit" disabled={loading} className={authSubmit}>
          {loading ? t('loggingIn') : t('login')}
        </button>

        <Link
          href="/forgot-password"
          className="text-center text-small font-semibold text-brand hover:underline"
        >
          {t('forgot')}
        </Link>
      </form>
    </AuthShell>
  );
}
