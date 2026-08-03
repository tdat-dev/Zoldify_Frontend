import http from '@/lib/http';

export const notificationService = {
  getAll(currentPage = 1, limit = 10) {
    return http.get('/notifications', { params: { currentPage, limit } });
  },
  getUnreadCount() {
    return http.get('/notifications/unread-count');
  },
  markAsRead(id: number) {
    return http.patch(`/notifications/${id}/read`);
  },
  markAllAsRead() {
    return http.patch('/notifications/read-all');
  },
  remove(id: number) {
    return http.delete(`/notifications/${id}`);
  },
};
