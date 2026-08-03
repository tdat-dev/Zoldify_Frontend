import http from '@/lib/http';

export const paymentService = {
  create(data: any) {
    return http.post('/payments', data);
  },
  getAll(currentPage = 1, limit = 10, type?: string) {
    return http.get('/payments', { params: { currentPage, limit, type } });
  },
  getOne(id: number) {
    return http.get(`/payments/${id}`);
  },
  getBalance() {
    return http.get('/payments/wallet/balance');
  },
};
