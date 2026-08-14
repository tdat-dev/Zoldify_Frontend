"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';

/**
 * Đổi mật khẩu.
 *
 * Bản trước KHÔNG LÀM GÌ CẢ. Ba ô input không có state, <form> không có
 * onSubmit, nút là type="button" không có onClick, file không import service
 * nào. Người dùng gõ mật khẩu cũ, gõ mật khẩu mới, bấm nút — và không có gì xảy
 * ra. Không lỗi, không báo, không chuyển trang. Trên một biểu mẫu bảo mật thì
 * đây là kiểu hỏng tệ nhất: người dùng tin là đã đổi rồi, trong khi mật khẩu cũ
 * vẫn còn nguyên hiệu lực.
 *
 * Nay nối vào POST /auth/change-password { oldPassword, newPassword }
 * (auth.controller.ts:160). Backend đã chặn sẵn ba trường hợp — mật khẩu cũ
 * sai, mật khẩu mới trùng cũ, mật khẩu mới dưới 6 ký tự — nhưng vẫn kiểm ở đây
 * trước khi gửi, để người dùng không phải chờ một vòng mạng mới biết mình gõ
 * nhầm ô xác nhận.
 */
export default function ChangePasswordPage() {
  const { toast } = useToast();
  const t = useTranslations('account');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validate = (): string | null => {
    if (!oldPassword) return t('pwErrEmpty');
    if (newPassword.length < 6) return t('pwErrShort');
    if (newPassword === oldPassword) return t('pwErrSame');
    if (newPassword !== confirm) return t('pwErrMismatch');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await http.post('/auth/change-password', { oldPassword, newPassword });
      toast(t('pwDone'), 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
      setReveal(false);
    } catch (err: any) {
      // Thông báo của backend cụ thể hơn ("Mật khẩu cũ không chính xác") nên ưu
      // tiên nó; chỉ rơi về câu chung khi mạng chết và không có response.
      setError(err.response?.data?.message || t('pwErrFailed'));
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

  return (
    <div className="rounded-card bg-surface-card">
      <div className="border-b border-ink/10 px-6 py-5">
        <h1 className="text-h2 text-ink">{t('pwTitle')}</h1>
        <p className="mt-1 text-small text-ink-muted">{t('pwLead')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="max-w-md px-6 py-6">
        {/* role=alert để trình đọc màn hình đọc lỗi ngay khi nó xuất hiện —
            người dùng bàn phím không nhìn thấy dòng chữ đỏ phía trên. */}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-control bg-state-danger-bg px-3.5 py-2.5 text-small text-state-danger-fg"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="pw-old" className="mb-1.5 block text-small font-semibold text-ink">
              {t('pwCurrent')}
            </label>
            {/* autoComplete đúng chuẩn để trình quản lý mật khẩu điền được ô cũ
                và LƯU được ô mới. Thiếu nó thì người dùng dùng password manager
                phải tự chép tay. */}
            <input
              id="pw-old"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className={field}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label htmlFor="pw-new" className="text-small font-semibold text-ink">
                {t('pwNew')}
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
                {reveal ? t('pwHide') : t('pwShow')}
              </button>
            </div>
            <input
              id="pw-new"
              type={reveal ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              aria-describedby="pw-new-hint"
              className={field}
            />
            <p id="pw-new-hint" className="mt-1.5 text-small text-ink-muted">
              {t('pwHint')}
            </p>
          </div>

          <div>
            <label htmlFor="pw-confirm" className="mb-1.5 block text-small font-semibold text-ink">
              {t('pwConfirm')}
            </label>
            <input
              id="pw-confirm"
              type={reveal ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={field}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-7 rounded-control bg-brand px-6 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint"
        >
          {saving ? t('pwSubmitting') : t('pwSubmit')}
        </button>
      </form>
    </div>
  );
}
