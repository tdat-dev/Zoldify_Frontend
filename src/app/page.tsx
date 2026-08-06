"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionState, type LoadState } from '@/components/home/SectionState';
import { HomeHero } from '@/components/home/HomeHero';
import { EscrowStages } from '@/components/home/EscrowStages';
import { useCoinJourney } from '@/components/home/useCoinJourney';
import { formatPrice } from '@/lib/format';

export default function HomePage() {
  const { progress: coinProgress, reduced: coinReduced, coinX, coinY } = useCoinJourney();
  const [categories, setCategories] = useState<any[]>([]);
  const [catState, setCatState] = useState<LoadState>('loading');
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [latestState, setLatestState] = useState<LoadState>('loading');

  useEffect(() => {
    categoryService.getAll()
      .then((res) => { setCategories(res.data?.data?.result || []); setCatState('ready'); })
      .catch(() => setCatState('error'));

    productService.getAll(1, 12, { sort: 'newest' })
      .then((res) => { setLatestProducts(res.data?.data?.result || []); setLatestState('ready'); })
      .catch(() => setLatestState('error'));
  }, []);

  return (
    <div className="bg-surface-page min-h-screen pb-20 md:pb-10 overflow-x-clip">
      <div className="max-w-[1200px] mx-auto px-4 pt-8 space-y-6">

        <HomeHero coinProgress={coinProgress} reduced={coinReduced} coinX={coinX} coinY={coinY} />

        <EscrowStages firstPrice={latestProducts[0] ? formatPrice(latestProducts[0].price) : undefined} />

        {/* DANH MỤC */}
        <section aria-labelledby="home-categories" className="bg-white rounded-sm shadow-sm">
          <div className="hidden md:flex h-[60px] px-5 items-center border-b border-gray-100">
            <h2 id="home-categories" className="text-gray-600 font-medium uppercase text-base">DANH MỤC</h2>
          </div>
          <h2 className="sr-only md:hidden">Danh mục</h2>

          {catState !== 'ready' || categories.length === 0 ? (
            <SectionState state={catState} empty={categories.length === 0} />
          ) : (
            <>
              {/* Mobile: cuộn ngang */}
              <div className="md:hidden overflow-x-auto scrollbar-none py-3 px-2">
                <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/category/${cat.slug || cat.id}`} className="flex flex-col items-center w-[76px] flex-shrink-0 py-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden mb-1.5 bg-indigo-50 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-600" aria-hidden="true" />
                        )}
                      </div>
                      <span className="text-xs text-gray-800 text-center leading-tight line-clamp-2 px-0.5">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: lưới */}
              <div className="hidden md:block p-0">
                <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-0">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/category/${cat.slug || cat.id}`} className="flex flex-col items-center justify-center h-[150px] border-r border-b border-gray-50 hover:shadow-md transition-shadow group/item">
                      <div className="w-[70%] aspect-square rounded-full overflow-hidden mb-2 transition-transform group-hover/item:-translate-y-1 bg-indigo-50 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Package className="w-7 h-7 text-gray-600" aria-hidden="true" />
                        )}
                      </div>
                      <span className="text-[13px] text-gray-800 text-center px-2 leading-4">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <section aria-labelledby="home-listings" className="bg-surface-card rounded-sm shadow-sm p-5">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2
              id="home-listings"
              className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-extrabold text-ink"
              style={{ fontVariationSettings: "'wdth' 112" }}
            >
              Đang bán ở Zoldify
            </h2>
          </div>

          {latestState !== 'ready' || latestProducts.length === 0 ? (
            <SectionState state={latestState} empty={latestProducts.length === 0} />
          ) : (
            <>
              <div data-product-grid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {latestProducts.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Link href="/search" className="bg-surface-card border border-ink/20 text-ink px-10 py-2.5 hover:bg-ink/5 transition-colors rounded-sm text-sm">
                  Xem thêm sản phẩm
                </Link>
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
}
