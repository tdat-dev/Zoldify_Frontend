import http from '@/lib/http';

export const userService = {
  getAll(currentPage = 1, limit = 10) {
    return http.get('/users', { params: { currentPage, limit } });
  },
  getOne(id: number) {
    return http.get(`/users/${id}`);
  },
  update(id: number, data: any) {
    return http.patch(`/users/${id}`, data);
  },
  remove(id: number) {
    return http.delete(`/users/${id}`);
  },
};
