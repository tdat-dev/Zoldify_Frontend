import http from '@/lib/http';

export const categoryService = {
  getAll() {
    return http.get('/categories', { params: { pageSize: 100 } });
  },
  getOne(id: number) {
    return http.get(`/categories/${id}`);
  },
  getBySlug(slug: string) {
    return http.get(`/categories/slug/${slug}`);
  },
  create(data: any) {
    return http.post('/categories', data);
  },
  update(id: number, data: any) {
    return http.patch(`/categories/${id}`, data);
  },
  remove(id: number) {
    return http.delete(`/categories/${id}`);
  },
};
