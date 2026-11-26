"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Check, CheckCircle2, Copy, ExternalLink, Loader2, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import { payosService } from '@/services/payos.service';
import { formatPrice } from '@/lib/format';

const VN_BANK_BY_BIN: Record<string, string> = {
  '970422': 'MB Bank',
  '970436': 'Vietcombank',
  '970415': 'VietinBank',
  '970418': 'BIDV',
  '970405': 'Agribank',
  '970407': 'Techcombank',
  '970416': 'ACB',
  '970432': 'VPBank',
  '970423': 'TPBank',
  '970403': 'Sacombank',
  '970437': 'HDBank',
  '970441': 'VIB',
  '970443': 'SHB',
  '970426': 'MSB',
  '970448': 'OCB',
  '970449': 'LPBank',
  '970431': 'Eximbank',
  '970440': 'SeABank',
  '970428': 'Nam A Bank',
  '970454': 'BVBank',
  '970412': 'PVcomBank',
  '970425': 'ABBank',
  '970409': 'Bac A Bank',
  '970452': 'KienlongBank',
  '970424': 'Shinhan Bank',
  '970457': 'Woori Bank',
  '970458': 'UOB',
};

export interface PayosModalData {
  type: 'order' | 'topup';
  orderId?: number;
  orderCode: number;
  amount: number;
  qrCode: string;
  checkoutUrl: string;
  expiresAt?: number;
  bin?: string;
  accountNumber?: string;
  accountName?: string;
  description?: string;
  isMock?: boolean;
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
  const [vietQrFailed, setVietQrFailed] = useState(false);
  const [phase, setPhase] = useState<'pending' | 'paid' | 'expired' | 'failed'>('pending');
  const [cancelling, setCancelling] = useState(false);
  const [mocking, setMocking] = useState(false);
  const [mockError, setMockError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(15 * 60);

  const vietQrUrl =
    data?.bin && data?.accountNumber
      ? `https://img.vietqr.io/image/${encodeURIComponent(data.bin)}-${encodeURIComponent(data.accountNumber)}-compact2.png?amount=${Math.round(data.amount)}&addInfo=${encodeURIComponent(data.description || `DH${data.orderCode}`)}&accountName=${encodeURIComponent(data.accountName || '')}`
      : '';

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1500);
  };

  // Fallback render QR cục bộ nếu thiếu bin/STK hoặc img.vietqr.io lỗi mạng
  useEffect(() => {
    setVietQrFailed(false);
    if (!data?.qrCode) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    setPhase('pending');
    QRCode.toDataURL(data.qrCode, {
      width: 260,
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

  // Khoá scroll trang nền khi mở popup để Header/sticky không trôi lộn xộn
  useEffect(() => {
    if (!data) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [data]);

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

  const handleMockConfirm = async () => {
    setMockError('');
    setMocking(true);
    try {
      await payosService.mockConfirm(String(data.orderCode));
      setPhase('paid');
      setTimeout(() => onPaid(), 700);
    } catch (err: any) {
      const m = err?.response?.data?.message;
      setMockError((Array.isArray(m) ? m[0] : m) || t('mockFailed'));
    } finally {
      setMocking(false);
    }
  };

  const hasManualInfo = !!(data.accountNumber || data.accountName || data.description);
  const bankDisplay = data.bin ? VN_BANK_BY_BIN[data.bin] || `BIN ${data.bin}` : '';

  const copyRow = (key: string, label: string, value: string, copyValue = value) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 text-left">
        <p className="text-caption text-ink-muted">{label}</p>
        <p className="truncate text-small font-semibold tabular-nums text-ink">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => handleCopy(key, copyValue)}
        className="inline-flex shrink-0 items-center gap-1 rounded-control border border-ink/16 px-2.5 py-1 text-caption font-semibold text-ink transition-colors hover:bg-surface-sunken"
      >
        {copiedKey === key ? (
          <>
            <Check className="h-3.5 w-3.5 text-state-success-fg" aria-hidden="true" />
            {t('copied')}
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            {t('copy')}
          </>
        )}
      </button>
    </div>
  );

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payos-modal-title"
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-3 sm:p-4"
    >
      <div
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-card bg-surface-card shadow-xl ${
          hasManualInfo && phase !== 'paid' ? 'max-w-[660px]' : 'max-w-[400px]'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-5 py-3">
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

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {phase === 'paid' ? (
            <div className="my-6 flex flex-col items-center gap-2 text-center text-state-success-fg">
              <CheckCircle2 className="h-14 w-14" aria-hidden="true" />
              <p className="text-body font-semibold">{t('paidSuccess')}</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-4 sm:gap-5 ${
                hasManualInfo ? 'sm:grid-cols-2 sm:items-center' : ''
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <p className="text-caption uppercase tracking-wide text-ink-muted">
                  {t('amountLabel')}
                </p>
                <p className="mt-0.5 text-h2 font-bold tabular-nums text-price">
                  {formatPrice(data.amount)}
                </p>

                <div className="mt-2.5 flex w-full max-w-[216px] items-center justify-center overflow-hidden rounded-card border border-ink/12 bg-white">
                  {vietQrUrl && !vietQrFailed ? (
                    <img
                      src={vietQrUrl}
                      alt={t('qrAlt')}
                      onError={() => setVietQrFailed(true)}
                      className="h-auto w-full object-contain"
                    />
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={t('qrAlt')}
                      className="h-[200px] w-[200px] p-2 object-contain"
                    />
                  ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-ink-muted" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <p className="mt-2 text-caption text-ink-muted">{t('scanHint')}</p>

                {phase === 'expired' ? (
                  <p role="alert" className="mt-1.5 text-small font-semibold text-state-danger-fg">
                    {t('expired')}
                  </p>
                ) : phase === 'failed' ? (
                  <p role="alert" className="mt-1.5 text-small font-semibold text-state-danger-fg">
                    {t('cancelled')}
                  </p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-1.5 text-caption text-ink-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" aria-hidden="true" />
                    <span>{t('waiting')}</span>
                    <span className="font-semibold tabular-nums text-ink">
                      {mm}:{ss}
                    </span>
                  </div>
                )}
              </div>

              {hasManualInfo && (
                <div className="rounded-control border border-ink/10 bg-surface-sunken/50 px-4 py-3">
                  <p className="mb-1 text-small font-semibold text-ink">{t('manualTitle')}</p>
                  <div className="divide-y divide-ink/10">
                    {bankDisplay && (
                      <div className="py-2 text-left">
                        <p className="text-caption text-ink-muted">{t('bankLabel')}</p>
                        <p className="text-small font-semibold text-ink">{bankDisplay}</p>
                      </div>
                    )}
                    {data.accountName && (
                      <div className="py-2 text-left">
                        <p className="text-caption text-ink-muted">{t('accountNameLabel')}</p>
                        <p className="text-small font-semibold text-ink">{data.accountName}</p>
                      </div>
                    )}
                    {data.accountNumber &&
                      copyRow('account', t('accountNumberLabel'), data.accountNumber)}
                    {copyRow(
                      'amount',
                      t('amountLabel'),
                      formatPrice(data.amount),
                      String(Math.round(data.amount)),
                    )}
                    {data.description &&
                      copyRow('desc', t('transferContentLabel'), data.description)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {phase !== 'paid' && (
          <div className="flex shrink-0 flex-col gap-2 border-t border-ink/10 px-5 py-3">
            {data.isMock && (
              <>
                <div className="flex items-center justify-center">
                  <span className="rounded-control bg-state-pending-bg px-2.5 py-0.5 text-caption font-semibold text-state-pending-fg">
                    {t('mockBadge')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleMockConfirm}
                  disabled={mocking || cancelling}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-control bg-brand px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                >
                  {mocking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {mocking ? t('mockConfirming') : t('mockConfirm')}
                </button>
                {mockError && (
                  <p role="alert" className="text-center text-caption text-state-danger-fg">
                    {mockError}
                  </p>
                )}
              </>
            )}
            {data.checkoutUrl && !data.isMock && (
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
              disabled={cancelling || mocking}
              className="w-full rounded-control px-4 py-2 text-small font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink disabled:opacity-60"
            >
              {cancelling ? t('cancelling') : t('cancelPayment')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
