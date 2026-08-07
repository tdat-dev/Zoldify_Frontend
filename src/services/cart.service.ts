import http from '@/lib/http';
import type { ApiResponse, Cart, Paginated } from '@/api';

export const cartService = {
  getAll(currentPage = 1, limit = 10) {
    return http.get<ApiResponse<Paginated<Cart>>>('/cart', {
      params: { currentPage, limit },
    });
  },
  add(product_id: number, quantity = 1) {
    return http.post<ApiResponse<Cart>>('/cart', { product_id, quantity });
  },
  update(id: number, quantity: number) {
    return http.patch<ApiResponse<Cart>>(`/cart/${id}`, { quantity });
  },
  remove(id: number) {
    return http.delete<ApiResponse<unknown>>(`/cart/${id}`);
  },
};
