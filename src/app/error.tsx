"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-price" aria-hidden="true" />
        <h1 className="mb-2 text-h2 text-ink">{t('pageTitle')}</h1>
        <p className="mb-6 text-small leading-relaxed text-ink-muted">{t('pageLead')}</p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t('retry')}
          </button>
          <Link
            href="/"
            className="rounded-control border border-ink/16 px-5 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
          >
            {t('toHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
