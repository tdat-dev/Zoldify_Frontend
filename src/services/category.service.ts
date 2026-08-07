import http from '@/lib/http';
import type { ApiResponse, Category, CategoryListItem, Paginated } from '@/api';

export const categoryService = {
  getAll() {
    return http.get<ApiResponse<Paginated<CategoryListItem>>>('/categories', {
      params: { pageSize: 100 },
    });
  },
  getOne(id: number) {
    return http.get<ApiResponse<Category>>(`/categories/${id}`);
  },
  getBySlug(slug: string) {
    return http.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
  },
  create(data: Partial<Category>) {
    return http.post<ApiResponse<Category>>('/categories', data);
  },
  update(id: number, data: Partial<Category>) {
    return http.patch<ApiResponse<Category>>(`/categories/${id}`, data);
  },
  remove(id: number) {
    return http.delete<ApiResponse<unknown>>(`/categories/${id}`);
  },
};
