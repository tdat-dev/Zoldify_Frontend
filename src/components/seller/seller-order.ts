import type { OrderStatus } from '@/lib/order-status';

export interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  price: number | string;
  quantity: number;
  subtotal: number | string;
  product?: { id: number; name: string; image?: string; seller_id?: number };
}

/**
 * Ten truong PHAI khop backend: API tra ve `order_code` va `discount_amount`,
 * khong phai `code` va `discount`. Frontend khai sai ten nen ca hai luon
 * undefined:
 *
 *  - Cot "Ma DH" o bang quan tri hien rong vinh vien.
 *  - O tim kiem cua trang don nguoi ban goi `orderCode(o).toLowerCase()` tren
 *    undefined -> nem TypeError ngay ky tu dau tien.
 *
 * Giu ca hai ten va doc theo thu tu uu tien, de neu backend doi lai thi khong vo.
 */
export interface Order {
  id: number;
  order_code?: string;
  code?: string;
  total_amount: number | string;
  shipping_fee: number | string;
  discount_amount?: number | string;
  discount?: number | string;
  final_amount: number | string;
  status: OrderStatus;
  payment_method: string;
  tracking_code?: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  province?: string;
  district?: string;
  note?: string;
  created_at: string;
  user?: { id: number; full_name: string; email: string; phone_number?: string };
  items: OrderItem[];
}

/** Ma don hien cho nguoi doc. Khong co ma thi dung so thu tu, khong de trong. */
export function orderCode(o: Order): string {
  return o.order_code || o.code || `#${o.id}`;
}

export function orderDiscount(o: Order): number {
  return Number(o.discount_amount ?? o.discount ?? 0);
}

/** Ngày giờ đặt đơn hiện cho người bán. */
export function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return d;
  }
}
