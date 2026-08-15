import http from '@/lib/http';

/**
 * Rút tiền.
 *
 * Gọi `/withdrawals/me` (tự thao tác trên tiền của mình).
 */
export const withdrawalService = {
  /** Người bán gửi lệnh rút. Tiền bị giữ ngay khi lệnh được ghi nhận. */
  create(data: {
    amount: number;
    bank_name: string;
    bank_account: string;
    bank_holder: string;
  }) {
    return http.post('/withdrawals', data);
  },

  /** Lịch sử rút của chính mình. */
  getMine(page = 1, limit = 20) {
    return http.get('/withdrawals/me', { params: { page, limit } });
  },

};
