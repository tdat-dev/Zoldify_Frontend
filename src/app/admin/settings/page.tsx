"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { settingService, SETTING_KEYS } from '@/services/setting.service';
import { useToast } from '@/components/Toast';

/**
 * Cài đặt hệ thống.
 *
 * BẢN TRƯỚC KHÔNG LƯU ĐƯỢC GÌ. `<form>` không có onSubmit, hai ô nhập dùng
 * `defaultValue` nên không có state, và nút "Lưu thay đổi" là `type="button"`
 * KHÔNG có onClick. Admin gõ tên website, bấm Lưu, và không có gì xảy ra —
 * form chết thứ tư cùng kiểu, sau /profile/change-password, /reset-password và
 * /forgot-password.
 *
 * Nay nối vào GET /settings và PATCH /settings (settings.controller.ts:22,28).
 *
 * ĐÃ GỠ:
 *
 * - THANH BÊN MỒ CÔI. Trang này là trang admin DUY NHẤT có thanh điều hướng,
 *   chép cứng ngay trong file. Nay điều hướng nằm ở admin/layout.tsx nên mọi
 *   trang admin đều có.
 *
 * - BA TAB RỖNG ("contact", "email", "payment") chỉ hiện dòng "đang được xây
 *   dựng". Tab dẫn tới chỗ trống thì thà đừng có tab.
 *
 * - NÚT "BẬT bảo trì". Nó không có onClick, và kể cả nối vào một khoá cài đặt
 *   thì cũng KHÔNG có gì trong app đọc khoá đó — một công tắc bảo trì không
 *   chặn được ai còn nguy hơn là không có, vì admin sẽ tin là site đã đóng.
 *   Muốn có thật thì cần middleware ở backend chặn request khi cờ bật.
 */
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState({ siteName: '', siteDescription: '', maintenance: false });
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await settingService.getAll();
      const rows: any[] = res.data?.data || res.data || [];
      const byKey = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
      const next = {
        siteName: byKey[SETTING_KEYS.siteName] ?? '',
        siteDescription: byKey[SETTING_KEYS.siteDescription] ?? '',
        // === 'true' chu khong phai ep kieu: chuoi 'false' la truthy.
        maintenance: byKey[SETTING_KEYS.maintenanceMode] === 'true',
      };
      setSiteName(next.siteName);
      setSiteDescription(next.siteDescription);
      setMaintenance(next.maintenance);
      setSaved(next);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty =
    siteName !== saved.siteName ||
    siteDescription !== saved.siteDescription ||
    maintenance !== saved.maintenance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await settingService.update({
        [SETTING_KEYS.siteName]: siteName,
        [SETTING_KEYS.siteDescription]: siteDescription,
        [SETTING_KEYS.maintenanceMode]: maintenance ? 'true' : 'false',
      });
      setSaved({ siteName, siteDescription, maintenance });
      toast(t('settingsSaved'), 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || t('settingsSaveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-[900px] px-4 py-6">
        <div className="rounded-card bg-surface-card">
          <div className="border-b border-ink/10 px-6 py-5">
            <h1 className="text-h2 text-ink">{t('settingsTitle')}</h1>
            <p className="mt-1 text-small text-ink-muted">
              {t('settingsLead')}
            </p>
          </div>

          {state === 'loading' ? (
            <p className="px-6 py-16 text-center text-body text-ink-muted">{tc('loading')}</p>
          ) : state === 'error' ? (
            <div className="px-6 py-16 text-center">
              <p className="text-body font-semibold text-ink">{t('settingsLoadFailed')}</p>
              <button
                type="button"
                onClick={load}
                className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {tc('retry')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl px-6 py-6">
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="set-name" className="mb-1.5 block text-small font-semibold text-ink">
                    {t('settingsSiteName')}
                  </label>
                  <input
                    id="set-name"
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="set-desc" className="mb-1.5 block text-small font-semibold text-ink">
                    {t('settingsSiteDesc')}
                  </label>
                  <input
                    id="set-desc"
                    type="text"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className={field}
                  />
                </div>
              </div>

              {/* --- Chế độ bảo trì ---
                  Tách khỏi hai ô trên bằng một đường kẻ và một khối riêng: đây
                  là công tắc DUY NHẤT trên trang này có hậu quả tức thì với
                  người ngoài, đừng để nó trông ngang hàng với việc đổi tên site.

                  Bản trước từng có một nút "BẬT bảo trì" ở đây và tôi đã gỡ, vì
                  nó không có onClick — và kể cả nối vào một khoá cài đặt thì
                  cũng KHÔNG có gì trong app đọc khoá đó. Nay đã có: guard chặn
                  ở backend và middleware chuyển hướng ở frontend. */}
              <div className="mt-8 border-t border-ink/10 pt-7">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-[3px] border-ink/30 text-brand focus:ring-[3px] focus:ring-brand/30"
                  />
                  <span>
                    <span className="block text-small font-semibold text-ink">
                      {t('maintenanceLabel')}
                    </span>
                    <span className="mt-1 block max-w-[52ch] text-small leading-relaxed text-ink-muted">
                      {t('maintenanceHint')}
                    </span>
                  </span>
                </label>

                {maintenance && !saved.maintenance && (
                  <p className="mt-4 rounded-control bg-state-pending-bg px-4 py-3 text-small leading-relaxed text-state-pending-fg">
                    {t('maintenanceWarn')}
                  </p>
                )}
                {saved.maintenance && (
                  <p
                    role="status"
                    className="mt-4 rounded-control bg-state-danger-bg px-4 py-3 text-small font-semibold leading-relaxed text-state-danger-fg"
                  >
                    {t('maintenanceOn')}
                  </p>
                )}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!dirty || saving}
                  className="rounded-control bg-brand px-6 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint"
                >
                  {saving ? t('settingsSaving') : tc('save')}
                </button>
                {!dirty && <span className="text-small text-ink-faint">{t('settingsNoChange')}</span>}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
