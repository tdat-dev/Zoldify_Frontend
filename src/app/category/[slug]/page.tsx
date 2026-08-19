"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { useCategoryName } from '@/lib/categoryI18n';
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
// Cùng thang tầm tiền với Header và /search, và dùng chung khoá dịch
// `priceBands` với chúng thay vì chép lại nhãn tiếng Việt lần thứ ba.
const BANDS = [
  { key: 'any', min: undefined, max: undefined },
  { key: 'under100k', min: undefined, max: 100000 },
  { key: '100to300k', min: 100000, max: 300000 },
  { key: '300kTo1m', min: 300000, max: 1000000 },
  { key: 'over1m', min: 1000000, max: undefined },
] as const;

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const t = useTranslations('category');
  const catName = useCategoryName();
  const tBands = useTranslations('priceBands');
  const tc = useTranslations('common');
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
        <nav
          aria-label={t('breadcrumbLabel')}
          className="mb-3 flex items-center gap-1 text-small text-ink-muted"
        >
          <Link href="/" className="hover:text-brand">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
          <span className="truncate text-ink" aria-current="page">
            {category ? catName(category) : params.slug}
          </span>
        </nav>

        <div className="flex flex-col gap-3 lg:flex-row">
          <aside className="lg:sticky lg:top-[85px] lg:w-[220px] lg:shrink-0 lg:self-start">
            <div className="rounded-card bg-surface-card p-4">
              <h2 className="mb-2 text-caption uppercase tracking-wide text-ink-faint">
                {t('priceBand')}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {BANDS.map((b, i) => (
                  <li key={b.key}>
                    <button
                      type="button"
                      onClick={() => setBand(i)}
                      aria-pressed={band === i}
                      className={`${filterItem} tabular-nums ${
                        band === i ? 'bg-brand-tint font-semibold text-brand' : 'text-ink'
                      }`}
                    >
                      {tBands(b.key)}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <label
                  htmlFor="cat-sort"
                  className="mb-2 block text-caption uppercase tracking-wide text-ink-faint"
                >
                  {t('sort')}
                </label>
                <select
                  id="cat-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-control border border-ink/16 bg-surface-card px-2.5 py-2 text-small text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                >
                  <option value="newest">{t('sortNewest')}</option>
                  <option value="price_asc">{t('sortPriceAsc')}</option>
                  <option value="price_desc">{t('sortPriceDesc')}</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="rounded-card bg-surface-card p-5">
              <h1 className="text-h2 text-ink">{category ? catName(category) : params.slug}</h1>
              {state === 'ready' && (
                <p className="mt-1 text-small tabular-nums text-ink-muted">
                  {band > 0
                    ? t('countInBand', {
                        count: products.length,
                        band: tBands(BANDS[band].key).toLowerCase(),
                      })
                    : t('count', { count: products.length })}
                </p>
              )}
            </div>

            <div className="mt-3">
              {state === 'loading' ? (
                <div className="rounded-card bg-surface-card p-10 text-center text-body text-ink-muted">
                  {tc('loading')}
                </div>
              ) : state === 'error' ? (
                <div className="rounded-card bg-surface-card p-10 text-center">
                  <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
                  <p className="mx-auto mt-2 max-w-[44ch] text-small text-ink-muted">
                    {t('loadFailedHint')}
                  </p>
                  <button
                    type="button"
                    onClick={load}
                    className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    {tc('retry')}
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-card bg-surface-card">
                  {band > 0 ? (
                    <EmptyState
                      title={t('emptyBand')}
                      hint={t('emptyBandHint')}
                      action={
                        <button
                          type="button"
                          onClick={() => setBand(0)}
                          className="rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                        >
                          {t('showAllBands')}
                        </button>
                      }
                    />
                  ) : (
                    <EmptyState
                      title={t('empty')}
                      hint={t('emptyHint')}
                      action={
                        <Link
                          href="/product/create"
                          className="inline-block rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                        >
                          {t('postFirst')}
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
