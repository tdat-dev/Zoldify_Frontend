"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import http from '@/lib/http';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

/**
 * Thông tin cá nhân.
 *
 * Bốn thứ của bản trước đã gỡ:
 *
 * 1. THANH TAB CHÉP TAY. Trang này liệt kê ba mục, trang đổi mật khẩu liệt kê
 *    hai mục khác. Nay điều hướng nằm ở AccountShell, một nguồn duy nhất.
 *
 * 2. HAI Ô "Mật khẩu" VÀ "Địa chỉ giao hàng" nằm giữa form, trông như trường
 *    nhập nhưng thật ra là link đi trang khác. Nhét điều hướng vào giữa một
 *    biểu mẫu là bẫy: người dùng đang gõ dở, bấm vào tưởng mở rộng, hoá ra mất
 *    luôn phần chưa lưu. Cả hai nay ở thanh bên.
 *
 * 3. LABEL KHÔNG NỐI VỚI INPUT. Không có htmlFor, không có id — bấm vào chữ
 *    "Họ và tên" không đưa con trỏ vào ô, và trình đọc màn hình đọc ô trống
 *    không tên.
 *
 * 4. NÚT LƯU LUÔN BẤM ĐƯỢC kể cả khi chưa sửa gì, và lưu tên rỗng cũng được.
 */
export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('account');
  const tc = useTranslations('common');

  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  // authUser đến sau lần render đầu (context đọc token rồi mới gọi API), nên
  // useState(authUser?.full_name) chỉ chạy một lần và giữ nguyên chuỗi rỗng.
  useEffect(() => {
    setFullName(authUser?.full_name || '');
  }, [authUser?.full_name]);

  const original = authUser?.full_name || '';
  const trimmed = fullName.trim();
  const dirty = trimmed !== original;
  const canSave = dirty && trimmed.length > 0 && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !canSave) return;
    setSaving(true);
    try {
      const res = await http.patch('/auth/profile', { full_name: trimmed });
      updateUser(res.data.data);
      toast(t('saved'), 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || t('saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

  return (
    <div className="rounded-card bg-surface-card">
      <div className="border-b border-ink/10 px-6 py-5">
        <h1 className="text-h2 text-ink">{t('profileTitle')}</h1>
        <p className="mt-1 text-small text-ink-muted">{t('profileLead')}</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl px-6 py-6">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="pf-name" className="mb-1.5 block text-small font-semibold text-ink">
              {t('fullName')}
            </label>
            <input
              id="pf-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className={field}
            />
            {dirty && trimmed.length === 0 && (
              <p className="mt-1.5 text-small text-price">{t('errNoName')}</p>
            )}
          </div>

          <div>
            <label htmlFor="pf-email" className="mb-1.5 block text-small font-semibold text-ink">
              {t('email')}
            </label>
            {/* readOnly chứ không disabled: ô disabled bị bỏ khỏi thứ tự tab nên
                người dùng bàn phím lướt qua mà không biết email là gì. readOnly
                vẫn focus và đọc được, chỉ không sửa được. */}
            <input
              id="pf-email"
              type="email"
              value={authUser?.email || ''}
              readOnly
              aria-describedby="pf-email-note"
              className={`${field} cursor-not-allowed bg-surface-sunken text-ink-muted`}
            />
            <p id="pf-email-note" className="mt-1.5 text-small text-ink-muted">
              {t('emailLocked')}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-control bg-brand px-6 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint"
          >
            {saving ? t('saving') : tc('save')}
          </button>
          {!dirty && <span className="text-small text-ink-faint">{t('noChange')}</span>}
        </div>
      </form>
    </div>
  );
}
