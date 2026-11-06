'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RotateCw, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';

interface Shipment {
  id: number;
  status: string;
  tracking_code?: string | null;
  error?: string | null;
  seller?: { id: number; full_name?: string };
}

interface OrderShipments {
  status: string;
  ghn_district_id?: number | null;
  shipments?: Shipment[];
}

const MA_CHOT = /\([0-9a-f]{8}-[0-9a-f-]{27}\)$/i;

/** Đơn đã chuyển bước mà GHN chưa nhận vận đơn: người bán cần được báo ngay. */
export function thieuVanDon(order?: OrderShipments | null): boolean {
  if (!order?.ghn_district_id) return false;
  const lo = order.shipments ?? [];
  return lo.length === 0 || lo.some((s) => s.status === 'failed');
}

/**
 * Vận đơn GHN của một đơn, trong Chi tiết đơn của người bán.
 *
 * Tự tải riêng vì danh sách đơn bán không trả `shipments`: thêm vào đó là thêm
 * một JOIN cho mọi dòng, ở cỡ triệu đơn, chỉ để phục vụ một đơn đang mở.
 *
 * Nút tạo lại chỉ hiện ở hai trường hợp người bán thật sự kẹt: có lô GHN từ
 * chối, hoặc đơn đã qua bước chuẩn bị mà chưa có lô nào (đơn trả trước đi qua
 * bước đó trước bản vá 06/11). Đơn `confirmed` chưa có lô thì chưa phải lỗi:
 * vận đơn sẽ được tạo lúc bấm chuyển bước, tạo sớm là để lại vận đơn thật cho
 * đơn còn huỷ được.
 */
export function ShipmentPanel({
  orderId,
  onChanged,
}: {
  orderId: number;
  onChanged?: () => void;
}) {
  const t = useTranslations('shop');
  const tStatus = useTranslations('orderStatus');
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderShipments | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const load = useCallback(async (): Promise<OrderShipments | null> => {
    const res = await http.get(`/orders/${orderId}`);
    const fresh: OrderShipments | null = res.data?.data || res.data || null;
    setOrder(fresh);
    return fresh;
  }, [orderId]);

  useEffect(() => {
    let daRoi = false;
    setLoading(true);
    setLoadFailed(false);
    load()
      .catch(() => {
        if (!daRoi) setLoadFailed(true);
      })
      .finally(() => {
        if (!daRoi) setLoading(false);
      });
    return () => {
      daRoi = true;
    };
  }, [load]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await http.post(`/orders/${orderId}/shipments/retry`);
      const fresh = await load();
      if (thieuVanDon(fresh)) toast(t('shipmentRetryStill'), 'error');
      else toast(t('shipmentRetryDone'), 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('shipmentRetryFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
      // 409 nghĩa là đơn vừa đổi ở nơi khác: nạp lại để nút không nói sai.
      await load().catch(() => undefined);
    } finally {
      setRetrying(false);
      onChanged?.();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-small text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t('shipmentLoading')}
      </div>
    );
  }
  if (loadFailed) {
    return <p className="text-small text-price">{t('shipmentLoadFailed')}</p>;
  }
  if (!order?.ghn_district_id) return null;

  const lo = order.shipments ?? [];
  const dangMo = order.status === 'confirmed' || order.status === 'processing';
  if (lo.length === 0 && !dangMo) return null;

  const coLoHong = lo.some((s) => s.status === 'failed');
  const canRetry =
    dangMo && (coLoHong || (lo.length === 0 && order.status === 'processing'));

  return (
    <section className="rounded-control border border-ink/10 p-4" aria-labelledby={`van-don-${orderId}`}>
      <h3
        id={`van-don-${orderId}`}
        className="mb-3 flex items-center gap-2 text-small font-semibold text-ink"
      >
        <Truck className="h-4 w-4" aria-hidden="true" /> {t('shipmentsHeading')}
      </h3>

      {lo.length === 0 ? (
        <p className="text-small text-ink-muted">
          {order.status === 'confirmed'
            ? t('shipmentNotYet', { status: tStatus('processing') })
            : t('shipmentMissing')}
        </p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {lo.map((s) => {
            const hong = s.status === 'failed';
            // Lúc đang tạo lại, `error` tạm giữ mã chốt nội bộ (đuôi là một UUID),
            // không phải lời GHN, nên không đưa cho người bán đọc.
            const loiGhn = hong && s.error && !MA_CHOT.test(s.error) ? s.error : null;
            return (
              <li key={s.id} className="py-2 first:pt-0 last:pb-0">
                <p className={`text-small font-medium ${hong ? 'text-price' : 'text-ink'}`}>
                  {t(`shipState_${s.status}` as never)}
                </p>
                {s.tracking_code && (
                  <p className="text-caption tabular-nums text-ink-muted">
                    {t('shipmentCode')}: {s.tracking_code}
                  </p>
                )}
                {loiGhn && <p className="text-caption text-ink-muted">{loiGhn}</p>}
              </li>
            );
          })}
        </ul>
      )}

      {canRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={retrying}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-control bg-brand px-4 py-2 text-small font-medium text-white transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        >
          {retrying ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          )}
          {t('shipmentRetry')}
        </button>
      )}
    </section>
  );
}
