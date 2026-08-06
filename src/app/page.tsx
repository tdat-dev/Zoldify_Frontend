"use client";

import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { HomeHero } from '@/components/home/HomeHero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { CategoryRail } from '@/components/home/CategoryRail';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { SectionState, type LoadState } from '@/components/home/SectionState';
import { EscrowBand } from '@/components/home/EscrowBand';
import { SellCta } from '@/components/home/SellCta';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [catState, setCatState] = useState<LoadState>('loading');
  const [newest, setNewest] = useState<any[]>([]);
  const [newestState, setNewestState] = useState<LoadState>('loading');
  const [popular, setPopular] = useState<any[]>([]);
  const [popularState, setPopularState] = useState<LoadState>('loading');

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

  const loadPopular = useCallback(() => {
    setPopularState('loading');
    productService
      .getAll(1, 6, { sort: 'most_viewed' })
      .then((res) => {
        setPopular(res.data?.data?.result || []);
        setPopularState('ready');
      })
      .catch(() => setPopularState('error'));
  }, []);

  useEffect(() => {
    loadCategories();
    loadNewest();
    loadPopular();
  }, [loadCategories, loadNewest, loadPopular]);

  return (
    <div className="min-h-screen bg-surface-page pb-24 md:pb-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-6 md:gap-10 md:py-8">
        <HomeHero showcase={newestState === 'ready' ? newest : []} />

        <TrustStrip />

        <section aria-labelledby="home-categories">
          <SectionHeader id="home-categories" title="Tìm theo danh mục" href="/search" />
          {catState !== 'ready' || categories.length === 0 ? (
            <div className="rounded-2xl bg-surface-card">
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

        <section aria-labelledby="home-newest">
          <SectionHeader id="home-newest" title="Mới đăng gần đây" href="/search" />
          {newestState !== 'ready' || newest.length === 0 ? (
            <div className="rounded-2xl bg-surface-card">
              <SectionState
                state={newestState}
                empty={newest.length === 0}
                emptyText="Chưa ai đăng bán gì. Bạn đăng món đầu tiên nhé."
                onRetry={loadNewest}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
              {newest.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <EscrowBand />

        <section aria-labelledby="home-popular">
          <SectionHeader id="home-popular" title="Nhiều người xem" href="/search" />
          {popularState !== 'ready' || popular.length === 0 ? (
            <div className="rounded-2xl bg-surface-card">
              <SectionState
                state={popularState}
                empty={popular.length === 0}
                emptyText="Chưa có món nào được xem nhiều."
                onRetry={loadPopular}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
              {popular.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <SellCta />
      </div>
    </div>
  );
}
