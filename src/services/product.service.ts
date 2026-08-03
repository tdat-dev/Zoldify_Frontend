import http from '@/lib/http';

export const productService = {
  getAll(currentPage = 1, limit = 10, params?: { q?: string; category_id?: number; seller_id?: number; price_min?: number; price_max?: number; sort?: string }) {
    return http.get('/products', { params: { current: currentPage, pageSize: limit, ...params } });
  },
  getBySeller(sellerId: number, currentPage = 1, limit = 20) {
    return http.get('/products', { params: { seller_id: sellerId, current: currentPage, pageSize: limit } });
  },
  getOne(id: number) {
    return http.get(`/products/${id}`);
  },
  create(data: any) {
    return http.post('/products', data);
  },
  update(id: number, data: any) {
    return http.patch(`/products/${id}`, data);
  },
  updateStock(id: number, stock: number) {
    return http.patch(`/products/${id}/stock`, { stock });
  },
  remove(id: number) {
    return http.delete(`/products/${id}`);
  },
};
