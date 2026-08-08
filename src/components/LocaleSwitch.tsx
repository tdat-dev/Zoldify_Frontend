"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';

/**
 * Đổi ngôn ngữ bằng cách ghi cookie rồi làm mới dữ liệu từ server.
 *
 * Dùng `router.refresh()` chứ không `location.reload()`: refresh giữ nguyên
 * trạng thái phía client (giỏ hàng, vị trí cuộn, ô đang gõ dở) và chỉ lấy lại
 * phần render trên server, còn reload thì vứt hết.
 *
 * `useTransition` để trong lúc chờ vẫn bấm được và biết là đang xử lý, thay vì
 * giao diện đứng im không phản hồi.
 */
export function LocaleSwitch({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('locale');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: string) => {
    if (next === locale) return;
    // max-age 1 năm; SameSite=Lax để điều hướng từ ngoài vào vẫn giữ lựa chọn.
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      <label htmlFor="locale-switch" className="sr-only">
        {t('label')}
      </label>
      <select
        id="locale-switch"
        value={locale}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        className="cursor-pointer bg-transparent text-caption font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-60"
      >
        <option value="vi">{t('vi')}</option>
        <option value="en">{t('en')}</option>
      </select>
    </div>
  );
}
