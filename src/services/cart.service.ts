import http from '@/lib/http';

export const cartService = {
  getAll(currentPage = 1, limit = 10) {
    return http.get('/cart', { params: { currentPage, limit } });
  },
  add(product_id: number, quantity = 1) {
    return http.post('/cart', { product_id, quantity });
  },
  update(id: number, quantity: number) {
    return http.patch(`/cart/${id}`, { quantity });
  },
  remove(id: number) {
    return http.delete(`/cart/${id}`);
  },
};
