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
  /**
   * Lịch sử ví đọc từ sổ cái: nạp, trả đơn, tiền bán hàng về, hoàn tiền, rút.
   * `getAll` ở trên là danh sách payments (chỉ nạp và trả đơn), nên người bán
   * nhận tiền xong vẫn thấy "Chưa có giao dịch nào".
   */
  getWalletHistory(page = 1, limit = 20) {
    return http.get('/wallets/transactions', { params: { page, limit } });
  },
  getBalance() {
    return http.get('/payments/wallet/balance');
  },
};
