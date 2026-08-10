"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { AuthShell, authField, authLabel, authSubmit } from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';

/**
 * Đăng ký: gửi mã tới email, rồi xác thực mã và đặt mật khẩu.
 *
 * Ba thứ đã sửa ở lượt này:
 *
 * 1. THÊM NÚT GOOGLE. Trang đăng ký trước đây không có, dù đăng nhập Google
 *    cũng tạo tài khoản — ai muốn vào nhanh phải mò ngược sang trang đăng nhập.
 *
 * 2. CHUYỂN VỀ /login KÈM EMAIL. Trước chỉ có ?registered=1 mà trang đăng nhập
 *    lại không đọc, nên người dùng xác thực OTP xong bị ném về biểu mẫu trống.
 *
 * 3. Mật khẩu kiểm ĐỘ DÀI NGAY Ở BƯỚC 1. Bản trước gửi OTP trước rồi mới phát
 *    hiện mật khẩu ngắn ở bước 2 — người dùng đã mất một mã và một vòng email.
 *
 * Ô số điện thoại vẫn không có: nó từng được thu vào formData.phone rồi không
 * bao giờ gửi đi, vì cả SendRegisterOtpDto lẫn VerifyRegisterOtpDto của backend
 * đều không có trường đó. Muốn có thì phải thêm ở backend trước.
 */
export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t('errPasswordShort'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.sendRegisterOtp(fullName, email);
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || t('sendOtpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.verifyRegisterOtp(email, otp, password);
      router.push(`/login?registered=1&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || t('verifyFailed'));
      setLoading(false);
    }
  };

  const alert = error && (
    <p
      role="alert"
      className="mb-5 rounded-control bg-state-danger-bg px-3.5 py-2.5 text-small text-state-danger-fg"
    >
      {error}
    </p>
  );

  if (step === 2) {
    return (
      <AuthShell
        title={t('otpTitle')}
        lead={t('otpLead', { email })}
        footer={
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError('');
            }}
            className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('back')}
          </button>
        }
      >
        {alert}
        <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-5">
          <div>
            <label htmlFor="reg-otp" className={authLabel}>
              {t('otp')}
            </label>
            <input
              id="reg-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`${authField} text-center text-h2 tabular-nums tracking-[0.4em]`}
            />
          </div>
          <button type="submit" disabled={loading || otp.length < 6} className={authSubmit}>
            {loading ? t('verifying') : t('verify')}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('registerTitle')}
      lead={t('registerLead')}
      footer={
        <>
          {t('haveAccount')}{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            {t('loginNow')}
          </Link>
        </>
      }
    >
      {alert}

      <GoogleButton label={t('googleSignup')} onError={setError} />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
        <span className="text-small text-ink-faint">{t('orEmail')}</span>
        <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
      </div>

      <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="reg-name" className={authLabel}>
            {t('fullName')}
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={authField}
          />
        </div>

        <div>
          <label htmlFor="reg-email" className={authLabel}>
            {t('email')}
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authField}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="reg-password" className="text-small font-semibold text-ink">
              {t('regPassword')}
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
            id="reg-password"
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="reg-pw-hint"
            className={authField}
          />
          <p id="reg-pw-hint" className="mt-1.5 text-small text-ink-muted">
            {t('regPasswordHint')}
          </p>
        </div>

        <button type="submit" disabled={loading} className={authSubmit}>
          {loading ? t('sending') : t('continue')}
        </button>
      </form>
    </AuthShell>
  );
}
