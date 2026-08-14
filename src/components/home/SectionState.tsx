"use client";

import { useTranslations } from 'next-intl';
import { AlertCircle, Loader } from 'lucide-react';

export type LoadState = 'loading' | 'ready' | 'error';

/**
 * Ba trạng thái phải PHÂN BIỆT ĐƯỢC với nhau. Gộp "API chết" vào "chưa có gì"
 * là nói dối người dùng — lỗi này từng xuất hiện khắp site và mới sửa được vài chỗ.
 */
export function SectionState({
  state,
  empty,
  emptyText,
  onRetry,
}: {
  state: LoadState;
  empty: boolean;
  /** Bỏ trống thì dùng câu chung. Truyền vào khi khu vực đó cần nói cụ thể hơn. */
  emptyText?: string;
  onRetry?: () => void;
}) {
  const t = useTranslations('home');

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-small text-ink-muted">
        <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t('stateLoading')}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <p className="flex items-center gap-2 text-small text-ink">
          <AlertCircle className="h-4 w-4 text-price" aria-hidden="true" />
          {t('stateError')}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-control border border-ink/16 px-4 py-2 text-small font-medium text-ink transition-colors hover:bg-surface-sunken"
          >
            {t('retry')}
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return <p className="py-14 text-center text-small text-ink-muted">{emptyText || t('stateEmpty')}</p>;
  }

  return null;
}
