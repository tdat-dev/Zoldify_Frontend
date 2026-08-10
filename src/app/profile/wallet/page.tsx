"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDownLeft, ArrowUpRight, Plus, CreditCard } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { payosService } from '@/services/payos.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format';
import { moneyFlow, moneyLabelKey } from '@/lib/money-flow';
import { EmptyState } from '@/components/EmptyState';

const MIN_TOPUP = 10000;

/**
 * Ví Zoldify.
 *
 * Năm thứ của bản trước đã gỡ:
 *
 * 1. MỌI LẦN NẠP TIỀN HIỆN DẤU TRỪ. Điều kiện là `t.type === 'deposit'`, mà
 *    'deposit' không có trong enum nào của backend (xem lib/money-flow.ts).
 *    Nạp 500.000 ₫ hiện ra "−500.000 ₫ · Thanh toán đơn hàng".
 *
 * 2. try/catch BỌC Promise.allSettled — allSettled không bao giờ reject nên
 *    khối catch là mã chết. Gọi hỏng thì số dư lặng lẽ hiện 0 ₫. Với màn hình
 *    tiền, "0 ₫" sai còn nguy hơn một dòng báo lỗi.
 *
 * 3. GIÁ NHÂN TAY `toLocaleString('vi-VN')` + chữ "VNĐ" viết cứng.
 *
 * 4. "Số tiền nạp tối thiểu 10,000đ" — dấu phẩy phân cách nghìn trong một câu
 *    tiếng Việt, và số viết cứng ở hai chỗ khác nhau trong cùng một file.
 *
 * 5. Ô nhập không có <label>, chỉ có placeholder — placeholder biến mất ngay
 *    khi người dùng gõ, nên không còn gì nói cho họ biết ô đó là gì.
 */
export default function WalletPage() {
  const { allowed } = useRequireAuth();
  const { toast } = useToast();
  const t = useTranslations('wallet');
  const tc = useTranslations('common');

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setState('loading');
    const [balanceRes, txRes] = await Promise.allSettled([
      paymentService.getBalance(),
      paymentService.getAll(1, 20),
    ]);
    // Số dư hỏng là hỏng thật sự: không có nó thì cả trang vô nghĩa. Lịch sử
    // hỏng thì vẫn hiện được số dư, chỉ để danh sách rỗng.
    if (balanceRes.status !== 'fulfilled') {
      setState('error');
      return;
    }
    setBalance(Number(balanceRes.value.data?.balance || 0));
    setTransactions(txRes.status === 'fulfilled' ? txRes.value.data?.data?.result || [] : []);
    setState('ready');
  }, []);

  useEffect(() => {
    if (allowed) fetchData();
  }, [allowed, fetchData]);

  const handleTopup = async () => {
    const amount = Number(topupAmount);
    if (!Number.isFinite(amount) || amount < MIN_TOPUP) {
      toast(t('topupTooSmall', { min: formatPrice(MIN_TOPUP) }), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await payosService.createLink({ type: 'topup', amount });
      const checkoutUrl = res.data?.data?.checkoutUrl;
      if (!checkoutUrl) {
        toast(t('topupNoLink'), 'error');
        setSubmitting(false);
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err: any) {
      toast(err.response?.data?.message || t('topupFailed'), 'error');
      setSubmitting(false);
    }
  };

  const card = 'rounded-card bg-surface-card';

  if (state === 'loading') {
    return <div className={`${card} px-6 py-20 text-center text-body text-ink-muted`}>{tc('loading')}</div>;
  }

  if (state === 'error') {
    return (
      <div className={`${card} px-6 py-20 text-center`}>
        <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
        <button
          type="button"
          onClick={fetchData}
          className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {tc('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <section aria-labelledby="wallet-balance" className={`${card} p-6`}>
          <h1 id="wallet-balance" className="text-caption uppercase tracking-wide text-ink-faint">
            {t('balance')}
          </h1>
          <p className="mt-2 text-display font-bold tabular-nums text-ink">
            {formatPrice(balance ?? 0)}
          </p>
          <button
            type="button"
            onClick={() => setShowTopup((v) => !v)}
            aria-expanded={showTopup}
            className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-control bg-brand px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('topup')}
          </button>
        </section>

        {showTopup && (
          <section aria-labelledby="topup-title" className={`${card} p-6`}>
            <h2 id="topup-title" className="text-small font-semibold text-ink">
              {t('topupTitle')}
            </h2>
            <label htmlFor="topup-amount" className="mb-1.5 mt-4 block text-small text-ink">
              {t('topupAmount')}
            </label>
            <input
              id="topup-amount"
              type="number"
              inputMode="numeric"
              min={MIN_TOPUP}
              step={1000}
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              aria-describedby="topup-min"
              className="w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body tabular-nums text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p id="topup-min" className="mt-1.5 text-small text-ink-muted">
              {t('topupMin', { min: formatPrice(MIN_TOPUP) })}
            </p>
            <p className="mt-4 flex items-start gap-2 text-small leading-relaxed text-ink-muted">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {t('topupVia')}
            </p>
            <button
              type="button"
              onClick={handleTopup}
              disabled={submitting}
              className="mt-5 w-full rounded-control bg-brand px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint"
            >
              {submitting ? t('topupCreating') : t('topupSubmit')}
            </button>
          </section>
        )}
      </div>

      <section aria-labelledby="wallet-history" className={`${card} lg:col-span-2`}>
        <h2
          id="wallet-history"
          className="border-b border-ink/10 px-6 py-4 text-small font-semibold text-ink"
        >
          {t('history')}
        </h2>

        {transactions.length === 0 ? (
          <EmptyState title={t('empty')} hint={t('emptyHint')} />
        ) : (
          <ul className="divide-y divide-ink/10">
            {transactions.map((tx: any) => {
              const flow = moneyFlow(tx.type);
              const key = moneyLabelKey(tx.type);
              const amount = Number(tx.amount || 0);
              return (
                <li key={tx.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        flow === 'in'
                          ? 'bg-state-success-bg text-state-success-fg'
                          : flow === 'out'
                            ? 'bg-state-neutral-bg text-state-neutral-fg'
                            : 'bg-surface-sunken text-ink-faint'
                      }`}
                    >
                      {flow === 'in' ? (
                        <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0">
                      {/* Kiểu lạ thì hiện nguyên văn giá trị backend trả về,
                          không gán bừa một nhãn gần đúng — đó chính là cách
                          "mọi thứ không phải deposit đều là thanh toán đơn
                          hàng" đã nói dối người dùng. */}
                      <span className="block truncate text-small text-ink">
                        {key
                          ? t(`tx${key.charAt(0).toUpperCase()}${key.slice(1)}` as any)
                          : String(tx.type ?? '—')}
                      </span>
                      {tx.created_at && (
                        <time
                          dateTime={tx.created_at}
                          className="block text-caption tabular-nums text-ink-faint"
                        >
                          {new Date(tx.created_at).toLocaleString()}
                        </time>
                      )}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 text-small font-bold tabular-nums ${
                      flow === 'in' ? 'text-state-success-fg' : 'text-ink'
                    }`}
                  >
                    {flow === 'in' ? '+' : flow === 'out' ? '−' : ''}
                    {formatPrice(amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
