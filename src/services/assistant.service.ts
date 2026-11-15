import http from '@/lib/http';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantProduct {
  id: number;
  name: string;
  price: number;
  image: string | null;
  condition: string | null;
  province_name: string | null;
  /** Nhãn giá server tính: rẻ hơn, ngang hay cao hơn giá giữa các món cùng loại. */
  verdict?: 'good' | 'fair' | 'high' | null;
  /** Một câu nhận xét về món. */
  note?: string;
  market_price?: number | null;
  /** Món vượt ngân sách người dùng nêu, trợ lý đưa thêm để so. */
  over_budget?: boolean;
  /** Câu nhận xét do AI viết (true) hay câu máy tính sẵn (false). */
  ai_note?: boolean;
  /** Đang chờ câu nhận xét của AI cho món này. */
  ai_pending?: boolean;
}

export interface AssistantReply {
  reply: string;
  products: AssistantProduct[];
  /** Có mã này thì gọi review() để lấy câu nhận xét AI; null là không có gì để nhận xét. */
  review_id?: string | null;
}

export const assistantService = {
  /** Backend tắt trợ lý (prod) thì trả enabled false; lỗi mạng cũng coi như tắt. */
  async isEnabled(): Promise<boolean> {
    try {
      const res = await http.get('/assistant/status');
      return Boolean(res.data?.data?.enabled);
    } catch {
      return false;
    }
  },
  async ask(messages: AssistantMessage[]): Promise<AssistantReply> {
    const res = await http.post('/assistant/chat', { messages });
    const data = res.data.data as AssistantReply;
    return { ...data, products: data.products.map((p) => ({ ...p, ai_pending: Boolean(data.review_id) })) };
  },
  /**
   * Lượt hai: câu nhận xét AI theo id món. Lỗi thì trả rỗng, thẻ giữ câu máy
   * tính sẵn: nhận xét là phần thêm, không đáng báo lỗi cho người mua.
   */
  async review(reviewId: string): Promise<Record<number, string>> {
    try {
      const res = await http.post('/assistant/review', { review_id: reviewId });
      return (res.data?.data?.notes ?? {}) as Record<number, string>;
    } catch {
      return {};
    }
  },
};
