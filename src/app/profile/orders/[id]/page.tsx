"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, Package, Check, Truck } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { formatPrice } from '@/lib/format';
import { ORDER_FLOW, flowIndex } from '@/lib/order-status';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';

/**
 * Chi tiết một đơn mua.
 *
 * Bốn thứ của bản trước đã gỡ:
 *
 * 1. BẢN ĐỒ TRẠNG THÁI SAI, chép tay lần thứ hai (xem lib/order-status.ts).
 *
 * 2. TIẾN TRÌNH ĐƠN NGƯỢC LOGIC. Mốc "Đã xác nhận" được tô sáng khi
 *    `order.status === 'pending'` — tức là báo đơn đã xác nhận đúng vào lúc nó
 *    CHƯA được xác nhận. Và tiến trình chỉ có hai mốc, bỏ qua hoàn toàn
 *    processing / shipping / delivered, nên một đơn đã giao xong vẫn hiện như
 *    đang đứng ở "Đã xác nhận".
 *
 * 3. LỖI API BỊ NUỐT: catch chỉ console.error rồi để order = null, và trang
 *    hiện "Không tìm thấy đơn hàng" — đổ lỗi cho dữ liệu trong khi thật ra là
 *    mạng chết.
 *
 * 4. GIÁ NHÂN TAY `toLocaleString('vi-VN')}đ`, không qua formatPrice nên không
 *    đổi theo tiền tệ.
 */
export default function OrderDetailPage() {
  const { allowed } = useRequireAuth();
  const params = useParams();
  const t = useTranslations('orderDetail');
  const tc = useTranslations('common');

  const [order, setOrder] = useState<any>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'missing'>('loading');
  // sellerId đang được xác nhận (để khoá đúng nút đó), và cờ lỗi chung.
  const [confirming, setConfirming] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState(false);

  const id = Number(params.id);

  const fetchOrder = useCallback(async () => {
    setState('loading');
    try {
      const res = await orderService.getOne(id);
      const data = res.data?.data || res.data;
      if (!data) {
        setState('missing');
        return;
      }
      setOrder(data);
      setState('ready');
    } catch (err: any) {
      // 404 là "đơn không tồn tại", mọi mã khác là "không tải được". Hai chuyện
      // khác nhau và cần hai câu khác nhau.
      setState(err?.response?.status === 404 ? 'missing' : 'error');
    }
  }, [id]);

  useEffect(() => {
    if (allowed && Number.isFinite(id)) fetchOrder();
  }, [allowed, id, fetchOrder]);

  const handleConfirmReceived = useCallback(
    async (sellerId: number) => {
      setConfirming(sellerId);
      setConfirmError(false);
      try {
        await orderService.confirmReceived(id, sellerId);
        await fetchOrder();
      } catch {
        setConfirmError(true);
      } finally {
        setConfirming(null);
      }
    },
    [id, fetchOrder],
  );

  const card = 'rounded-card bg-surface-card';

  if (state === 'loading') {
    return <div className={`${card} px-6 py-20 text-center text-body text-ink-muted`}>…</div>;
  }

  if (state !== 'ready' || !order) {
    return (
      <div className={`${card} px-6 py-20 text-center`}>
        <p className="text-body font-semibold text-ink">
          {state === 'missing' ? t('notFound') : t('loadFailed')}
        </p>
        <p className="mx-auto mt-2 max-w-[40ch] text-small text-ink-muted">
          {state === 'missing' ? t('notFoundHint') : ''}
        </p>
        <Link
          href="/profile/orders"
          className="mt-6 inline-block rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t('backToOrders')}
        </Link>
      </div>
    );
  }

  const items: any[] = order.items || [];
  // Tiền tệ CỦA ĐƠN, không phải của sản phẩm hiện tại: đơn đã chụp lại lúc đặt
  // nên người bán sửa tin sau này cũng không đổi được hoá đơn cũ.
  const cur = order.currency;
  const shippingFee = Number(order.shipping_fee || 0);
  const total = Number(order.total_amount || 0);
  const subTotal = total - shippingFee;
  const current = flowIndex(order.status);
  const offFlow = current === -1;

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label={tc('breadcrumb')} className="flex items-center gap-1 text-small text-ink-muted">
        <Link href="/profile/orders" className="hover:text-brand">
          {t('breadcrumbOrders')}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
        <span className="text-ink" aria-current="page">
          {t('title', { id: order.id })}
        </span>
      </nav>

      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink/10 px-6 py-5">
          <div>
            <h1 className="text-h2 text-ink">{t('title', { id: order.id })}</h1>
            {order.created_at && (
              <p className="mt-1 text-small text-ink-muted">
                {t('placedAt', { when: new Date(order.created_at).toLocaleString() })}
              </p>
            )}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* --- Tiến trình --- */}
        <div className="border-b border-ink/10 px-6 py-6">
          <h2 className="mb-4 text-small font-semibold text-ink">{t('progress')}</h2>
          {offFlow ? (
            <p className="text-small text-ink-muted">{t('offFlow')}</p>
          ) : (
            <ol className="flex flex-col gap-0 sm:flex-row">
              {ORDER_FLOW.map((step, i) => {
                const done = i <= current;
                return (
                  <li key={step} className="flex flex-1 items-start gap-3 sm:flex-col sm:gap-2">
                    {/* Thanh nối nằm cùng hàng với chấm để hai thứ luôn thẳng
                        nhau, không dựa vào absolute + offset âm như bản cũ. */}
                    <div className="flex flex-col items-center sm:w-full sm:flex-row">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-bold ${
                          done ? 'bg-brand text-white' : 'bg-surface-sunken text-ink-faint'
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                      </span>
                      {i < ORDER_FLOW.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={`w-0.5 flex-1 sm:h-0.5 sm:w-full ${
                            i < current ? 'bg-brand' : 'bg-ink/12'
                          }`}
                          style={{ minHeight: '1.25rem' }}
                        />
                      )}
                    </div>
                    <span
                      className={`pb-5 text-small sm:pb-0 sm:pr-3 ${
                        done ? 'font-semibold text-ink' : 'text-ink-faint'
                      }`}
                    >
                      <StepLabel step={step} />
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* --- Món --- */}
        <div className="px-6 py-5">
          <h2 className="mb-4 text-small font-semibold text-ink">{t('itemsTitle')}</h2>
          <ul className="flex flex-col gap-4">
            {items.map((item: any, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-sunken">
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
                  <span className="block text-small text-ink">{item.product_name}</span>
                  <span className="block text-caption tabular-nums text-ink-muted">
                    {formatPrice(item.price_at_purchase, cur)} × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-small font-semibold tabular-nums text-ink">
                  {formatPrice(Number(item.price_at_purchase || 0) * Number(item.quantity || 0), cur)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {Array.isArray(order.shipments) && order.shipments.length > 0 && (
        <div className={`${card} px-6 py-5`}>
          <h2 className="mb-4 text-small font-semibold text-ink">{t('shipmentsTitle')}</h2>
          <ul className="flex flex-col gap-3">
            {order.shipments.map((sh: any) => {
              const st = String(sh.status);
              const canConfirm = st === 'created' || st === 'delivered';
              const isReceived = st === 'received';
              const isFailed = st === 'failed';
              return (
                <li
                  key={sh.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-ink/10 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-small font-semibold text-ink">
                      <Truck className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                      <span className="truncate">{sh.seller?.full_name || '—'}</span>
                    </div>
                    {sh.tracking_code && (
                      <p className="mt-0.5 text-caption tabular-nums text-ink-muted">
                        {t('trackingLabel')}: {sh.tracking_code}
                      </p>
                    )}
                    <p
                      className={`mt-0.5 text-caption ${
                        isReceived
                          ? 'text-state-success-fg'
                          : isFailed
                            ? 'text-price'
                            : 'text-ink-muted'
                      }`}
                    >
                      {t(`shipStatus_${st}` as never)}
                      {isReceived && sh.auto_received ? ` · ${t('autoReceivedNote')}` : ''}
                    </p>
                  </div>
                  {canConfirm ? (
                    <button
                      type="button"
                      onClick={() => handleConfirmReceived(sh.seller?.id)}
                      disabled={confirming === sh.seller?.id}
                      className="shrink-0 rounded-control bg-brand px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
                    >
                      {confirming === sh.seller?.id ? t('confirming') : t('confirmReceived')}
                    </button>
                  ) : isReceived ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-small font-semibold text-state-success-fg">
                      <Check className="h-4 w-4" aria-hidden="true" /> {t('shipStatus_received')}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-caption text-ink-muted">{t('confirmReceivedHint')}</p>
          {confirmError && (
            <p className="mt-2 text-caption text-price">{t('confirmFailed')}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className={`${card} p-6`}>
          <h2 className="mb-3 text-small font-semibold text-ink">{t('shipTo')}</h2>
          <p className="text-small leading-relaxed text-ink-muted">
            <span className="block font-semibold text-ink">{order.receiver_name || '—'}</span>
            <span className="block tabular-nums">{order.receiver_phone || '—'}</span>
            <span className="mt-1 block">{order.shipping_address || '—'}</span>
          </p>
        </section>

        <section className={`${card} p-6`}>
          <h2 className="mb-3 text-small font-semibold text-ink">{t('payment')}</h2>
          <dl className="flex flex-col gap-2 text-small">
            <div className="flex justify-between text-ink-muted">
              <dt>{t('subtotal')}</dt>
              <dd className="tabular-nums">{formatPrice(subTotal, cur)}</dd>
            </div>
            <div className="flex justify-between text-ink-muted">
              <dt>{t('shippingFee')}</dt>
              <dd className="tabular-nums">{formatPrice(shippingFee, cur)}</dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-ink/10 pt-3">
              <dt className="font-semibold text-ink">{t('total')}</dt>
              <dd className="text-body font-bold tabular-nums text-price">{formatPrice(total, cur)}</dd>
            </div>
            {order.payment_method && (
              <div className="mt-1 flex justify-between text-ink-muted">
                <dt>{t('method')}</dt>
                <dd className="uppercase">{order.payment_method}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}

/** Tách ra để dùng được useTranslations của namespace khác trong cùng cây. */
function StepLabel({ step }: { step: string }) {
  const tShort = useTranslations('orderStatusShort');
  return <>{tShort(step)}</>;
}
