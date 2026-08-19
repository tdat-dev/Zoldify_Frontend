"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { useAuth } from '@/context/AuthContext';
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
  const { isAuthenticated, authReady } = useAuth();
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
  // Cuộn-để-tải: `loadingMore` là spinner ở chân danh sách (khác `loadState`
  // 'loading' vốn thay cả lưới bằng khung chờ). `sentinelRef` là ô mồi vô hình
  // ở cuối, lọt vào tầm nhìn thì kéo trang kế.
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Sáu từ khoá MỒI, hiện ngay lúc mở trang rồi bị API ghi đè bằng tên sản phẩm
  // thật (xem setTrendingKeywords bên dưới). Vì là chữ do mình viết chứ không
  // phải dữ liệu, chúng phải đổi theo ngôn ngữ — "Sách" không giúp ai đang đọc
  // giao diện tiếng Anh. Còn từ khoá lấy từ API thì để nguyên: đó là tên người
  // bán tự đặt, dịch nó là bịa.
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(() =>
    ['laptop', 'books', 'phones', 'headphones', 'tshirts', 'shoes'].map((k) => t(`trend_${k}`)),
  );
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const fetchProducts = useCallback(async (page: number, append = false) => {
    const params: any = {};
    if (q) params.q = q;
    if (selectedCat) params.category_id = parseInt(selectedCat);
    if (sort) params.sort = sort;
    if (priceMin !== undefined) params.price_min = priceMin;
    if (priceMax !== undefined) params.price_max = priceMax;

    // Nối thêm thì KHÔNG bật `loadState='loading'` — làm thế lưới đang có bị
    // thay bằng khung chờ, người dùng mất chỗ đang đọc. Trang kế dùng spinner
    // chân danh sách (`loadingMore`) thay vì che cả trang.
    if (!append) setLoadState('loading');
    try {
      const res = await productService.getAll(page, 20, params);
      const result = res.data?.data?.result || [];
      setProducts((prev) => (append ? [...prev, ...result] : result));
      setMeta(res.data?.data?.meta || { current: 1, pages: 1, total: 0 });
      setLoadState('ready');
    } catch {
      // Trước đây hàm này không bắt lỗi, nên API hỏng lại hiện
      // "Không tìm thấy sản phẩm nào phù hợp" — sai sự thật. Lỗi khi nối thêm
      // thì giữ nguyên danh sách cũ, chỉ báo lỗi khi lần tải đầu hỏng.
      if (!append) {
        setProducts([]);
        setLoadState('error');
      }
    }
  }, [q, selectedCat, sort, priceMin, priceMax]);

  // Đổi bộ lọc/từ khoá -> quay về trang 1 và thay cả danh sách. `fetchProducts`
  // đổi định danh mỗi khi một tiêu chí đổi, nên effect này chính là chỗ reset.
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Kéo tới cuối -> tải trang kế và NỐI vào. Chốt chặn: đang tải, hết trang thì
  // thôi. Đọc trang hiện tại từ `meta.current` chứ không giữ state trang riêng.
  const loadMore = useCallback(() => {
    // Khách chưa đăng nhập chỉ được trang đầu. Muốn xem tiếp thì đăng nhập —
    // chặn ngay ở đây để cả nút bấm lẫn observer đều không kéo thêm được.
    if (!isAuthenticated) return;
    if (loadingMore || loadState === 'loading') return;
    const cur = meta.current || 1;
    const pages = meta.pages || 1;
    if (cur >= pages) return;
    setLoadingMore(true);
    fetchProducts(cur + 1, true).finally(() => setLoadingMore(false));
  }, [isAuthenticated, loadingMore, loadState, meta, fetchProducts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // rootMargin dương: kích hoạt TRƯỚC khi ô mồi thật sự vào khung, để trang
    // kế về kịp trước lúc người dùng chạm đáy — cuộn không khựng.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const keyword = formData.get('q') as string;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
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
      <div className="w-full px-4 py-3 lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Cột lọc. Dưới lg thu thành một khối mở ra được thay vì biến mất —
              bản trước ẩn hẳn ở mobile, nên trên điện thoại không lọc được gì. */}
          <aside className="lg:w-[220px] lg:shrink-0">
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
                    onClick={() => fetchProducts(1, false)}
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
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {products.map((item) => (
                      <li key={item.id}>
                        <ItemTile item={item} size="md" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {loadState === 'ready' && products.length > 0 && (
              <div className="mt-6 flex flex-col items-center gap-3">
                {(meta.current || 1) < (meta.pages || 1) ? (
                  isAuthenticated ? (
                    <>
                      {/* Đã đăng nhập: nút bấm tay (cho bàn phím / không observer)
                          và ô mồi để observer tự kéo trang kế khi cuộn. */}
                      <button
                        type="button"
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="rounded-control border border-ink/16 bg-surface-card px-6 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:opacity-60"
                      >
                        {loadingMore ? t('loadingMore') : t('loadMore')}
                      </button>
                      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
                    </>
                  ) : authReady ? (
                    // Khách: dừng ở trang đầu, mời đăng nhập để xem tiếp.
                    <div className="w-full rounded-card border border-hairline bg-surface-card px-6 py-6 text-center">
                      <p className="text-small text-ink-muted">{t('loginToSeeMoreHint')}</p>
                      <Link
                        href="/login"
                        className="mt-3 inline-block rounded-control bg-brand px-6 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                      >
                        {t('loginToSeeMore')}
                      </Link>
                    </div>
                  ) : null
                ) : (
                  <p className="text-small text-ink-faint">{t('endReached')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
