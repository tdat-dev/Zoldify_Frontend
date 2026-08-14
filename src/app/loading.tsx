"use client";

import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('errors');

  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{t('loadingPage')}</span>
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-ink/16 border-t-brand"
      />
    </div>
  );
}
