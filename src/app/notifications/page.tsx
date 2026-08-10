"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Bell, CheckCheck, Trash2, MessageSquare, ShoppingBag, CreditCard } from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';

const TYPE_ICONS: Record<string, any> = {
  order_status: ShoppingBag,
  message: MessageSquare,
  payment: CreditCard,
  system: Bell,
};

/**
 * Thông báo.
 *
 * Năm thứ của bản trước đã gỡ:
 *
 * 1. BA KHỐI `catch {}` RỖNG HOÀN TOÀN. Tải hỏng thì hiện "Chưa có thông báo"
 *    — nói sai sự thật. Đánh dấu đã đọc hỏng thì không có dấu hiệu nào, người
 *    dùng bấm lại vài lần rồi bỏ.
 *
 * 2. `<div onClick>` LÀM NÚT đánh dấu đã đọc: không tab tới được, không có
 *    role, trình đọc màn hình không biết nó bấm được.
 *
 * 3. NÚT XOÁ MÀU `text-gray-300` — gần như vô hình trên nền trắng, dưới xa
 *    ngưỡng tương phản 3:1 cho thành phần giao diện.
 *
 * 4. MỐC THỜI GIAN CỠ 10px.
 *
 * 5. NÚT "Đánh dấu đã đọc" luôn bấm được kể cả khi không còn cái nào chưa đọc.
 */
export default function NotificationsPage() {
  const { allowed } = useRequireAuth();
  const { confirm, toast } = useToast();
  const t = useTranslations('notifications');
  const tc = useTranslations('common');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const fetchNotis = useCallback(async () => {
    setState('loading');
    try {
      const res = await notificationService.getAll(1, 50);
      setNotifications(res.data?.data?.result || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (allowed) fetchNotis();
  }, [allowed, fetchNotis]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: number) => {
    // Cập nhật lạc quan rồi trả lại nếu server từ chối, thay vì nuốt lỗi.
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await notificationService.markAsRead(id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
      toast(t('markFailed'), 'error');
    }
  };

  const markAllRead = async () => {
    const before = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      setNotifications(before);
      toast(t('markFailed'), 'error');
    }
  };

  const remove = async (id: number) => {
    if (!(await confirm(t('deleteAsk')))) return;
    try {
      await notificationService.remove(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast(t('deleted'), 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || t('deleteFailed'), 'error');
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return t('justNow');
    if (diff < 3_600_000) return t('minutesAgo', { count: Math.floor(diff / 60_000) });
    if (diff < 86_400_000) return t('hoursAgo', { count: Math.floor(diff / 3_600_000) });
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[820px] px-3 py-4">
        <div className="rounded-card bg-surface-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-6 py-5">
            <div>
              <h1 className="text-h2 text-ink">{t('title')}</h1>
              {unread > 0 && (
                <p className="mt-1 text-small tabular-nums text-ink-muted">
                  {t('unread', { count: unread })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="inline-flex items-center gap-2 rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:border-ink/12 disabled:text-ink-faint"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              {t('markAll')}
            </button>
          </div>

          {state === 'loading' ? (
            <p className="px-6 py-16 text-center text-body text-ink-muted">{tc('loading')}</p>
          ) : state === 'error' ? (
            <div className="px-6 py-16 text-center">
              <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
              <p className="mx-auto mt-2 max-w-[42ch] text-small text-ink-muted">
                {t('loadFailedHint')}
              </p>
              <button
                type="button"
                onClick={fetchNotis}
                className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {tc('retry')}
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState title={t('empty')} hint={t('emptyHint')} />
          ) : (
            <ul className="divide-y divide-ink/10">
              {notifications.map((n: any) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 px-6 py-4 ${
                      n.is_read ? '' : 'border-l-2 border-brand bg-brand-tint'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        n.is_read ? 'bg-surface-sunken text-ink-muted' : 'bg-surface-card text-brand'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2
                          className={`text-small ${n.is_read ? 'text-ink' : 'font-semibold text-ink'}`}
                        >
                          {n.title}
                        </h2>
                        {n.created_at && (
                          <time
                            dateTime={n.created_at}
                            className="shrink-0 text-caption tabular-nums text-ink-faint"
                          >
                            {formatTime(n.created_at)}
                          </time>
                        )}
                      </div>
                      <p className="clamp-2 mt-1 text-small text-ink-muted">{n.content}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {n.data?.order_id && (
                          <Link
                            href={`/profile/orders/${n.data.order_id}`}
                            className="text-small font-semibold text-brand hover:underline"
                          >
                            {t('viewOrder')}
                          </Link>
                        )}
                        {n.data?.conversation_id && (
                          <Link href="/chat" className="text-small font-semibold text-brand hover:underline">
                            {t('openChat')}
                          </Link>
                        )}
                        {/* Nút thật, không phải div bấm được: tab tới được và
                            trình đọc màn hình biết nó làm gì. */}
                        {!n.is_read && (
                          <button
                            type="button"
                            onClick={() => markRead(n.id)}
                            className="text-small text-ink-muted transition-colors hover:text-ink"
                          >
                            {t('markRead')}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(n.id)}
                      aria-label={`${t('delete')} — ${n.title}`}
                      className="shrink-0 rounded-control p-2 text-ink-muted transition-colors hover:bg-price-bg hover:text-price"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
