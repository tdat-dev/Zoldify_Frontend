'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { payosService } from '@/services/payos.service';

/**
 * Màn hình PayOS trả người dùng về sau khi thanh toán.
 *
 * Câu thông báo giữ ở dạng KHOÁ trong state, dịch lúc render. Lưu thẳng câu đã
 * dịch vào state thì đổi ngôn ngữ giữa chừng sẽ để lại câu cũ đứng yên — mà đây
 * đúng là màn hình người ta ngồi nhìn lâu nhất, vì nó đang đếm.
 */
function ReturnContent() {
  const router = useRouter();
  const t = useTranslations('payment');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isTopup = searchParams.get('topup') === '1';
  const status = searchParams.get('status'); // PAID, CANCELLED
  const code = searchParams.get('code');

  const [phase, setPhase] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [msgKey, setMsgKey] = useState<string>('verifying');
  const [tries, setTries] = useState<{ n: number; max: number } | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    // Nếu PayOS báo CANCELLED ngay từ returnUrl
    if (status === 'CANCELLED' || (code && code !== '00')) {
      setPhase('failed');
      setMsgKey('cancelled');
      return;
    }

    // Nạp ví: thông báo thành công và chuyển về trang ví
    if (isTopup) {
      // Chờ vài giây cho webhook xử lý xong
      await new Promise((r) => setTimeout(r, 3000));
      setPhase('success');
      setMsgKey('topupDone');
      setTimeout(() => router.push('/profile/wallet'), 2500);
      return;
    }

    // Đơn hàng: polling tối đa 30s
    if (!orderId) {
      setPhase('failed');
      setMsgKey('noOrderId');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const interval = 3000;

    const poll = async () => {
      try {
        const res = await payosService.refresh(Number(orderId));
        if (res.data?.data?.is_paid) {
          setPhase('success');
          setMsgKey('paid');
          setTries(null);
          return;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
      attempts++;
      if (attempts < maxAttempts) {
        setMsgKey('verifyingCount');
        setTries({ n: attempts, max: maxAttempts });
        setTimeout(poll, interval);
      } else {
        setPhase('failed');
        setMsgKey('noConfirm');
      }
    };

    poll();
  };

  const message = tries ? t('verifyingCount', tries) : t(msgKey as any);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-card bg-surface-card p-8 text-center">
        {phase === 'verifying' && (
          <>
            <Loader2 className="mx-auto mb-4 h-14 w-14 animate-spin text-brand" aria-hidden="true" />
            <h1 className="mb-2 text-h2 text-ink">{t('working')}</h1>
            <p className="text-small text-ink-muted">{message}</p>
          </>
        )}

        {phase === 'success' && (
          <>
            <CheckCircle2
              className="mx-auto mb-4 h-14 w-14 text-state-success-fg"
              aria-hidden="true"
            />
            <h1 className="mb-2 text-h2 text-ink">{t('successTitle')}</h1>
            <p className="mb-6 text-small text-ink-muted">{message}</p>
            {isTopup ? (
              <Link
                href="/profile/wallet"
                className="inline-flex items-center gap-2 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {t('toWallet')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/profile/orders/${orderId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {t('viewOrder')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/" className="text-small text-ink-muted hover:text-brand">
                  {t('keepShopping')}
                </Link>
              </div>
            )}
          </>
        )}

        {phase === 'failed' && (
          <>
            <XCircle className="mx-auto mb-4 h-14 w-14 text-price" aria-hidden="true" />
            <h1 className="mb-2 text-h2 text-ink">{t('failedTitle')}</h1>
            <p className="mb-6 text-small text-ink-muted">{message}</p>
            <div className="flex flex-col gap-3">
              {orderId && !isTopup && (
                <Link
                  href={`/checkout?ids=${orderId}`}
                  className="rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {t('tryAgain')}
                </Link>
              )}
              {isTopup ? (
                <Link href="/profile/wallet" className="text-small text-ink-muted hover:text-brand">
                  {t('toWallet')}
                </Link>
              ) : (
                <Link href="/cart" className="text-small text-ink-muted hover:text-brand">
                  {t('backToCart')}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden="true" />
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}
