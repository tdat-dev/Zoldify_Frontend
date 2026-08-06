"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionState, type LoadState } from '@/components/home/SectionState';
import { EscrowCoin } from '@/components/home/EscrowCoin';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [catState, setCatState] = useState<LoadState>('loading');
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topState, setTopState] = useState<LoadState>('loading');
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [latestState, setLatestState] = useState<LoadState>('loading');

  useEffect(() => {
    categoryService.getAll()
      .then((res) => { setCategories(res.data?.data?.result || []); setCatState('ready'); })
      .catch(() => setCatState('error'));

    productService.getAll(1, 6, { sort: 'featured' })
      .then((res) => { setTopProducts(res.data?.data?.result || []); setTopState('ready'); })
      .catch(() => setTopState('error'));

    productService.getAll(1, 12, { sort: 'newest' })
      .then((res) => { setLatestProducts(res.data?.data?.result || []); setLatestState('ready'); })
      .catch(() => setLatestState('error'));
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-8 space-y-6">

        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Chợ đồ cũ của sinh viên: giáo trình, đồ dùng, thiết bị
        </h1>

        {/* SCAFFOLDING TẠM — Task 3 mount ở đây chỉ để check-coin.mjs có thứ để tìm.
            Task 4 sẽ gỡ dòng này ra và đặt EscrowCoin vào đúng chỗ (điều khiển bởi scroll). */}
        <EscrowCoin progress={0.5} />

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

        {/* SẢN PHẨM NỔI BẬT */}
        <section aria-labelledby="home-featured" className="bg-white rounded-sm shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 id="home-featured" className="text-brand font-medium uppercase text-base">SẢN PHẨM NỔI BẬT</h2>
            <Link href="/search" className="text-brand text-sm flex items-center gap-1 py-1">
              Xem tất cả <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {topState !== 'ready' || topProducts.length === 0 ? (
            <SectionState state={topState} empty={topProducts.length === 0} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {topProducts.map((prod) => <ProductCard key={prod.id} item={prod} />)}
            </div>
          )}
        </section>

        {/* SẢN PHẨM MỚI NHẤT */}
        <section aria-labelledby="home-latest" className="bg-white rounded-sm shadow-sm p-5">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2 id="home-latest" className="text-brand font-medium uppercase text-base">SẢN PHẨM MỚI NHẤT</h2>
          </div>

          {latestState !== 'ready' || latestProducts.length === 0 ? (
            <SectionState state={latestState} empty={latestProducts.length === 0} />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {latestProducts.map((item) => <ProductCard key={item.id} item={item} />)}
              </div>
              <div className="flex justify-center mt-8">
                <Link href="/search" className="bg-white border border-gray-300 text-gray-700 px-10 py-2.5 hover:bg-gray-50 transition-colors rounded-sm text-sm">
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
