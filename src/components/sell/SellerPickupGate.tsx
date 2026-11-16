"use client";

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Loader2, Truck } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { shopService } from '@/services/shop.service';
import { hasPickupAddress } from '@/lib/shop-pickup';

/**
 * Cổng trước biểu mẫu đăng tin: người chưa khai địa chỉ lấy hàng thì thấy lời
 * nhắc kèm nút sang Cài đặt shop, KHÔNG thấy biểu mẫu.
 *
 * Lý do (user báo 16/11): backend chặn POST /products khi shop thiếu pickup
 * (assertSellerHasPickup), nhưng web cũ để người dùng chọn ảnh, điền hết các
 * trường rồi mới báo lỗi 400 ở cuối, mà không chỗ nào trên web dẫn tới Cài đặt
 * shop. Kiểm từ đầu thì người dùng không mất công điền.
 *
 * Đọc shop lỗi mạng hay lỗi lạ (không phải 404) thì vẫn cho vào biểu mẫu:
 * backend vẫn chặn ở bước lưu, cổng này chỉ để khỏi điền uổng.
 */
type GateState = 'checking' | 'ready' | 'missing';

export function SellerPickupGate({ children }: { children: ReactNode }) {
  const { allowed } = useRequireAuth();
  const t = useTranslations('sell');
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    shopService
      .getMyShop()
      .then((res) => {
        if (!cancelled) setState(hasPickupAddress(res.data?.data) ? 'ready' : 'missing');
      })
      .catch((err) => {
        if (!cancelled) setState(err?.response?.status === 404 ? 'missing' : 'ready');
      });
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  if (state === 'ready') return <>{children}</>;

  if (state === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface-page text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin" aria-label={t('pickupGateChecking')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page px-4 pb-20 pt-10 md:pb-10">
      <section className="mx-auto max-w-[560px] rounded-card bg-surface-card p-6 md:p-8">
        <Truck className="h-7 w-7 text-brand" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-bold text-ink">{t('pickupGateTitle')}</h1>
        <p className="mt-2 text-small text-ink-muted">{t('pickupGateBody')}</p>
        <Link
          href="/shop/settings?next=/product/create"
          className="mt-5 inline-flex items-center rounded-sm bg-brand px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
        >
          {t('pickupGateCta')}
        </Link>
      </section>
    </div>
  );
}
