import http from '@/lib/http';

export const orderService = {
  create(data: any) {
    return http.post('/orders', data);
  },
  getAll(currentPage = 1, limit = 10, status?: string) {
    return http.get('/orders', { params: { currentPage, limit, status } });
  },
  getOne(id: number) {
    return http.get(`/orders/${id}`);
  },
  updateStatus(id: number, data: any) {
    return http.patch(`/orders/${id}/status`, data);
  },
  cancel(id: number) {
    return http.patch(`/orders/${id}/cancel`);
  },
  remove(id: number) {
    return http.delete(`/orders/${id}`);
  },
  getStats() {
    return http.get('/orders/stats');
  },
};
