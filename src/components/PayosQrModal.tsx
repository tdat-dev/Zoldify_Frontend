"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ExternalLink, Loader2, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import { payosService } from '@/services/payos.service';
import { formatPrice } from '@/lib/format';

export interface PayosModalData {
  type: 'order' | 'topup';
  orderId?: number;
  orderCode: number;
  amount: number;
  qrCode: string;
  checkoutUrl: string;
  expiresAt?: number;
}

interface PayosQrModalProps {
  data: PayosModalData | null;
  onPaid: () => void;
  onClose: () => void;
}

/**
 * Popup thanh toán VietQR qua PayOS ngay trên màn hình web.
 * Poll trạng thái mỗi 3s -> thấy đã thanh toán thì tự gọi onPaid().
 */
export function PayosQrModal({ data, onPaid, onClose }: PayosQrModalProps) {
  const t = useTranslations('payosModal');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [phase, setPhase] = useState<'pending' | 'paid' | 'expired' | 'failed'>('pending');
  const [cancelling, setCancelling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);

  // Render chuỗi VietQR thành ảnh data URL mỗi khi mở modal mới
  useEffect(() => {
    if (!data?.qrCode) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    setPhase('pending');
    QRCode.toDataURL(data.qrCode, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [data?.qrCode, data?.orderCode]);

  // Đếm ngược thời hạn mã QR
  useEffect(() => {
    if (!data) return;
    const deadline = data.expiresAt
      ? data.expiresAt * 1000
      : Date.now() + 15 * 60 * 1000;

    const tick = () => {
      const rem = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setSecondsLeft(rem);
      if (rem === 0) {
        setPhase((prev) => (prev === 'pending' ? 'expired' : prev));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data]);

  // Poll trạng thái thanh toán mỗi 3 giây
  useEffect(() => {
    if (!data || phase !== 'pending') return;
    let stopped = false;

    const check = async () => {
      try {
        if (data.type === 'order' && data.orderId) {
          const res = await payosService.refresh(data.orderId);
          if (!stopped && res.data?.data?.is_paid) {
            setPhase('paid');
            setTimeout(() => {
              if (!stopped) onPaid();
            }, 900);
          }
        } else {
          const res = await payosService.getPaymentStatus(String(data.orderCode));
          const st = res.data?.data?.paymentStatus;
          if (!stopped && st === 'success') {
            setPhase('paid');
            setTimeout(() => {
              if (!stopped) onPaid();
            }, 900);
          } else if (!stopped && st === 'failed') {
            setPhase('failed');
          }
        }
      } catch {
        // Bỏ qua lỗi mạng thoáng qua, thử lại ở nhịp tiếp theo
      }
    };

    const id = setInterval(check, 3000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [data, phase, onPaid]);

  if (!data) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const handleCancel = async () => {
    if (phase === 'paid') {
      onPaid();
      return;
    }
    setCancelling(true);
    try {
      await payosService.cancel(String(data.orderCode));
    } catch {
      // Kể cả khi link đã huỷ/hết hạn trước đó vẫn đóng modal bình thường
    } finally {
      setCancelling(false);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payos-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-[420px] overflow-hidden rounded-card bg-surface-card shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-brand" aria-hidden="true" />
            <h2 id="payos-modal-title" className="text-h3 text-ink">
              {data.type === 'order' && data.orderId
                ? t('titleOrder', { id: data.orderId })
                : t('titleTopup')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-control p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col items-center px-6 py-5 text-center">
          <p className="text-caption uppercase tracking-wide text-ink-muted">{t('amountLabel')}</p>
          <p className="mt-1 text-h2 font-bold tabular-nums text-price">
            {formatPrice(data.amount)}
          </p>

          {phase === 'paid' ? (
            <div className="my-6 flex flex-col items-center gap-2 text-state-success-fg">
              <CheckCircle2 className="h-14 w-14" aria-hidden="true" />
              <p className="text-body font-semibold">{t('paidSuccess')}</p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex h-[256px] w-[256px] items-center justify-center rounded-card border border-ink/12 bg-white p-2">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={t('qrAlt')}
                    className="h-60 w-60 object-contain"
                  />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin text-ink-muted" aria-hidden="true" />
                )}
              </div>

              <p className="mt-3 text-small text-ink-muted">{t('scanHint')}</p>

              {phase === 'expired' ? (
                <p role="alert" className="mt-2 text-small font-semibold text-state-danger-fg">
                  {t('expired')}
                </p>
              ) : phase === 'failed' ? (
                <p role="alert" className="mt-2 text-small font-semibold text-state-danger-fg">
                  {t('cancelled')}
                </p>
              ) : (
                <div className="mt-2.5 flex items-center gap-2 text-caption text-ink-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" aria-hidden="true" />
                  <span>{t('waiting')}</span>
                  <span className="font-semibold tabular-nums text-ink">
                    {mm}:{ss}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {phase !== 'paid' && (
          <div className="flex flex-col gap-2 border-t border-ink/10 px-5 py-4">
            {data.checkoutUrl && (
              <a
                href={data.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t('openPayos')}
              </a>
            )}
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full rounded-control px-4 py-2 text-small font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-60"
            >
              {cancelling ? t('cancelling') : t('cancelPayment')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
