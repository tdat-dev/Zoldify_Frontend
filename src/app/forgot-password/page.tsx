"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/Toast';
import { AuthShell, authField, authLabel, authSubmit } from '@/components/auth/AuthShell';

/**
 * Quên mật khẩu.
 *
 * BẢN TRƯỚC LÀ MỘT LUỒNG GIẢ TỪ ĐẦU ĐẾN CUỐI:
 *
 *   handleSendCode  -> chỉ `setStep(2)`. KHÔNG gọi API nào. Không có mã OTP
 *                      nào được gửi đi, nhưng màn hình vẫn bảo người dùng
 *                      "Nhập mã code 6 số đã được gửi tới email".
 *   handleVerifyOtp -> chỉ hiện toast "Xác thực thành công. Chuyển đến trang
 *                      đặt lại mật khẩu…" rồi KHÔNG chuyển đi đâu cả.
 *   "Gửi lại mã?"   -> không có onClick.
 *   /reset-password -> biểu mẫu chết hoàn toàn, không state không onSubmit.
 *
 * Nghĩa là người quên mật khẩu đi hết luồng, được báo thành công hai lần, và
 * kết thúc ở đúng chỗ cũ — khoá ngoài tài khoản của chính mình.
 *
 * HAI bước, không phải ba: backend gộp xác thực OTP và đặt mật khẩu mới vào
 * một lần gọi (ResetPasswordDto = email + otp + newPassword), nên không có
 * bước "kiểm OTP" riêng để dựng — và cũng vì thế /reset-password không thể
 * đứng riêng được.
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('auth');

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError(t('errEmail'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await authService.sendForgotPasswordOtp(email.trim());
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || t('sendFailed'));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await authService.sendForgotPasswordOtp(email.trim());
      toast(t('resent'), 'success');
    } catch (err: any) {
      setError(err.response?.data?.message || t('sendFailed'));
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError(t('errOtp'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('errPasswordShort'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await authService.resetPassword(email.trim(), otp.trim(), newPassword);
      toast(t('resetDone'), 'success');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || t('resetFailed'));
      setBusy(false);
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

  if (step === 1) {
    return (
      <AuthShell
        title={t('forgotTitle')}
        lead={t('forgotLead')}
        footer={
          <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('backToLogin')}
          </Link>
        }
      >
        {alert}
        <form onSubmit={sendCode} noValidate className="flex flex-col gap-5">
          <div>
            <label htmlFor="fp-email" className={authLabel}>
              {t('forgotEmail')}
            </label>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={authField}
            />
          </div>
          <button type="submit" disabled={busy} className={authSubmit}>
            {busy ? t('sending') : t('sendCode')}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('resetTitle')}
      lead={t('resetLead', { email })}
      footer={
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setError(null);
          }}
          className="font-semibold text-brand hover:underline"
        >
          {t('wrongEmail')}
        </button>
      }
    >
      {alert}
      <form onSubmit={reset} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="fp-otp" className={authLabel}>
            {t('otp')}
          </label>
          <input
            id="fp-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className={`${authField} text-center text-h2 tabular-nums tracking-[0.4em]`}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="fp-new" className="text-small font-semibold text-ink">
              {t('newPassword')}
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
            id="fp-new"
            type={reveal ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            aria-describedby="fp-new-hint"
            className={authField}
          />
          <p id="fp-new-hint" className="mt-1.5 text-small text-ink-muted">
            {t('newPasswordHint')}
          </p>
        </div>

        <button type="submit" disabled={busy} className={authSubmit}>
          {busy ? t('resetting') : t('resetSubmit')}
        </button>

        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="text-small font-semibold text-brand hover:underline disabled:text-ink-faint"
        >
          {t('resend')}
        </button>
      </form>
    </AuthShell>
  );
}
