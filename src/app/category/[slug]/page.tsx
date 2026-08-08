"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { ItemTile } from '@/components/home/ItemTile';
import { EmptyState } from '@/components/EmptyState';

/**
 * Một danh mục.
 *
 * Ba thứ của bản trước đã gỡ:
 *
 * 1. BỘ LỌC KHOẢNG GIÁ LÀ ĐỒ GIẢ. Hai ô nhập "Từ / Đến" và nút "ÁP DỤNG" không
 *    có onClick, không nối vào state nào. Bấm không xảy ra gì. Một điều khiển
 *    nhìn như dùng được mà không dùng được thì tệ hơn là không có. Nay là bốn
 *    tầm tiền, cùng thang với header và /search, và lọc thật qua API.
 *
 * 2. NHÃN "MỚI" GẮN SAI. Điều kiện là `status === 'active'` — `active` nghĩa là
 *    ĐANG BÁN, không phải mới. Nên mọi món đang bán đều đeo nhãn "Mới", vô nghĩa
 *    và còn sai với một sàn đồ cũ. Tình trạng thật đã có ConditionBadge ở trang
 *    chi tiết; ở lưới thì để giá và tên nói chuyện.
 *
 * 3. API HỎNG LẠI BÁO "CHƯA CÓ SẢN PHẨM NÀO". `.catch(() => setProducts([]))`
 *    nuốt lỗi rồi hiện trạng thái rỗng — nói sai sự thật với người dùng. Nay
 *    tách rõ ba trạng thái: đang tải, lỗi, rỗng thật.
 */
const BANDS = [
  { label: 'Mọi giá', min: undefined, max: undefined },
  { label: 'Dưới 100k', min: undefined, max: 100000 },
  { label: '100k – 300k', min: 100000, max: 300000 },
  { label: '300k – 1 triệu', min: 300000, max: 1000000 },
  { label: 'Trên 1 triệu', min: 1000000, max: undefined },
];

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [sort, setSort] = useState('newest');
  const [band, setBand] = useState(0);

  const load = useCallback(() => {
    setState('loading');
    categoryService
      .getBySlug(params.slug)
      .then((res) => {
        const cat = res.data?.data || res.data;
        setCategory(cat);
        const b = BANDS[band];
        return productService.getAll(1, 24, {
          category_id: cat.id,
          sort: sort || undefined,
          ...(b.min !== undefined ? { price_min: b.min } : {}),
          ...(b.max !== undefined ? { price_max: b.max } : {}),
        });
      })
      .then((res) => {
        setProducts(res.data?.data?.result || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [params.slug, sort, band]);

  useEffect(() => {
    load();
  }, [load]);

  const filterItem =
    'block w-full rounded-control px-2.5 py-1.5 text-left text-small transition-colors hover:bg-surface-sunken';

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[1500px] px-3 py-3">
        <nav aria-label="Đường dẫn" className="mb-3 flex items-center gap-1 text-small text-ink-muted">
          <Link href="/" className="hover:text-brand">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
          <span className="truncate text-ink" aria-current="page">
            {category?.name || params.slug}
          </span>
        </nav>

        <div className="flex flex-col gap-3 lg:flex-row">
          <aside className="lg:w-[220px] lg:shrink-0">
            <div className="rounded-card bg-surface-card p-4">
              <h2 className="mb-2 text-caption uppercase tracking-wide text-ink-faint">Tầm tiền</h2>
              <ul className="flex flex-col gap-0.5">
                {BANDS.map((b, i) => (
                  <li key={b.label}>
                    <button
                      type="button"
                      onClick={() => setBand(i)}
                      aria-pressed={band === i}
                      className={`${filterItem} tabular-nums ${
                        band === i ? 'bg-brand-tint font-semibold text-brand' : 'text-ink'
                      }`}
                    >
                      {b.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <label
                  htmlFor="cat-sort"
                  className="mb-2 block text-caption uppercase tracking-wide text-ink-faint"
                >
                  Sắp xếp
                </label>
                <select
                  id="cat-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-control border border-ink/16 bg-surface-card px-2.5 py-2 text-small text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="newest">Mới đăng trước</option>
                  <option value="price_asc">Giá thấp trước</option>
                  <option value="price_desc">Giá cao trước</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="rounded-card bg-surface-card p-5">
              <h1 className="text-h2 text-ink">{category?.name || params.slug}</h1>
              {state === 'ready' && (
                <p className="mt-1 text-small text-ink-muted">
                  <span className="tabular-nums">{products.length}</span> món
                  {band > 0 && ` trong tầm ${BANDS[band].label.toLowerCase()}`}
                </p>
              )}
            </div>

            <div className="mt-3">
              {state === 'loading' ? (
                <div className="rounded-card bg-surface-card p-10 text-center text-body text-ink-muted">
                  Đang tải…
                </div>
              ) : state === 'error' ? (
                <div className="rounded-card bg-surface-card p-10 text-center">
                  <p className="text-body font-semibold text-ink">Không tải được danh mục này.</p>
                  <p className="mt-2 text-small text-ink-muted">
                    Kiểm tra kết nối rồi thử lại. Đây không phải là “danh mục rỗng”.
                  </p>
                  <button
                    type="button"
                    onClick={load}
                    className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Thử lại
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-card bg-surface-card">
                  {band > 0 ? (
                    <EmptyState
                      title="Không có món nào trong tầm tiền này."
                      hint="Danh mục vẫn có hàng, chỉ là không món nào rơi vào khoảng giá bạn chọn."
                      action={
                        <button
                          type="button"
                          onClick={() => setBand(0)}
                          className="rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                        >
                          Xem mọi tầm giá
                        </button>
                      }
                    />
                  ) : (
                    <EmptyState
                      title="Chưa ai đăng bán gì trong danh mục này."
                      hint="Đồ cũ trong nhà bạn có thể là món ai đó đang tìm."
                      action={
                        <Link
                          href="/product/create"
                          className="inline-block rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                        >
                          Đăng món đầu tiên
                        </Link>
                      }
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-card bg-surface-card p-4">
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((item) => (
                      <li key={item.id}>
                        <ItemTile item={item} size="md" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
