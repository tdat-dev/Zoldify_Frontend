"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { Hero } from '@/components/home/Hero';
import { CategoryIndex } from '@/components/home/CategoryIndex';
import { ItemRow } from '@/components/home/ItemRow';
import { SectionState, type LoadState } from '@/components/home/SectionState';

/**
 * Trang chủ dựng theo macrostructure "Ledger Index" — sổ kê.
 *
 * Vì sao không phải lưới thẻ: đồ cũ mỗi món chỉ có một cái và mang metadata
 * riêng. Lưới thẻ đều tăm tắp là ngôn ngữ hàng sản xuất hàng loạt, và khi sàn
 * mới chỉ có dăm món thì lưới thẻ đọc ra là "hỏng" — còn một cuốn sổ vài dòng
 * vẫn ra cuốn sổ. Xem docs/superpowers/specs/2026-08-08-home-ledger-index.md.
 *
 * Khối sổ hàng nằm NGOÀI khung 1240px để vạch hairline chạy hết bề ngang màn
 * hình trong khi chữ vẫn neo trong khung; nội dung mỗi dòng tự căn lại bên
 * trong ItemRow.
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
      .getAll(1, 12, { sort: 'newest' })
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
    <div className="min-h-screen bg-surface-page pb-20">
      <div className="mx-auto max-w-[1240px] px-4">
        <Hero />
      </div>

      {/* --- Chỉ mục danh mục ------------------------------------------------ */}
      <section aria-labelledby="home-categories" className="border-t border-ink/12">
        <div className="mx-auto max-w-[1240px] px-4 py-9 md:py-12">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="home-categories" className="text-h2 text-ink">
              Danh mục
            </h2>
            <Link
              href="/search"
              className="text-small font-medium text-brand transition-colors hover:text-brand-dark"
            >
              Xem tất cả
            </Link>
          </div>

          {catState !== 'ready' || categories.length === 0 ? (
            <SectionState
              state={catState}
              empty={categories.length === 0}
              emptyText="Chưa có danh mục nào."
              onRetry={loadCategories}
            />
          ) : (
            <CategoryIndex categories={categories} />
          )}
        </div>
      </section>

      {/* --- Sổ hàng --------------------------------------------------------- */}
      <section aria-labelledby="home-newest" className="border-t border-ink/12">
        <div className="mx-auto max-w-[1240px] px-4 pb-4 pt-9 md:pt-12">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 id="home-newest" className="text-h2 text-ink">
              Mới đăng gần đây
            </h2>
            <Link
              href="/search?sort=newest"
              className="text-small font-medium text-brand transition-colors hover:text-brand-dark"
            >
              Xem tất cả
            </Link>
          </div>
        </div>

        {newestState !== 'ready' || newest.length === 0 ? (
          <div className="mx-auto max-w-[1240px] px-4 pb-10">
            <SectionState
              state={newestState}
              empty={newest.length === 0}
              emptyText="Chưa ai đăng bán gì. Bạn đăng món đầu tiên nhé."
              onRetry={loadNewest}
            />
          </div>
        ) : (
          <>
            <ul className="border-t border-ink/10">
              {newest.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </ul>
            <div className="mx-auto max-w-[1240px] px-4 pt-6">
              <Link
                href="/search?sort=newest"
                className="inline-flex items-center gap-2 text-small font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                Xem hết hàng đang bán
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
