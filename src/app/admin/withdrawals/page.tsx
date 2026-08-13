'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Banknote, Loader2, Check, X, Send } from 'lucide-react';
import { withdrawalService } from '@/services/withdrawal.service';
import { useToast } from '@/components/Toast';
import BackButton from '@/components/BackButton';
import { formatPrice } from '@/lib/format';
import { TONE_CLASS } from '@/lib/status-tone';
import {
  WITHDRAWAL_STATUSES,
  withdrawalStatusTone,
  type WithdrawalStatus,
} from '@/lib/withdrawal-status';

interface Row {
  id: number;
  amount: number | string;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  status: WithdrawalStatus;
  note?: string;
  created_at: string;
  user?: { id: number; full_name?: string; email?: string };
  approved_by?: { id: number; full_name?: string };
}

type Action = 'approve' | 'reject' | 'complete';

/**
 * Duyệt lệnh rút tiền.
 *
 * Ba điều cần biết trước khi đọc mã, vì chúng quyết định bố cục:
 *
 * 1. DUYỆT KHÔNG LÀM TIỀN CHẠY ĐI ĐÂU. Tiền rời ví người bán ngay lúc họ gửi
 *    lệnh, sang tài khoản `withdrawal_pending`. Duyệt chỉ đổi nhãn. Mãi tới
 *    "hoàn tất" tiền mới thật sự rời hệ thống. Nên "hoàn tất" là thao tác
 *    không lùi được, còn "duyệt" thì lùi được — hai mức xác nhận khác nhau.
 *
 * 2. TỪ CHỐI TRẢ TIỀN VỀ VÍ. Nó không phải nút huỷ vô hại: nó là một lần
 *    chuyển tiền ngược. Nên bắt buộc phải ghi lý do, và người bán đọc được lý
 *    do đó trên trang ví của họ.
 *
 * 3. Thứ tự trong bảng do backend quyết định (`created_at DESC`), không sắp xếp
 *    được từ giao diện. Ghi rõ ở đầu bảng thay vì để cột trông như bấm được.
 */
export default function AdminWithdrawalsPage() {
  const { toast } = useToast();
  const t = useTranslations('adminWithdrawals');
  const tc = useTranslations('common');
  const tw = useTranslations('withdrawalStatus');

  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busyId, setBusyId] = useState<number | null>(null);

  const [dialog, setDialog] = useState<{ row: Row; action: Action } | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /** Nút đã mở hộp thoại, để trả con trỏ về đúng chỗ khi đóng. */
  const openerRef = useRef<HTMLElement | null>(null);

  const fetchRows = useCallback(
    async (p: number, status: string) => {
      setState('loading');
      try {
        const res = await withdrawalService.adminList(p, 20, status || undefined);
        const data = res.data?.data ?? {};
        setRows(data.result || []);
        setMeta(data.meta || { current: p, pageSize: 20, total: 0, pages: 0 });
        setState('ready');
      } catch {
        setState('error');
      }
    },
    [],
  );

  useEffect(() => {
    fetchRows(page, statusFilter);
  }, [page, statusFilter, fetchRows]);

  const openDialog = (row: Row, action: Action, e: React.MouseEvent<HTMLButtonElement>) => {
    openerRef.current = e.currentTarget;
    setNote('');
    setNoteError('');
    setDialog({ row, action });
  };

  const closeDialog = useCallback(() => {
    setDialog(null);
    setNoteError('');
    openerRef.current?.focus();
  }, []);

  // Con trỏ vào ô đáng dùng nhất khi hộp thoại mở: ô lý do nếu là từ chối,
  // còn lại là nút xác nhận.
  useEffect(() => {
    if (!dialog) return;
    const target = dialog.action === 'reject' ? noteRef.current : confirmRef.current;
    target?.focus();
  }, [dialog]);

  // Escape để đóng, và Tab quẩn trong hộp thoại thay vì chạy ra sau lưng nó.
  useEffect(() => {
    if (!dialog) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeDialog();
        return;
      }
      if (ev.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, textarea, [href], input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dialog, closeDialog]);

  const runAction = async () => {
    if (!dialog) return;
    const { row, action } = dialog;

    if (action === 'reject' && !note.trim()) {
      setNoteError(t('noteRequired'));
      noteRef.current?.focus();
      return;
    }

    setBusyId(row.id);
    try {
      if (action === 'approve') await withdrawalService.approve(row.id);
      else if (action === 'reject') await withdrawalService.reject(row.id, note.trim());
      else await withdrawalService.complete(row.id);

      toast(t(`done_${action}`, { amount: formatPrice(Number(row.amount || 0)) }), 'success');
      closeDialog();
      // Đọc lại từ server. Sửa trạng thái ngay trong state ở client sẽ đúng
      // trong đa số trường hợp và sai đúng lúc quan trọng nhất — khi backend
      // từ chối thao tác vì lệnh đã bị người khác xử lý trước đó.
      fetchRows(page, statusFilter);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast(Array.isArray(msg) ? msg[0] : msg || t(`failed_${action}`), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const th =
    'whitespace-nowrap px-4 py-3.5 text-left text-caption font-semibold uppercase tracking-wide text-ink-muted';
  const td = 'px-4 py-4 align-top';

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-surface-page p-6">
      <BackButton />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-1 text-small text-ink-muted">
            {state === 'loading' ? tc('loading') : t('count', { count: meta.total })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="wd-filter" className="text-small text-ink-muted">
            {t('filterLabel')}
          </label>
          <select
            id="wd-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-control border border-ink/16 bg-surface-card px-3 py-2 text-small text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="">{t('filterAll')}</option>
            {WITHDRAWAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tw(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-card bg-surface-card">
        <p className="border-b border-ink/10 px-4 py-3 text-caption text-ink-muted">
          {t('sortNote')}
        </p>

        {state === 'loading' ? (
          <div className="py-16 text-center text-ink-muted">
            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" aria-hidden="true" />
            <p className="text-small">{tc('loading')}</p>
          </div>
        ) : state === 'error' ? (
          <div className="py-16 text-center">
            <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
            <button
              type="button"
              onClick={() => fetchRows(page, statusFilter)}
              className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {tc('retry')}
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <Banknote className="mx-auto mb-3 h-12 w-12 text-ink-faint" aria-hidden="true" />
            {/* Rỗng vì chưa có lệnh nào, và rỗng vì bộ lọc không khớp, là hai
                chuyện khác nhau — nói đúng cái nào đang xảy ra. */}
            <p className="text-small text-ink-muted">
              {statusFilter ? t('emptyFiltered', { status: tw(statusFilter as WithdrawalStatus) }) : t('empty')}
            </p>
            {statusFilter && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('');
                  setPage(1);
                }}
                className="mt-4 rounded-control border border-ink/16 px-4 py-2 text-small font-medium text-ink transition-colors hover:bg-surface-page"
              >
                {t('clearFilter')}
              </button>
            )}
          </div>
        ) : (
          /* Cuộn ngang có viền báo hiệu, không tự bẻ mỗi hàng thành một thẻ.
             Bảng này là bảng thật: người duyệt cần so số tiền giữa các hàng. */
          <div className="overflow-x-auto" tabIndex={0} aria-label={t('tableLabel')}>
            <table className="w-full min-w-[860px]">
              <caption className="sr-only">{t('tableLabel')}</caption>
              <thead className="border-b border-ink/10 bg-surface-page">
                <tr>
                  <th scope="col" className={th}>{t('colSeller')}</th>
                  <th scope="col" className={th}>{t('colAmount')}</th>
                  <th scope="col" className={th}>{t('colBank')}</th>
                  <th scope="col" className={th}>{t('colStatus')}</th>
                  <th scope="col" className={th}>{t('colCreated')}</th>
                  <th scope="col" className={`${th} text-right`}>{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {rows.map((r) => {
                  const busy = busyId === r.id;
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-surface-page">
                      <td className={td}>
                        <div className="text-small font-medium text-ink">
                          {r.user?.full_name || '—'}
                        </div>
                        <div className="text-caption text-ink-muted">{r.user?.email || '—'}</div>
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        <span className="text-small font-bold tabular-nums text-ink">
                          {formatPrice(Number(r.amount || 0))}
                        </span>
                      </td>
                      <td className={td}>
                        <div className="text-small text-ink">{r.bank_name}</div>
                        <div className="text-caption tabular-nums text-ink-muted">
                          {r.bank_account}
                        </div>
                        <div className="text-caption text-ink-muted">{r.bank_holder}</div>
                      </td>
                      <td className={td}>
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-caption font-medium ${TONE_CLASS[withdrawalStatusTone(r.status)]}`}
                        >
                          {tw(r.status)}
                        </span>
                        {r.status === 'rejected' && r.note && (
                          <p className="mt-1.5 max-w-[220px] text-caption text-ink-muted">
                            {r.note}
                          </p>
                        )}
                        {r.approved_by?.full_name && (
                          <p className="mt-1.5 text-caption text-ink-faint">
                            {t('byAdmin', { name: r.approved_by.full_name })}
                          </p>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap text-small tabular-nums text-ink-muted`}>
                        {formatDate(r.created_at)}
                      </td>
                      <td className={`${td} text-right`}>
                        <div className="flex flex-wrap justify-end gap-2">
                          {r.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={(e) => openDialog(r, 'approve', e)}
                                className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('approve')}
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={(e) => openDialog(r, 'reject', e)}
                                className="inline-flex items-center gap-1.5 rounded-control border border-ink/16 px-3 py-1.5 text-caption font-semibold text-state-danger-fg transition-colors hover:bg-state-danger-bg disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                {t('reject')}
                              </button>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={(e) => openDialog(r, 'complete', e)}
                              className="inline-flex items-center gap-1.5 rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                            >
                              <Send className="h-3.5 w-3.5" aria-hidden="true" />
                              {t('complete')}
                            </button>
                          )}
                          {(r.status === 'completed' || r.status === 'rejected') && (
                            <span className="text-caption text-ink-faint">{t('noAction')}</span>
                          )}
                          {busy && (
                            <Loader2 className="h-4 w-4 animate-spin text-ink-muted" aria-hidden="true" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.pages > 1 && (
        <nav aria-label={t('pagerLabel')} className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-control border border-ink/16 px-4 py-2 text-small text-ink transition-colors hover:bg-surface-card disabled:opacity-40"
          >
            {tc('prev')}
          </button>
          <span className="text-small tabular-nums text-ink-muted">
            {t('pageOf', { page: meta.current, pages: meta.pages })}
          </span>
          <button
            type="button"
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
            className="rounded-control border border-ink/16 px-4 py-2 text-small text-ink transition-colors hover:bg-surface-card disabled:opacity-40"
          >
            {tc('next')}
          </button>
        </nav>
      )}

      {dialog && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-ink/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wd-dialog-title"
            aria-describedby="wd-dialog-desc"
            className="w-full max-w-md rounded-card bg-surface-card p-6"
          >
            <h2 id="wd-dialog-title" className="text-body font-semibold text-ink">
              {t(`confirmTitle_${dialog.action}`)}
            </h2>

            {/* Nói rõ hậu quả và phạm vi, không chỉ hỏi "chắc chưa?". */}
            <p id="wd-dialog-desc" className="mt-2 text-small leading-relaxed text-ink-muted">
              {t(`confirmBody_${dialog.action}`, {
                amount: formatPrice(Number(dialog.row.amount || 0)),
                seller: dialog.row.user?.full_name || dialog.row.user?.email || `#${dialog.row.user?.id ?? '?'}`,
                bank: `${dialog.row.bank_name} · ${dialog.row.bank_account}`,
              })}
            </p>

            {dialog.action === 'reject' && (
              <>
                <label htmlFor="wd-note" className="mb-1.5 mt-4 block text-small text-ink">
                  {t('noteLabel')}
                </label>
                <textarea
                  ref={noteRef}
                  id="wd-note"
                  rows={3}
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    if (noteError) setNoteError('');
                  }}
                  aria-invalid={!!noteError}
                  aria-describedby={noteError ? 'wd-note-err' : 'wd-note-hint'}
                  className="w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-state-danger-fg"
                />
                {noteError ? (
                  <p id="wd-note-err" className="mt-1.5 text-small text-state-danger-fg">
                    {noteError}
                  </p>
                ) : (
                  <p id="wd-note-hint" className="mt-1.5 text-small text-ink-muted">
                    {t('noteHint')}
                  </p>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-control border border-ink/16 px-4 py-2.5 text-small font-medium text-ink transition-colors hover:bg-surface-page"
              >
                {tc('cancel')}
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={runAction}
                disabled={busyId === dialog.row.id}
                className={`rounded-control px-4 py-2.5 text-small font-semibold text-white transition-colors disabled:opacity-50 ${
                  dialog.action === 'reject'
                    ? 'bg-state-danger-fg hover:opacity-90'
                    : 'bg-brand hover:bg-brand-dark'
                }`}
              >
                {busyId === dialog.row.id ? tc('loading') : t(`confirmCta_${dialog.action}`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
