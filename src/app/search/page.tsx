"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { useCategoryName } from '@/lib/categoryI18n';
import { ItemTile } from '@/components/home/ItemTile';
import { EmptyState } from '@/components/EmptyState';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('search');
  const catName = useCategoryName();
  const tc = useTranslations('common');
  const tBands = useTranslations('priceBands');
  const router = useRouter();
  const q = searchParams.get('q') || '';

  /**
   * Trang này TRƯỚC ĐÂY chỉ đọc `q` từ URL. Nghĩa là mọi link kiểu
   * /search?sort=newest hay /search?price_max=100000 mở ra một trang KHÔNG lọc
   * gì cả — link chết mà nhìn vẫn như link sống. Header và trang chủ đang trỏ
   * tới đúng những link đó.
   *
   * Đọc cả sort và khoảng giá từ URL. Số nào không phải số dương thì bỏ qua chứ
   * không gửi NaN xuống API.
   */
  const num = (raw: string | null) => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const priceMin = num(searchParams.get('price_min'));
  const priceMax = num(searchParams.get('price_max'));
  const sortFromUrl = searchParams.get('sort') || '';
  const catFromUrl = searchParams.get('category_id') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const selectedCat = catFromUrl;
  const [sort, setSort] = useState(sortFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  // Sáu từ khoá MỒI, hiện ngay lúc mở trang rồi bị API ghi đè bằng tên sản phẩm
  // thật (xem setTrendingKeywords bên dưới). Vì là chữ do mình viết chứ không
  // phải dữ liệu, chúng phải đổi theo ngôn ngữ — "Sách" không giúp ai đang đọc
  // giao diện tiếng Anh. Còn từ khoá lấy từ API thì để nguyên: đó là tên người
  // bán tự đặt, dịch nó là bịa.
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(() =>
    ['laptop', 'books', 'phones', 'headphones', 'tshirts', 'shoes'].map((k) => t(`trend_${k}`)),
  );
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const fetchProducts = useCallback(async (page: number) => {
    const params: any = {};
    if (q) params.q = q;
    if (selectedCat) params.category_id = parseInt(selectedCat);
    if (sort) params.sort = sort;
    if (priceMin !== undefined) params.price_min = priceMin;
    if (priceMax !== undefined) params.price_max = priceMax;

    setLoadState('loading');
    try {
      const res = await productService.getAll(page, 20, params);
      setProducts(res.data?.data?.result || []);
      setMeta(res.data?.data?.meta || { current: 1, pages: 1, total: 0 });
      setLoadState('ready');
    } catch {
      // Trước đây hàm này không bắt lỗi, nên API hỏng lại hiện
      // "Không tìm thấy sản phẩm nào phù hợp" — sai sự thật.
      setProducts([]);
      setLoadState('error');
    }
  }, [q, selectedCat, sort, priceMin, priceMax]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      setCategories(res.data?.data?.result || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    productService.getAll(1, 8, { sort: 'most_viewed' })
      .then((res) => {
        const list = res.data?.data?.result || [];
        const words = list
          .map((p: any) => (p.name || '').split(' ').slice(0, 2).join(' '))
          .filter((w: string) => w.length >= 3)
          .slice(0, 6);
        if (words.length > 0) setTrendingKeywords(words);
      })
      .catch(() => {});
  }, []);

  // useState(sortFromUrl) chỉ chạy lúc gắn component. Điều hướng phía client từ
  // /search?sort=newest sang /search?sort=price_asc KHÔNG gắn lại component, nên
  // thiếu effect này thì bấm link thứ hai không đổi được cách sắp xếp.
  useEffect(() => {
    setSort(sortFromUrl);
  }, [sortFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, selectedCat, sort, priceMin, priceMax]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const keyword = formData.get('q') as string;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const paginate = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Dựng URL mới từ URL hiện tại, chỉ đổi những khoá được truyền vào. Giữ
   *  nguyên các bộ lọc khác thay vì xoá sạch mỗi lần đổi một thứ. */
  const urlWith = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/search?${s}` : '/search';
  };

  /* Bốn tầm tiền — cùng thang với header và trang chủ. Đây là bộ lọc đầu tiên
     trong cột bên trái, trên cả danh mục: ở sàn đồ cũ, túi tiền là thứ người ta
     lọc trước loại hàng. */
  const BANDS = [
    { key: 'under100k', min: '', max: '100000' },
    { key: '100to300k', min: '100000', max: '300000' },
    { key: '300kTo1m', min: '300000', max: '1000000' },
    { key: 'over1m', min: '1000000', max: '' },
  ] as const;
  const activeBand = BANDS.findIndex(
    (b) => String(priceMin ?? '') === b.min && String(priceMax ?? '') === b.max,
  );

  const hasFilter = !!q || !!selectedCat || activeBand >= 0 || !!sort;

  /* Phân trang rút gọn. Bản trước render MỌI trang: 50 trang là 50 nút. */
  const pageList = (): (number | 'gap')[] => {
    const total = meta.pages || 1;
    const cur = meta.current || 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const out: (number | 'gap')[] = [1];
    const from = Math.max(2, cur - 1);
    const to = Math.min(total - 1, cur + 1);
    if (from > 2) out.push('gap');
    for (let i = from; i <= to; i++) out.push(i);
    if (to < total - 1) out.push('gap');
    out.push(total);
    return out;
  };

  const filterHead = 'mb-2 text-caption uppercase tracking-wide text-ink-faint';
  const filterItem =
    'block rounded-control px-2.5 py-1.5 text-small transition-colors hover:bg-surface-sunken';

  const filters = (
    <>
      <div className="mb-5">
        <h3 className={filterHead}>{t('priceBand')}</h3>
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link
              href={urlWith({ price_min: null, price_max: null })}
              className={`${filterItem} ${activeBand < 0 ? 'bg-brand-tint font-semibold text-brand' : 'text-ink'}`}
            >
              {tBands('any')}
            </Link>
          </li>
          {BANDS.map((b, i) => (
            <li key={b.key}>
              <Link
                href={urlWith({ price_min: b.min || null, price_max: b.max || null })}
                className={`${filterItem} tabular-nums ${
                  activeBand === i ? 'bg-brand-tint font-semibold text-brand' : 'text-ink'
                }`}
              >
                {tBands(b.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-5">
        <h3 className={filterHead}>{t('category')}</h3>
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link
              href={urlWith({ category_id: null })}
              className={`${filterItem} ${!selectedCat ? 'bg-brand-tint font-semibold text-brand' : 'text-ink'}`}
            >
              {t('all')}
            </Link>
          </li>
          {categories.map((cat: any) => (
            <li key={cat.id}>
              <Link
                href={urlWith({ category_id: String(cat.id) })}
                className={`${filterItem} truncate ${
                  selectedCat === String(cat.id)
                    ? 'bg-brand-tint font-semibold text-brand'
                    : 'text-ink'
                }`}
              >
                {catName(cat)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="sort-by" className={filterHead}>
          {t('sort')}
        </label>
        <select
          id="sort-by"
          value={sort}
          onChange={(e) => router.push(urlWith({ sort: e.target.value || null }))}
          className="w-full rounded-control border border-ink/16 bg-surface-card px-2.5 py-2 text-small text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="">{t('sortDefault')}</option>
          <option value="newest">{t('sortNewest')}</option>
          <option value="price_asc">{t('sortPriceAsc')}</option>
          <option value="price_desc">{t('sortPriceDesc')}</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[1500px] px-3 py-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Cột lọc. Dưới lg thu thành một khối mở ra được thay vì biến mất —
              bản trước ẩn hẳn ở mobile, nên trên điện thoại không lọc được gì. */}
          <aside className="lg:sticky lg:top-[85px] lg:w-[220px] lg:shrink-0 lg:self-start">
            <div className="hidden rounded-card bg-surface-card p-4 lg:block">{filters}</div>
            <details className="rounded-card bg-surface-card p-4 lg:hidden">
              <summary className="cursor-pointer text-small font-semibold text-ink">
                {t('filters')}
              </summary>
              <div className="mt-4">{filters}</div>
            </details>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="rounded-card bg-surface-card p-5">
              <h1 className="text-h2 text-ink">
                {q ? t('resultsFor', { q }) : t('allOnSale')}
              </h1>
              {loadState === 'ready' && (
                <p className="mt-1 text-small text-ink-muted">
                  {t('count', { count: meta.total ?? 0 })}
                </p>
              )}

              {hasFilter && (
                <Link
                  href="/search"
                  className="mt-3 inline-block text-small text-brand hover:underline"
                >
                  {t('clearFilters')}
                </Link>
              )}
            </div>

            <div className="mt-3">
              {loadState === 'loading' ? (
                <div className="rounded-card bg-surface-card p-10 text-center text-body text-ink-muted">
                  {t('loading')}
                </div>
              ) : loadState === 'error' ? (
                <div className="rounded-card bg-surface-card p-10 text-center">
                  <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
                  <p className="mt-2 text-small text-ink-muted">
                    {t('loadFailedHint')}
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchProducts(currentPage)}
                    className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    {tc('retry')}
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-card bg-surface-card pb-10">
                  <EmptyState
                    title={t('empty')}
                    hint={t('emptyHint')}
                    className="pb-0"
                  />
                  {trendingKeywords.length > 0 && (
                    <div className="mt-8 text-center">
                      <p className="mb-3 text-caption font-normal text-ink-muted">{t('trending')}</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {trendingKeywords.map((kw) => (
                          <Link
                            key={kw}
                            href={`/search?q=${encodeURIComponent(kw)}`}
                            className="rounded-control bg-surface-sunken px-3 py-1.5 text-small text-ink transition-colors hover:bg-brand hover:text-white"
                          >
                            {kw}
                          </Link>
                        ))}
                      </div>
                    </div>
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

            {meta.pages > 1 && (
              <nav aria-label={t('pagination')} className="mt-4 flex justify-center gap-1">
                {pageList().map((p, i) =>
                  p === 'gap' ? (
                    <span key={`gap-${i}`} className="px-2 py-1.5 text-small text-ink-faint">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => paginate(p)}
                      aria-current={p === meta.current ? 'page' : undefined}
                      className={`min-w-9 rounded-control px-3 py-1.5 text-small tabular-nums transition-colors ${
                        p === meta.current
                          ? 'bg-brand font-semibold text-white'
                          : 'bg-surface-card text-ink hover:bg-surface-sunken'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
