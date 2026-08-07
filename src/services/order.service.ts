import http from '@/lib/http';
import type { ApiResponse, CreateOrderDto, Order, Paginated } from '@/api';

/** Backend tra ve 4 con so nay o /orders/stats */
export interface OrderStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
}

export const orderService = {
  create(data: CreateOrderDto) {
    return http.post<ApiResponse<Order>>('/orders', data);
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
