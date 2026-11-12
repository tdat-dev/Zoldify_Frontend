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
  /** Câu nhận xét do AI viết (true) hay câu máy tính sẵn khi AI chậm (false). */
  ai_note?: boolean;
}

export interface AssistantReply {
  reply: string;
  products: AssistantProduct[];
  reviewed_by_ai?: boolean;
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
    // Gắn cờ vào từng món để thẻ (và lịch sử đã lưu) biết câu nào do AI viết.
    return { ...data, products: data.products.map((p) => ({ ...p, ai_note: Boolean(data.reviewed_by_ai) })) };
  },
};
