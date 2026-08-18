import http from '@/lib/http';
import type { ApiResponse, CreateOrderDto, Order, Paginated } from '@/api';

/** Backend tra ve 4 con so nay o /orders/stats */
export interface OrderStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
}

/** Phí ship theo từng người bán cho một địa chỉ nhận (GHN). */
export interface ShippingQuoteItem {
  seller_id: number;
  seller_name: string;
  fee: number;
  has_pickup: boolean;
  error?: string;
}
export interface ShippingQuote {
  total: number;
  items: ShippingQuoteItem[];
}

export const orderService = {
  create(data: CreateOrderDto) {
    return http.post<ApiResponse<Order>>('/orders', data);
  },
  shippingQuote(data: {
    to_district_id: number;
    to_ward_code: string;
    cart_item_ids?: number[];
  }) {
    return http.post<ApiResponse<ShippingQuote>>('/orders/shipping-quote', data);
  },
  getAll(currentPage = 1, limit = 10, status?: string) {
    return http.get<ApiResponse<Paginated<Order>>>('/orders', {
      params: { currentPage, limit, status },
    });
  },
  getOne(id: number) {
    return http.get<ApiResponse<Order>>(`/orders/${id}`);
  },
  updateStatus(id: number, data: { status: string }) {
    return http.patch<ApiResponse<Order>>(`/orders/${id}/status`, data);
  },
  /** Người mua xác nhận đã nhận hàng của MỘT người bán trong đơn (giải ngân). */
  confirmReceived(id: number, sellerId: number) {
    return http.patch<ApiResponse<unknown>>(
      `/orders/${id}/shipments/${sellerId}/received`,
    );
  },
  cancel(id: number) {
    return http.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
  },
  remove(id: number) {
    return http.delete<ApiResponse<unknown>>(`/orders/${id}`);
  },
  getStats() {
    return http.get<ApiResponse<OrderStats>>('/orders/stats');
  },
};
