"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  AuthShell,
  authField,
  authFieldError,
  authLabel,
  authSubmit,
} from '@/components/auth/AuthShell';
import { GoogleButton } from '@/components/auth/GoogleButton';

/**
 * Đăng nhập.
 *
 * THỨ TỰ GOOGLE / BIỂU MẪU LÀ CÓ ĐIỀU KIỆN, không cố định.
 *
 * Đăng nhập bằng Google là đường ngắn nhất nên đáng đứng trên — NHƯNG chỉ khi
 * nó bấm được. Đặt một nút mờ, không bấm được lên làm phần tử đầu tiên của
 * trang thì thứ người dùng gặp trước nhất là một cánh cửa khoá. Nên khi chưa
 * cấu hình Firebase, biểu mẫu email lên trước và Google lùi xuống dưới; cấu
 * hình xong thì tự đảo lại, không phải sửa gì.
 *
 * LỖI HIỆN DƯỚI ĐÚNG Ô SAI. Bản trước gom mọi lỗi vào một khung đỏ trên đầu
 * biểu mẫu: bỏ trống email thì phải đọc một câu ở trên rồi tự dò xuống xem ô
 * nào. Nay lỗi của từng trường nằm ngay dưới trường đó, còn khung chung chỉ
 * dành cho lỗi từ máy chủ (sai mật khẩu, tài khoản khoá) — thứ không thuộc về
 * một ô cụ thể nào.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const t = useTranslations('auth');
  const searchParams = useSearchParams();

  const justRegistered = searchParams.get('registered') === '1';
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  /** Chỉ bắt hai thứ máy chủ không nên phải trả lời: bỏ trống và sai dạng. */
  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = t('errEmailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t('errEmailFormat');
    if (!password) errs.password = t('errPasswordRequired');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
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

  const googleButton = <GoogleButton label={t('google')} onError={setError} />;

  // Nhãn phải nói đúng thứ NẰM DƯỚI nó. Dùng cứng "hoặc dùng email" trong khi
  // ô email đã ở phía trên là câu vô nghĩa — đo được ngay khi chụp màn hình,
  // không thấy được khi đọc HTML.
  const divider = (label: string) => (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
      <span className="text-small text-ink-faint">{label}</span>
      <span className="h-px flex-1 bg-ink/12" aria-hidden="true" />
    </div>
  );

  const form = (
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
          onChange={(e) => {
            setEmail(e.target.value);
            // Xoá lỗi ngay khi người ta bắt đầu sửa: giữ dòng đỏ trong lúc họ
            // đang gõ lại là mắng người đang chữa lỗi.
            if (fieldErrors.email) setFieldErrors((v) => ({ ...v, email: undefined }));
          }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'login-email-err' : undefined}
          className={fieldErrors.email ? authFieldError : authField}
        />
        {fieldErrors.email && (
          <p id="login-email-err" className="mt-1.5 text-small text-state-danger-fg">
            {fieldErrors.email}
          </p>
        )}
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
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((v) => ({ ...v, password: undefined }));
          }}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? 'login-password-err' : undefined}
          className={fieldErrors.password ? authFieldError : authField}
        />
        {fieldErrors.password && (
          <p id="login-password-err" className="mt-1.5 text-small text-state-danger-fg">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Ghi nhớ và quên mật khẩu đứng cùng hàng, ngay trên nút chính: đây là
          hai quyết định cuối trước khi bấm, để rời rạc thì người dùng bấm xong
          mới nhớ ra. Cái ô này ĐỔI HÀNH VI THẬT — xem lib/session.ts. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded-[3px] border-ink/30 text-brand focus:ring-[3px] focus:ring-brand/30"
          />
          {t('remember')}
        </label>
        <Link
          href="/forgot-password"
          className="text-small font-semibold text-brand hover:underline"
        >
          {t('forgot')}
        </Link>
      </div>

      <button type="submit" disabled={loading} className={authSubmit}>
        {loading ? t('loggingIn') : t('login')}
      </button>
    </form>
  );

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

      {isFirebaseConfigured ? (
        <>
          {googleButton}
          {divider(t('orEmail'))}
          {form}
        </>
      ) : (
        <>
          {form}
          {divider(t('or'))}
          {googleButton}
        </>
      )}
    </AuthShell>
  );
}
