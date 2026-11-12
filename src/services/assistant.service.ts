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
}

export interface AssistantReply {
  reply: string;
  products: AssistantProduct[];
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
    return res.data.data as AssistantReply;
  },
};
