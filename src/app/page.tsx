"use client";

import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { Hero } from '@/components/home/Hero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { CategoryRail } from '@/components/home/CategoryRail';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { SectionState, type LoadState } from '@/components/home/SectionState';
import { PromoBand } from '@/components/home/PromoBand';
import { CollectionPair } from '@/components/home/CollectionPair';

/**
 * Thứ tự khối bám theo trang tham chiếu Accesora:
 * hero → dải tin cậy → danh mục → hàng nổi bật → dải đậm màu → bộ sưu tập →
 * hàng mới đăng.
 */
export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [catState, setCatState] = useState<LoadState>('loading');
  const [catTotal, setCatTotal] = useState<number | null>(null);

  const [popular, setPopular] = useState<any[]>([]);
  const [popularState, setPopularState] = useState<LoadState>('loading');
  const [productTotal, setProductTotal] = useState<number | null>(null);

  const [newest, setNewest] = useState<any[]>([]);
  const [newestState, setNewestState] = useState<LoadState>('loading');

  const loadCategories = useCallback(() => {
    setCatState('loading');
    categoryService
      .getAll()
      .then((res) => {
        const d = res.data?.data;
        setCategories(d?.result || []);
        setCatTotal(Number.isFinite(Number(d?.meta?.total)) ? Number(d.meta.total) : null);
        setCatState('ready');
      })
      .catch(() => setCatState('error'));
  }, []);

  const loadPopular = useCallback(() => {
    setPopularState('loading');
    productService
      .getAll(1, 8, { sort: 'most_viewed' })
      .then((res) => {
        const d = res.data?.data;
        setPopular(d?.result || []);
        setProductTotal(Number.isFinite(Number(d?.meta?.total)) ? Number(d.meta.total) : null);
        setPopularState('ready');
      })
      .catch(() => setPopularState('error'));
  }, []);

  const loadNewest = useCallback(() => {
    setNewestState('loading');
    productService
      .getAll(1, 8, { sort: 'newest' })
      .then((res) => {
        setNewest(res.data?.data?.result || []);
        setNewestState('ready');
      })
      .catch(() => setNewestState('error'));
  }, []);

  useEffect(() => {
    loadCategories();
    loadPopular();
    loadNewest();
  }, [loadCategories, loadPopular, loadNewest]);

  // Mỗi lưới đúng MỘT hàng 4 thẻ. Trước đây hai lưới 8 thẻ chồng lên nhau thành
  // hai mảng cao gần 900px, và vì hai lời gọi API chỉ khác tham số sort nên các
  // món dễ trùng nhau — người xem đọc ra là trang bị lặp. Lọc trùng để lưới thứ
  // hai luôn nói một điều mới.
  const popularTop = popular.slice(0, 4);
  const newestTop = newest.filter((n) => !popularTop.some((p) => p.id === n.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-surface-page pb-24 md:pb-12">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-9 px-4 py-6 md:gap-11 md:py-8">
        <Hero
          showcase={newestState === 'ready' ? newest : []}
          totalProducts={productTotal}
          totalCategories={catTotal}
        />

        <TrustStrip />

        {/* min-w-0: section là flex item trong cột, mặc định min-width:auto nên
            nó nở theo nội dung và hàng danh mục cuộn ngang đẩy tràn cả trang ở
            390px thay vì tự cuộn bên trong. */}
        <section aria-labelledby="home-categories" className="min-w-0">
          <SectionHeader id="home-categories" title="Mua theo danh mục" href="/search" linkText="Xem tất cả danh mục" />
          {catState !== 'ready' || categories.length === 0 ? (
            <div className="rounded-xl border border-ink/8 bg-surface-card">
              <SectionState
                state={catState}
                empty={categories.length === 0}
                emptyText="Chưa có danh mục nào."
                onRetry={loadCategories}
              />
            </div>
          ) : (
            <CategoryRail categories={categories} />
          )}
        </section>

        <section aria-labelledby="home-popular">
          <SectionHeader id="home-popular" title="Hàng nhiều người xem" href="/search" linkText="Xem tất cả" />
          {popularState !== 'ready' || popular.length === 0 ? (
            <div className="rounded-xl border border-ink/8 bg-surface-card">
              <SectionState
                state={popularState}
                empty={popular.length === 0}
                emptyText="Chưa có món nào được xem nhiều."
                onRetry={loadPopular}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {popularTop.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* Dải "Người bán trên Zoldify" tạm gỡ khỏi trang: ảnh mẫu không có khối
            này và chủ dự án yêu cầu bám sát mẫu. Component vẫn giữ trong
            src/components/home/SellerRail.tsx, cắm lại một dòng là xong. */}

        <PromoBand lead={popular[0] || newest[0]} />

        {catState === 'ready' && categories.length >= 2 && (
          <section aria-labelledby="home-collections">
            <SectionHeader id="home-collections" title="Nhiều người tìm" href="/search" linkText="Xem tất cả" />
            <CollectionPair categories={categories} />
          </section>
        )}

        <section aria-labelledby="home-newest">
          <SectionHeader id="home-newest" title="Mới đăng gần đây" href="/search" linkText="Xem tất cả" />
          {newestState !== 'ready' || newest.length === 0 ? (
            <div className="rounded-xl border border-ink/8 bg-surface-card">
              <SectionState
                state={newestState}
                empty={newest.length === 0}
                emptyText="Chưa ai đăng bán gì. Bạn đăng món đầu tiên nhé."
                onRetry={loadNewest}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {newestTop.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
