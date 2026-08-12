"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

export default function CartSuccessPage() {
  const t = useTranslations('payment');

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px] rounded-card bg-surface-card p-8 text-center">
        <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-state-success-bg text-state-success-fg">
          <Check className="h-10 w-10" aria-hidden="true" />
        </span>

        <h1 className="mb-2 text-h1 text-ink">{t('orderPlacedTitle')}</h1>
        <p className="mb-8 text-small leading-relaxed text-ink-muted">{t('orderPlacedLead')}</p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-control bg-brand px-6 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t('toHome')}
          </Link>
          <Link
            href="/profile/orders"
            className="rounded-control border border-ink/16 px-6 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
          >
            {t('viewOrder')}
          </Link>
        </div>
      </div>
    </div>
  );
}
