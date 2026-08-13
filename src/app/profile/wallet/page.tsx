"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowDownLeft, ArrowUpRight, Plus, CreditCard, Banknote, Lock } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { payosService } from '@/services/payos.service';
import { withdrawalService } from '@/services/withdrawal.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format';
import { moneyFlow, moneyLabelKey } from '@/lib/money-flow';
import { EmptyState } from '@/components/EmptyState';
import { TONE_CLASS } from '@/lib/status-tone';
import { withdrawalStatusTone, isHoldingMoney } from '@/lib/withdrawal-status';

const MIN_TOPUP = 10000;

/** Khớp với @Min(10000) trong CreateWithdrawalDto của backend. */
const MIN_WITHDRAW = 10000;

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
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Thêm phần RÚT TIỀN. Trước đây trang này 243 dòng và không có một chữ "rút"
 * nào, trong khi backend đã đủ ba chặng và có chín test. Người bán kiếm được
 * tiền mà không có đường nào lấy ra.
 *
 * Hai quyết định về bố cục, không phải cho đẹp:
 *
 * · Số tiền ĐANG BỊ GIỮ nằm ngay dưới số khả dụng, cùng một thẻ. Gửi lệnh rút
 *   là tiền rời `available` ngay lập tức; nếu chỉ hiện mỗi số khả dụng thì
 *   người bán vừa bấm gửi xong thấy số dư tụt và không có gì nói tiền đi đâu.
 *
 * · Danh sách lệnh rút nằm ở cột trái, ngay dưới thẻ số dư — không phải một tab
 *   riêng. Nó trả lời đúng câu hỏi mà con số "đang bị giữ" vừa đặt ra, nên phải
 *   ở trong tầm mắt của con số đó.
 */
export default function WalletPage() {
  const { allowed } = useRequireAuth();
  const { toast } = useToast();
  const t = useTranslations('wallet');
  const tc = useTranslations('common');
  const tw = useTranslations('withdrawalStatus');

  const [balance, setBalance] = useState<number | null>(null);
  const [held, setHeld] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [panel, setPanel] = useState<'none' | 'topup' | 'withdraw'>('none');
  const [topupAmount, setTopupAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const amountRef = useRef<HTMLInputElement>(null);
  const bankNameRef = useRef<HTMLInputElement>(null);
  const bankAccountRef = useRef<HTMLInputElement>(null);
  const bankHolderRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setState('loading');
    const [balanceRes, txRes, wdRes] = await Promise.allSettled([
      paymentService.getBalance(),
      paymentService.getAll(1, 20),
      withdrawalService.getMine(1, 20),
    ]);
    // Số dư hỏng là hỏng thật sự: không có nó thì cả trang vô nghĩa. Lịch sử
    // hỏng thì vẫn hiện được số dư, chỉ để danh sách rỗng.
    if (balanceRes.status !== 'fulfilled') {
      setState('error');
      return;
    }
    // `.data.data` chứ không phải `.data`. TransformInterceptor của backend bọc
    // MỌI response thành {statusCode, message, data} và http.ts không bóc lớp
    // đó ra, nên payload luôn nằm sâu hai tầng.
    //
    // Bản trước viết `balanceRes.value.data?.balance` — đọc `balance` trên
    // chính cái phong bì, luôn undefined, nên `Number(undefined || 0)` cho ra 0.
    // Số dư ví CHƯA BAO GIỜ hiện đúng. Dòng đọc lịch sử ngay bên dưới thì lại
    // `.data?.data?.result`, đúng — hai cách đọc khác nhau cạnh nhau trong cùng
    // một hàm, và cái sai là cái nằm ở màn hình tiền.
    const wallet = balanceRes.value.data?.data ?? {};
    setBalance(Number(wallet.balance || 0));
    setHeld(Number(wallet.pending_withdrawal || 0));
    setTransactions(txRes.status === 'fulfilled' ? txRes.value.data?.data?.result || [] : []);
    setWithdrawals(wdRes.status === 'fulfilled' ? wdRes.value.data?.data?.result || [] : []);
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

  /**
   * Kiểm tại chỗ rồi mới gửi. Backend vẫn kiểm lại — cái này chỉ để người dùng
   * biết sai ở ô nào trước khi mất một vòng mạng, và để con trỏ nhảy đúng ô đó.
   */
  const validate = () => {
    const next: Record<string, string> = {};
    const amount = Number(form.amount);

    if (!form.amount.trim()) next.amount = t('wdErrAmountRequired');
    else if (!Number.isFinite(amount)) next.amount = t('wdErrAmountNaN');
    else if (amount < MIN_WITHDRAW)
      next.amount = t('wdErrAmountMin', { min: formatPrice(MIN_WITHDRAW) });
    else if (amount > (balance ?? 0))
      next.amount = t('wdErrAmountOverBalance', { available: formatPrice(balance ?? 0) });

    if (!form.bank_name.trim()) next.bank_name = t('wdErrBankName');
    if (!form.bank_account.trim()) next.bank_account = t('wdErrBankAccount');
    if (!form.bank_holder.trim()) next.bank_holder = t('wdErrBankHolder');

    setErrors(next);

    // Đưa con trỏ về ô hỏng đầu tiên theo đúng thứ tự trên màn hình, không phải
    // thứ tự khoá trong object.
    const order: [string, React.RefObject<HTMLInputElement | null>][] = [
      ['amount', amountRef],
      ['bank_name', bankNameRef],
      ['bank_account', bankAccountRef],
      ['bank_holder', bankHolderRef],
    ];
    for (const [key, ref] of order) {
      if (next[key]) {
        ref.current?.focus();
        break;
      }
    }
    return Object.keys(next).length === 0;
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await withdrawalService.create({
        amount: Number(form.amount),
        bank_name: form.bank_name.trim(),
        bank_account: form.bank_account.trim(),
        bank_holder: form.bank_holder.trim(),
      });
      toast(t('wdCreated'), 'success');
      setForm({ amount: '', bank_name: '', bank_account: '', bank_holder: '' });
      setErrors({});
      setPanel('none');
      // Đọc lại từ server chứ không tự trừ số dư trong state: số thật do sổ cái
      // quyết định, đoán ở client là cách hai con số bắt đầu lệch nhau.
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast(Array.isArray(msg) ? msg[0] : msg || t('wdFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const card = 'rounded-card bg-surface-card';
  const inputClass =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-state-danger-fg';

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

  const available = balance ?? 0;
  const canAffordMinimum = available >= MIN_WITHDRAW;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="flex flex-col gap-3 lg:col-span-1">
        <section aria-labelledby="wallet-balance" className={`${card} p-6`}>
          <h1 id="wallet-balance" className="text-caption uppercase tracking-wide text-ink-faint">
            {t('balance')}
          </h1>
          <p className="mt-2 text-display font-bold tabular-nums text-ink">
            {formatPrice(available)}
          </p>

          {held > 0 && (
            <p className="mt-3 flex items-start gap-2 text-small text-ink-muted">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {t('heldAmount', { amount: formatPrice(held) })}
                <span className="mt-0.5 block text-caption text-ink-faint">{t('heldHint')}</span>
              </span>
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPanel((p) => (p === 'topup' ? 'none' : 'topup'))}
              aria-expanded={panel === 'topup'}
              className="inline-flex items-center justify-center gap-1.5 rounded-control bg-brand px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('topup')}
            </button>
            <button
              type="button"
              onClick={() => setPanel((p) => (p === 'withdraw' ? 'none' : 'withdraw'))}
              aria-expanded={panel === 'withdraw'}
              className="inline-flex items-center justify-center gap-1.5 rounded-control border border-ink/16 bg-surface-card px-4 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-page"
            >
              <Banknote className="h-4 w-4" aria-hidden="true" />
              {t('wdAction')}
            </button>
          </div>
        </section>

        {panel === 'topup' && (
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
              className={`${inputClass} tabular-nums`}
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

        {panel === 'withdraw' && (
          <section aria-labelledby="withdraw-title" className={`${card} p-6`}>
            <h2 id="withdraw-title" className="text-small font-semibold text-ink">
              {t('wdTitle')}
            </h2>

            {/* Số dư chưa đủ thì nói thẳng ở đây. Nút mờ đi mà không giải thích
                là bắt người dùng tự đoán mình đã làm sai chuyện gì. */}
            {!canAffordMinimum && (
              <p className="mt-3 rounded-control bg-state-pending-bg px-3 py-2.5 text-small text-state-pending-fg">
                {t('wdBelowMinimum', {
                  min: formatPrice(MIN_WITHDRAW),
                  available: formatPrice(available),
                })}
              </p>
            )}

            <form onSubmit={handleWithdraw} noValidate>
              <label htmlFor="wd-amount" className="mb-1.5 mt-4 block text-small text-ink">
                {t('wdAmount')}
              </label>
              <input
                ref={amountRef}
                id="wd-amount"
                type="number"
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'wd-amount-err' : 'wd-amount-hint'}
                className={`${inputClass} tabular-nums`}
              />
              {errors.amount ? (
                <p id="wd-amount-err" className="mt-1.5 text-small text-state-danger-fg">
                  {errors.amount}
                </p>
              ) : (
                <p id="wd-amount-hint" className="mt-1.5 text-small text-ink-muted">
                  {t('wdAmountHint', {
                    min: formatPrice(MIN_WITHDRAW),
                    available: formatPrice(available),
                  })}
                </p>
              )}

              <label htmlFor="wd-bank-name" className="mb-1.5 mt-4 block text-small text-ink">
                {t('wdBankName')}
              </label>
              <input
                ref={bankNameRef}
                id="wd-bank-name"
                type="text"
                autoComplete="off"
                value={form.bank_name}
                onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                aria-invalid={!!errors.bank_name}
                aria-describedby={errors.bank_name ? 'wd-bank-name-err' : undefined}
                className={inputClass}
              />
              {errors.bank_name && (
                <p id="wd-bank-name-err" className="mt-1.5 text-small text-state-danger-fg">
                  {errors.bank_name}
                </p>
              )}

              <label htmlFor="wd-bank-account" className="mb-1.5 mt-4 block text-small text-ink">
                {t('wdBankAccount')}
              </label>
              <input
                ref={bankAccountRef}
                id="wd-bank-account"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.bank_account}
                onChange={(e) => setForm((f) => ({ ...f, bank_account: e.target.value }))}
                aria-invalid={!!errors.bank_account}
                aria-describedby={errors.bank_account ? 'wd-bank-account-err' : undefined}
                className={`${inputClass} tabular-nums`}
              />
              {errors.bank_account && (
                <p id="wd-bank-account-err" className="mt-1.5 text-small text-state-danger-fg">
                  {errors.bank_account}
                </p>
              )}

              <label htmlFor="wd-bank-holder" className="mb-1.5 mt-4 block text-small text-ink">
                {t('wdBankHolder')}
              </label>
              <input
                ref={bankHolderRef}
                id="wd-bank-holder"
                type="text"
                autoComplete="off"
                value={form.bank_holder}
                onChange={(e) => setForm((f) => ({ ...f, bank_holder: e.target.value }))}
                aria-invalid={!!errors.bank_holder}
                aria-describedby={
                  errors.bank_holder ? 'wd-bank-holder-err' : 'wd-bank-holder-hint'
                }
                className={inputClass}
              />
              {errors.bank_holder ? (
                <p id="wd-bank-holder-err" className="mt-1.5 text-small text-state-danger-fg">
                  {errors.bank_holder}
                </p>
              ) : (
                <p id="wd-bank-holder-hint" className="mt-1.5 text-small text-ink-muted">
                  {t('wdBankHolderHint')}
                </p>
              )}

              <p className="mt-4 flex items-start gap-2 text-small leading-relaxed text-ink-muted">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {t('wdHoldNotice')}
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-control bg-brand px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint"
              >
                {submitting ? t('wdSubmitting') : t('wdSubmit')}
              </button>
            </form>
          </section>
        )}

        <section aria-labelledby="wd-history" className={card}>
          <h2
            id="wd-history"
            className="border-b border-ink/10 px-6 py-4 text-small font-semibold text-ink"
          >
            {t('wdHistory')}
          </h2>
          {withdrawals.length === 0 ? (
            <EmptyState title={t('wdEmpty')} hint={t('wdEmptyHint')} />
          ) : (
            <ul className="divide-y divide-ink/10">
              {withdrawals.map((w: any) => (
                <li key={w.id} className="px-6 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-small font-bold tabular-nums text-ink">
                      {formatPrice(Number(w.amount || 0))}
                    </span>
                    {/* Nhãn chữ, không phải chấm màu: trạng thái không được
                        chỉ dựa vào màu để đọc ra. */}
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-caption font-medium ${TONE_CLASS[withdrawalStatusTone(w.status)]}`}
                    >
                      {tw(w.status)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-caption text-ink-muted">
                    {w.bank_name} · {w.bank_account}
                  </p>
                  {w.created_at && (
                    <time
                      dateTime={w.created_at}
                      className="mt-0.5 block text-caption tabular-nums text-ink-faint"
                    >
                      {new Date(w.created_at).toLocaleString()}
                    </time>
                  )}
                  {isHoldingMoney(w.status) && (
                    <p className="mt-1.5 text-caption text-ink-muted">{t('wdStillHeld')}</p>
                  )}
                  {w.status === 'rejected' && w.note && (
                    <p className="mt-1.5 text-caption text-state-danger-fg">
                      {t('wdRejectedReason', { note: w.note })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
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
