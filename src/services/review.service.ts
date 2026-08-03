import http from '@/lib/http';

export const reviewService = {
  create(data: any) {
    return http.post('/interactions', data);
  },
  getByProduct(productId: number, currentPage = 1, limit = 10) {
    return http.get(`/interactions/product/${productId}`, { params: { currentPage, limit } });
  },
  getAll(currentPage = 1, limit = 10) {
    return http.get('/interactions', { params: { currentPage, limit } });
  },
  update(id: number, data: any) {
    return http.patch(`/interactions/${id}`, data);
  },
  remove(id: number) {
    return http.delete(`/interactions/${id}`);
  },
};
