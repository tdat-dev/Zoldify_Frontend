"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Package } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/order-status';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { EmptyState } from '@/components/EmptyState';

/**
 * Đơn mua của người dùng.
 *
 * Bốn thứ của bản trước đã gỡ:
 *
 * 1. BỘ TRẠNG THÁI SAI (xem lib/order-status.ts). Hai tab vĩnh viễn rỗng, hai
 *    trạng thái thật hiện ra bằng tiếng Anh.
 *
 * 2. NÚT "THANH TOÁN NGAY" GIẢ. Nó hỏi "Xác nhận thanh toán X qua Ví Zoldify?"
 *    rồi gọi updateStatus(id, {status:'pending'}) — chỉ đổi một chữ trong cột
 *    status, KHÔNG có đồng nào chuyển đi — xong báo "Thanh toán thành công!".
 *    Nút này chỉ hiện khi status === 'pending_payment', một trạng thái backend
 *    không có, nên thực tế chưa bao giờ vẽ ra. Gỡ hẳn: khi nào có luồng thanh
 *    toán lại thật thì nối vào PayOS như trang /checkout, không phải đổi chữ.
 *
 * 3. LỖI API HIỆN THÀNH "CHƯA CÓ ĐƠN NÀO". catch chỉ console.error rồi để mảng
 *    rỗng.
 *
 * 4. THANH TAB TÀI KHOẢN CHÉP TAY, nay ở AccountShell.
 */
export default function UserOrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast, confirm } = useToast();
  const t = useTranslations('orders');
  const tc = useTranslations('common');

  const [status, setStatus] = useState<string>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const fetchOrders = useCallback(async () => {
    setState('loading');
    try {
      const res = await orderService.getAll(1, 20, status === 'all' ? undefined : status);
      setOrders(res.data?.data?.result || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [status]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router, fetchOrders]);

  const handleCancel = async (id: number) => {
    if (!(await confirm(t('cancelAsk')))) return;
    try {
      await orderService.cancel(id);
      fetchOrders();
    } catch (err: any) {
      toast(err.response?.data?.message || t('cancelFailed'), 'error');
    }
  };

  const tabs = ['all', ...ORDER_STATUSES];

  // Hàng tab dùng nhãn NGẮN, huy hiệu trên từng đơn dùng nhãn đầy đủ. Bản đầu
  // dùng chung một bộ: "Chờ người bán xác nhận" và "Người bán đã nhận đơn" đẩy
  // hàng tab vượt quá 1440px và cắt cụt tab cuối, mà tab tràn ra ngoài thì
  // người dùng không biết là có nó. Trên huy hiệu thì vẫn cần nói rõ AI đang
  // phải làm gì — "Chờ xác nhận" một mình không cho biết là chờ người bán.
  const tShort = useTranslations('orderStatusShort');

  return (
    <div className="rounded-card bg-surface-card">
      <div className="border-b border-ink/10 px-6 py-5">
        <h1 className="text-h2 text-ink">{t('title')}</h1>
      </div>

      {/* Danh sách tab cuộn ngang, không xuống dòng: bảy trạng thái mà wrap thì
          chiều cao đầu trang nhảy loạn giữa các cỡ màn hình. */}
      <div
        role="tablist"
        aria-label={t('filterLabel')}
        className="flex gap-1 overflow-x-auto border-b border-ink/10 px-4"
      >
        {tabs.map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={active}
              onClick={() => setStatus(s)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3.5 py-3 text-small transition-colors ${
                active
                  ? 'border-brand font-semibold text-brand'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {s === 'all' ? t('tabAll') : tShort(s)}
            </button>
          );
        })}
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
            onClick={fetchOrders}
            className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {tc('retry')}
          </button>
        </div>
      ) : orders.length === 0 ? (
        status === 'all' ? (
          <EmptyState
            title={t('emptyAll')}
            hint={t('emptyAllHint')}
            action={
              <Link
                href="/search"
                className="inline-block rounded-control bg-brand px-6 py-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {t('browse')}
              </Link>
            }
          />
        ) : (
          <EmptyState
            title={t('emptyFiltered')}
            hint={t('emptyFilteredHint')}
            action={
              <button
                type="button"
                onClick={() => setStatus('all')}
                className="rounded-control bg-brand px-6 py-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {t('showAll')}
              </button>
            }
          />
        )
      ) : (
        <ul className="divide-y divide-ink/10">
          {orders.map((order: any) => {
            const items: any[] = order.items || [];
            const extra = Math.max(0, items.length - 2);
            return (
              <li key={order.id} className="px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <Link
                      href={`/profile/orders/${order.id}`}
                      className="text-small font-semibold text-ink hover:text-brand"
                    >
                      {t('orderCode', { id: order.id })}
                    </Link>
                    {order.created_at && (
                      <time
                        dateTime={order.created_at}
                        className="text-small tabular-nums text-ink-faint"
                      >
                        {new Date(order.created_at).toLocaleDateString()}
                      </time>
                    )}
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <span className="text-body font-bold tabular-nums text-price">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>

                <ul className="mt-4 flex flex-col gap-3">
                  {items.slice(0, 2).map((item: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-sunken">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-ink-faint" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small text-ink">
                          {item.product_name}
                        </span>
                        <span className="block text-caption tabular-nums text-ink-muted">
                          {t('quantity', { count: item.quantity })}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                {extra > 0 && (
                  <p className="mt-2 text-small text-ink-muted">{t('moreItems', { count: extra })}</p>
                )}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {/* Huỷ được khi người bán chưa bắt tay vào chuẩn bị hàng.
                      Từ `processing` trở đi thì huỷ phải qua người bán. */}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order.id)}
                      className="rounded-control border border-price/40 px-4 py-2 text-small font-semibold text-price transition-colors hover:bg-price-bg"
                    >
                      {t('cancel')}
                    </button>
                  )}
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
                  >
                    {t('detail')}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
