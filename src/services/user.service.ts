import http from '@/lib/http';
import type { ApiResponse, Paginated, User } from '@/api';

export const userService = {
  getAll(currentPage = 1, limit = 10) {
    return http.get<ApiResponse<Paginated<User>>>('/users', {
      params: { currentPage, limit },
    });
  },
  getOne(id: number) {
    return http.get<ApiResponse<User>>(`/users/${id}`);
  },
  update(id: number, data: Partial<User>) {
    return http.patch<ApiResponse<User>>(`/users/${id}`, data);
  },
  remove(id: number) {
    return http.delete<ApiResponse<unknown>>(`/users/${id}`);
  },
};
