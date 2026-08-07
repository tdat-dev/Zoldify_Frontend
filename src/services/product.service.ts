import http from '@/lib/http';
import type {
  ApiResponse,
  CreateProductDto,
  Paginated,
  Product,
} from '@/api';

export const productService = {
  getAll(
    currentPage = 1,
    limit = 10,
    params?: {
      q?: string;
      category_id?: number;
      seller_id?: number;
      price_min?: number;
      price_max?: number;
      sort?: string;
    },
  ) {
    return http.get<ApiResponse<Paginated<Product>>>('/products', {
      params: { current: currentPage, pageSize: limit, ...params },
    });
  },
  getBySeller(sellerId: number, currentPage = 1, limit = 20) {
    return http.get<ApiResponse<Paginated<Product>>>('/products', {
      params: { seller_id: sellerId, current: currentPage, pageSize: limit },
    });
  },
  getOne(id: number) {
    return http.get<ApiResponse<Product>>(`/products/${id}`);
  },
  create(data: CreateProductDto) {
    return http.post<ApiResponse<Product>>('/products', data);
  },
  update(id: number, data: Partial<CreateProductDto>) {
    return http.patch<ApiResponse<Product>>(`/products/${id}`, data);
  },
  updateStock(id: number, stock: number) {
    return http.patch<ApiResponse<Product>>(`/products/${id}/stock`, { stock });
  },
  remove(id: number) {
    return http.delete<ApiResponse<unknown>>(`/products/${id}`);
  },
};
