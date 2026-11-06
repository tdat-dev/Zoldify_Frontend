import { cache } from 'react';
import { API_URL } from './config';
import { BANDS } from '@/components/home/bands';

/**
 * Gọi API từ phía server để trang có nội dung ngay trong HTML cho Google.
 *
 * MỌI lượt gọi ở đây đi từ IP của VPS, nên dùng chung một xô giới hạn tốc độ của
 * API (10/giây, 50/10 giây, 300/phút). Hai lớp giữ cho việc đó không thành sự cố:
 *
 *  - `revalidate`: cùng một URL trong một phút chỉ gọi API một lần.
 *  - `error` không làm hỏng trang: 429, 5xx hay quá hạn thì trang vẫn render, và
 *    component client tự tải dữ liệu từ trình duyệt như trước đây. Chỉ 404 thật
 *    của API mới được coi là "không tồn tại".
 */
export type ApiResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not_found' }
  | { status: 'error' };

const TIMEOUT_MS = 3000;

async function apiGet<T>(
  path: string,
  revalidate = 60,
  notFoundStatuses = [404],
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (notFoundStatuses.includes(res.status)) return { status: 'not_found' };
    if (!res.ok) return { status: 'error' };
    const json = await res.json();
    return { status: 'ok', data: (json?.data ?? json) as T };
  } catch {
    return { status: 'error' };
  }
}

export type Page<T = any> = { result: T[]; meta: any };

// cache(): generateMetadata và trang cùng gọi một hàm trong một lượt render.
// fetch có `signal` thì React không tự gộp, nên phải gộp ở đây.
export const getProduct = cache((id: number) => apiGet<any>(`/products/${id}`));

export const getCategoryBySlug = cache((slug: string) =>
  apiGet<any>(`/categories/slug/${encodeURIComponent(slug)}`, 300),
);

export const getCategoryProducts = cache((categoryId: number) =>
  apiGet<Page>(`/products?current=1&pageSize=24&sort=newest&category_id=${categoryId}`),
);

// API trả 400 chứ không phải 404 khi không có shop.
export const getShop = cache((sellerId: number) =>
  apiGet<any>(`/shop/${sellerId}`, 60, [400, 404]),
);

export const getShopProducts = cache((sellerId: number) =>
  apiGet<Page>(`/shop/${sellerId}/products`),
);

/** Dữ liệu trang chủ. Phần nào lỗi thì để null, client tự tải phần đó. */
export async function getHomeData() {
  const [categories, newest, ...bands] = await Promise.all([
    apiGet<Page>('/categories?pageSize=100', 300),
    apiGet<Page>('/products?current=1&pageSize=24&sort=newest'),
    ...BANDS.map((b) =>
      apiGet<Page>(`/products?current=1&pageSize=4&sort=newest&${b.qs}`),
    ),
  ]);

  return {
    categories: categories.status === 'ok' ? categories.data.result : null,
    newest: newest.status === 'ok' ? newest.data : null,
    bands: bands.every((b) => b.status === 'ok')
      ? Object.fromEntries(
          BANDS.map((b, i) => {
            const r = bands[i];
            return [b.key, r.status === 'ok' ? r.data.result : []];
          }),
        )
      : null,
  };
}
