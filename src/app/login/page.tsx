"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import http from '@/lib/http';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { AuthShell, authField, authLabel, authSubmit } from '@/components/auth/AuthShell';

export default function LoginPage() {
  const { login } = useAuth();
  const t = useTranslations('auth');

  const [email, setEmail] = useState('');
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

  const handleGoogleLogin = async () => {
    const fb = getFirebaseAuth();
    if (!fb) {
      setError(t('googleUnavailable'));
      return;
    }
    try {
      const result = await signInWithPopup(fb.auth, fb.googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await http.post('/auth/firebase', { idToken });
      const { access_token, user: userData } = res.data.data;
      // Cùng BỘ HAI khoá mà AuthContext.login ghi và logout xoá. Ghi thiếu một
      // khoá thì phiên nửa vời: có token nhưng không có người dùng.
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      window.location.href = '/';
    } catch {
      setError(t('googleFailed'));
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
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-control bg-state-danger-bg px-3.5 py-2.5 text-small text-state-danger-fg"
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="login-email" className={authLabel}>
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

        {isFirebaseConfigured && (
          <>
            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
              <span className="text-small text-ink-faint">{t('or')}</span>
              <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-control border border-ink/16 bg-surface-card px-5 py-3 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
            >
              {/* SVG nội tuyến: trước đây hotlink svgrepo.com, hỏng là mất nút. */}
              <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C39 36.2 44 31 44 24c0-1.2-.1-2.4-.4-3.5z" />
              </svg>
              {t('google')}
            </button>
          </>
        )}
      </form>
    </AuthShell>
  );
}
