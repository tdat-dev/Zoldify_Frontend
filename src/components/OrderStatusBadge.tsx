"use client";

import { useTranslations } from 'next-intl';
import { isOrderStatus, orderStatusTone, TONE_CLASS } from '@/lib/order-status';

/**
 * Nhãn trạng thái đơn hàng.
 *
 * Trạng thái lạ (backend thêm giá trị mới mà frontend chưa biết) thì hiện
 * NGUYÊN VĂN giá trị đó với sắc thái trung tính, không nuốt và không đoán bừa
 * sang một nhãn gần đúng. Người dùng thấy chữ lạ còn hơn thấy nhãn sai.
 */
export function OrderStatusBadge({ status }: { status: unknown }) {
  const t = useTranslations('orderStatus');
  const raw = String(status ?? '');
  const label = isOrderStatus(raw) ? t(raw) : raw || '—';

  return (
    <span
      className={`inline-block rounded-control px-2 py-0.5 text-caption font-semibold ${
        TONE_CLASS[orderStatusTone(raw)]
      }`}
    >
      {label}
    </span>
  );
}
