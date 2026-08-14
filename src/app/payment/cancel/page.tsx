'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle, ArrowLeft, Loader2 } from 'lucide-react';

function CancelContent() {
  const t = useTranslations('payment');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isTopup = searchParams.get('topup') === '1';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card bg-surface-card p-8 text-center">
        <XCircle className="mx-auto mb-4 h-14 w-14 text-state-pending-fg" aria-hidden="true" />
        <h1 className="mb-2 text-h2 text-ink">{t('cancelTitle')}</h1>
        <p className="mb-6 text-small leading-relaxed text-ink-muted">
          {isTopup ? t('cancelTopupLead') : t('cancelOrderLead')}
        </p>
        <div className="flex flex-col gap-3">
          {!isTopup && orderId && (
            <Link
              href={`/checkout?ids=${orderId}`}
              className="rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {t('tryAgain')}
            </Link>
          )}
          {isTopup ? (
            <Link
              href="/profile/wallet"
              className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('toWallet')}
            </Link>
          ) : (
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 text-small text-ink-muted transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('backToCart')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
