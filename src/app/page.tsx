"use client";

import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { Hero } from '@/components/home/Hero';
import { CategoryRail } from '@/components/home/CategoryRail';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { SectionState, type LoadState } from '@/components/home/SectionState';

/**
 * Trang chủ có ba tầng, không hơn: TÌM → DANH MỤC → HÀNG MỚI.
 *
 * Bản trước có bảy khối, phần lớn là khối đắp thêm cho giống một trang bán phụ
 * kiện (git log: "dựng lại trang chủ bám theo bố cục Accesora"): dải bốn ô tin
 * cậy, băng "Giảm tới 70%" kèm đồng hồ đếm ngược, khối "Nhiều người tìm", và
 * hai lưới sản phẩm gần trùng nhau. Toàn bộ đã gỡ.
 *
 * Chỉ còn MỘT lưới hàng, lấy hàng mới đăng: với đồ cũ thì món đăng gần đây là
 * món còn ở đó, chứ không phải món "nhiều người xem" đã bán từ tuần trước.
 */
export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [catState, setCatState] = useState<LoadState>('loading');

  const [newest, setNewest] = useState<any[]>([]);
  const [newestState, setNewestState] = useState<LoadState>('loading');

  const loadCategories = useCallback(() => {
    setCatState('loading');
    categoryService
      .getAll()
      .then((res) => {
        setCategories(res.data?.data?.result || []);
        setCatState('ready');
      })
      .catch(() => setCatState('error'));
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
    loadNewest();
  }, [loadCategories, loadNewest]);

  return (
    <div className="min-h-screen bg-surface-page pb-24 md:pb-12">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-12 px-4 pb-8 md:gap-16">
        <Hero categories={catState === 'ready' ? categories : []} />

        {/* min-w-0: section là flex item trong cột, mặc định min-width:auto nên
            nó nở theo nội dung và hàng danh mục cuộn ngang đẩy tràn cả trang ở
            390px thay vì tự cuộn bên trong. */}
        <section aria-labelledby="home-categories" className="min-w-0">
          <SectionHeader
            id="home-categories"
            title="Danh mục"
            href="/search"
            linkText="Xem tất cả"
          />
          {catState !== 'ready' || categories.length === 0 ? (
            <div className="rounded-card border border-ink/8 bg-surface-card">
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

        <section aria-labelledby="home-newest" className="min-w-0">
          <SectionHeader
            id="home-newest"
            title="Mới đăng gần đây"
            href="/search?sort=newest"
            linkText="Xem tất cả"
          />
          {newestState !== 'ready' || newest.length === 0 ? (
            <div className="rounded-card border border-ink/8 bg-surface-card">
              <SectionState
                state={newestState}
                empty={newest.length === 0}
                emptyText="Chưa ai đăng bán gì. Bạn đăng món đầu tiên nhé."
                onRetry={loadNewest}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {newest.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
