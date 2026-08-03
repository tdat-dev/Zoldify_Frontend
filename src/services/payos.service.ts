import http from '@/lib/http';

export interface PayosCreateLinkRequest {
  type: 'order' | 'topup';
  order_id?: number;
  amount?: number;
}

export interface PayosCreateLinkResponse {
  checkoutUrl: string;
  qrCode: string;
  paymentLinkId: string;
  orderCode: number;
  amount: number;
  expiresAt?: number;
}

export interface PayosOrderStatus {
  orderId: number;
  is_paid: boolean;
  paid_at: string | null;
  status: string;
  paymentStatus?: string;
  payos_order_code?: string;
}

export const payosService = {
  // Tạo link thanh toán PayOS (cho đơn hàng hoặc nạp ví)
  createLink(data: PayosCreateLinkRequest) {
    return http.post<{ data: PayosCreateLinkResponse }>('/payos/create-link', data);
  },

  // Lấy trạng thái đơn hàng (dùng để polling sau khi PayOS redirect về)
  getOrderStatus(orderId: number) {
    return http.get<{ data: PayosOrderStatus }>(`/payos/order/${orderId}`);
  },

  // Lấy trạng thái payment link
  getPaymentStatus(payosOrderCode: string) {
    return http.get<{ data: any }>(`/payos/status/${payosOrderCode}`);
  },

  // Hủy payment link
  cancel(payosOrderCode: string) {
    return http.post('/payos/cancel', { payos_order_code: payosOrderCode });
  },

  refresh(orderId: number) {
  return http.get<{ data: any }>(`/payos/refresh/${orderId}`);
},
};
