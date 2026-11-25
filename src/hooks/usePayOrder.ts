"use client";

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { payosService } from '@/services/payos.service';
import { paymentService } from '@/services/payment.service';
import type { PayosModalData } from '@/components/PayosQrModal';

interface PayableOrder {
  id: number;
  status?: string;
  is_paid?: boolean;
  payment_method?: string;
}

/**
 * Đơn còn trả lại được: đang chờ, chưa trả, và trả bằng PayOS hoặc ví.
 *
 * Đơn COD không có gì để "trả ngay". Đơn đã `confirmed` trở đi là đã trả rồi
 * (cả hai đường PayOS và ví đều đẩy đơn sang confirmed khi tiền vào).
 */
export function canPayOrder(order: PayableOrder | null | undefined): boolean {
  return (
    !!order &&
    order.status === 'pending' &&
    !order.is_paid &&
    (order.payment_method === 'payos' || order.payment_method === 'wallet')
  );
}

/**
 * "Thanh toán ngay" cho một đơn đã tạo mà chưa trả.
 *
 * Vì sao cần: đơn được tạo TRƯỚC khi trả tiền và giỏ bị xoá ngay lúc đó. Link
 * PayOS hỏng, người mua huỷ ở trang PayOS, hay ví thiếu tiền lúc đặt thì đơn
 * vẫn nằm đó, mà trước đây không có nút nào để trả tiếp: nút "Thử thanh toán
 * lại" dẫn về /checkout?ids=<mã đơn>, trong khi `ids` là mã DÒNG GIỎ HÀNG.
 *
 * Khoá bằng ref chứ không chỉ bằng state: hai cú bấm liền nhau lọt qua trước
 * khi React kịp vẽ lại nút ở trạng thái disabled.
 */
export function usePayOrder(onSettled?: () => void) {
  const t = useTranslations('orders');
  const { toast } = useToast();
  const busyRef = useRef(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payosModal, setPayosModal] = useState<PayosModalData | null>(null);

  const pay = useCallback(
    async (order: PayableOrder) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setPayingId(order.id);
      let leaving = false;
      try {
        if (order.payment_method === 'wallet') {
          await paymentService.create({ order_id: order.id, payment_method: 'wallet' });
          toast(t('payWalletDone'), 'success');
        } else {
          const res = await payosService.createLink({ type: 'order', order_id: order.id });
          const d = res.data?.data;
          if (!d?.qrCode && !d?.checkoutUrl) throw new Error('no checkoutUrl');
          if (d.qrCode) {
            setPayosModal({
              type: 'order',
              orderId: order.id,
              orderCode: d.orderCode,
              amount: d.amount,
              qrCode: d.qrCode,
              checkoutUrl: d.checkoutUrl,
              expiresAt: d.expiresAt,
              bin: d.bin,
              accountNumber: d.accountNumber,
              accountName: d.accountName,
              description: d.description,
              isMock: d.isMock,
            });
          } else {
            leaving = true;
            window.location.href = d.checkoutUrl;
          }
        }
      } catch (err: any) {
        // Câu của backend cụ thể hơn ("Số dư ví không đủ", "Đơn hàng đã được
        // thanh toán") nên ưu tiên nó.
        const m = err?.response?.data?.message;
        toast((Array.isArray(m) ? m[0] : m) || t('payFailed'), 'error');
      } finally {
        // Đang rời trang sang PayOS thì giữ nút khoá, kẻo bấm thêm lần nữa.
        if (!leaving) {
          busyRef.current = false;
          setPayingId(null);
          // Nạp lại cả khi lỗi: 409 nghĩa là đơn đã đổi trạng thái ở nơi khác.
          onSettled?.();
        }
      }
    },
    [t, toast, onSettled],
  );

  const closePayosModal = useCallback(() => {
    setPayosModal(null);
    onSettled?.();
  }, [onSettled]);

  return { pay, payingId, payosModal, closePayosModal };
}
