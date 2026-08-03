import http from '@/lib/http';

export const chatService = {
  createConversation(seller_id: number, product_id: number) {
    return http.post('/chat/conversations', { seller_id, product_id });
  },
  getConversations() {
    return http.get('/chat/conversations');
  },
  getMessages(conversationId: number, currentPage = 1, limit = 20) {
    return http.get(`/chat/conversations/${conversationId}/messages`, { params: { currentPage, limit } });
  },
  sendMessage(conversationId: number, content: string, images?: string[]) {
    return http.post(`/chat/conversations/${conversationId}/messages`, { content, images });
  },
  markAsRead(conversationId: number) {
    return http.patch(`/chat/conversations/${conversationId}/read`);
  },
  getUnreadCount() {
    return http.get('/chat/unread-count');
  },
};
