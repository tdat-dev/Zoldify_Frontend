"use client";

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { orderService } from '@/services/order.service';

type Method = 'cod' | 'wallet' | 'payos';
const METHODS: Method[] = ['cod', 'wallet', 'payos'];
const LABEL_KEY: Record<Method, 'cod' | 'wallet' | 'card'> = {
  cod: 'cod',
  wallet: 'wallet',
  payos: 'card',
};

interface ChangeableOrder {
  id: number;
  status?: string;
  is_paid?: boolean;
  payment_method?: string;
}

/** Đổi cách trả được khi đơn còn chờ xác nhận và chưa trả (backend cùng luật). */
export function canChangePaymentMethod(order: ChangeableOrder | null | undefined): boolean {
  return !!order && order.status === 'pending' && !order.is_paid;
}

/**
 * Nút "Đổi cách trả" kèm khung chọn lại phương thức cho một đơn chưa trả.
 *
 * Vì sao cần: đơn được tạo trước khi trả. Chọn PayOS mà không trả được hay chọn
 * ví mà thiếu tiền thì trước đây chỉ còn "Thanh toán ngay" theo đúng cách cũ;
 * muốn trả khi nhận hàng phải huỷ rồi đặt lại, trong khi giỏ đã bị xoá.
 *
 * Đổi sang ví hoặc thẻ thì gọi luôn `onPay` để người mua trả ngay, khỏi phải
 * bấm thêm một nút nữa. Đổi sang trả khi nhận hàng thì chỉ cần lưu.
 */
export function ChangePaymentMethod({
  order,
  onChanged,
  onPay,
  className = '',
}: {
  order: ChangeableOrder;
  onChanged: () => void;
  onPay: (order: ChangeableOrder) => void;
  className?: string;
}) {
  const t = useTranslations('orders');
  const tCheckout = useTranslations('checkout');
  const { toast } = useToast();
  const groupId = useId();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Method | null>(null);
  const [saving, setSaving] = useState(false);

  if (!canChangePaymentMethod(order)) return null;

  const current = order.payment_method as Method | undefined;

  const save = async () => {
    if (!choice || choice === current) return;
    setSaving(true);
    try {
      await orderService.changePaymentMethod(order.id, choice);
      setOpen(false);
      if (choice === 'cod') {
        toast(t('methodChangedCod'), 'success');
        onChanged();
      } else {
        onPay({ ...order, payment_method: choice });
      }
    } catch (err: any) {
      const m = err?.response?.data?.message;
      toast((Array.isArray(m) ? m[0] : m) || t('methodChangeFailed'), 'error');
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setChoice(null);
          setOpen(true);
        }}
        className={`rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken ${className}`}
      >
        {t('changeMethod')}
      </button>
    );
  }

  return (
    <fieldset className={`w-full rounded-control border border-ink/16 p-3 text-left ${className}`}>
      <legend className="px-1 text-small font-semibold text-ink">{t('changeMethodTitle')}</legend>
      <div className="mt-1 grid gap-1.5">
        {METHODS.map((m) => (
          <label key={m} className="flex items-center gap-2 text-small text-ink">
            <input
              type="radio"
              name={groupId}
              value={m}
              checked={(choice ?? current) === m}
              onChange={() => setChoice(m)}
            />
            {tCheckout(LABEL_KEY[m])}
            {m === current && <span className="text-caption text-ink-muted">{t('methodCurrent')}</span>}
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-control px-3 py-1.5 text-small text-ink-muted hover:text-ink"
        >
          {t('methodKeep')}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || !choice || choice === current}
          className="rounded-control bg-brand px-3 py-1.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? t('methodSaving') : choice === 'cod' ? t('methodSaveCod') : t('methodSavePay')}
        </button>
      </div>
    </fieldset>
  );
}
