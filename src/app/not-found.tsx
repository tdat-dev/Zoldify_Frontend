import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-[120px] font-extrabold leading-none text-brand/20" aria-hidden="true">
          404
        </p>
        <h1 className="mt-[-16px] text-h1 text-ink">{t('notFoundTitle')}</h1>
        <p className="mb-8 mt-3 text-small leading-relaxed text-ink-muted">{t('notFoundLead')}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-control bg-brand px-6 py-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t('toHome')}
        </Link>
      </div>
    </div>
  );
}
