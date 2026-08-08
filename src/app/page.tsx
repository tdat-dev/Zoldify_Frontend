"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { QuickLinks } from '@/components/home/QuickLinks';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { HomeCard } from '@/components/home/HomeCard';
import { ItemTile } from '@/components/home/ItemTile';
import { ItemStrip } from '@/components/home/ItemStrip';
import { SectionState, type LoadState } from '@/components/home/SectionState';

/**
 * Trang chủ ghép từ ba sàn tham chiếu, mỗi thành phần lấy từ nơi làm nó tốt
 * nhất (xem trực tiếp shopee.vn, lazada.vn, amazon.com ngày 2026-08-08):
 *
 *   thanh tiện ích mảnh trên cùng ....... Lazada  (AnnounceBar.tsx)
 *   chrome hai tầng + ô tìm kiếm dropdown  Amazon  (Header.tsx)
 *   hàng lối tắt icon tròn .............. Shopee  (QuickLinks.tsx)
 *   khối 2/3 + 1/3 ...................... Shopee
 *   lưới danh mục dạng ô ................ Shopee  (CategoryTiles.tsx)
 *   lưới thẻ trắng, link xanh đáy thẻ ... Amazon  (HomeCard.tsx)
 *   dải hàng cuộn ngang ................. Amazon + Lazada (ItemStrip.tsx)
 *   thẻ hàng: ảnh vuông, tên 2 dòng, giá  Lazada  (ItemTile.tsx)
 *
 * Giữ nhận diện Zoldify: logo và xanh #2C67C8, không dùng bảng màu hay logo của
 * ba sàn kia.
 *
 * Bốn thẻ trong lưới Amazon là bốn TẦM TIỀN, mỗi thẻ hiện hàng thật trong tầm
 * đó — đúng khuôn "New home arrivals under $50" của Amazon, và thay cho chỗ
 * Shopee/Lazada để Flash Sale. Zoldify không có khuyến mãi nên không dựng đếm
 * ngược hay phần trăm giảm.
 */
const BANDS = [
  { key: 'b1', title: 'Dưới 100.000₫', params: { price_max: 100000 }, qs: 'price_max=100000' },
  { key: 'b2', title: '100.000₫ – 300.000₫', params: { price_min: 100000, price_max: 300000 }, qs: 'price_min=100000&price_max=300000' },
  { key: 'b3', title: '300.000₫ – 1 triệu', params: { price_min: 300000, price_max: 1000000 }, qs: 'price_min=300000&price_max=1000000' },
  { key: 'b4', title: 'Trên 1 triệu', params: { price_min: 1000000 }, qs: 'price_min=1000000' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [catState, setCatState] = useState<LoadState>('loading');

  const [newest, setNewest] = useState<any[]>([]);
  const [newestState, setNewestState] = useState<LoadState>('loading');

  const [bandItems, setBandItems] = useState<Record<string, any[]>>({});
  const [bandState, setBandState] = useState<LoadState>('loading');

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
      .getAll(1, 16, { sort: 'newest' })
      .then((res) => {
        setNewest(res.data?.data?.result || []);
        setNewestState('ready');
      })
      .catch(() => setNewestState('error'));
  }, []);

  const loadBands = useCallback(() => {
    setBandState('loading');
    Promise.all(
      BANDS.map((b) =>
        productService
          .getAll(1, 4, { ...b.params, sort: 'newest' })
          .then((res) => [b.key, res.data?.data?.result || []] as const)
          .catch(() => [b.key, []] as const),
      ),
    )
      .then((pairs) => {
        setBandItems(Object.fromEntries(pairs));
        setBandState('ready');
      })
      .catch(() => setBandState('error'));
  }, []);

  useEffect(() => {
    loadCategories();
    loadNewest();
    loadBands();
  }, [loadCategories, loadNewest, loadBands]);

  return (
    <div className="min-h-screen bg-surface-page pb-12">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-3 py-3">
        {/* --- Shopee: hàng lối tắt icon tròn --- */}
        <QuickLinks />

        {/* --- Shopee: khối 2/3 bên trái, hai ô nhỏ xếp dọc bên phải --- */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {catState !== 'ready' || categories.length === 0 ? (
              <div className="rounded-card bg-surface-card">
                <SectionState
                  state={catState}
                  empty={categories.length === 0}
                  emptyText="Chưa có danh mục nào."
                  onRetry={loadCategories}
                />
              </div>
            ) : (
              <CategoryTiles categories={categories} />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <section
              aria-labelledby="panel-sell"
              className="flex flex-1 flex-col justify-between gap-3 rounded-card bg-brand-tint p-5"
            >
              <div>
                <h2 id="panel-sell" className="text-[17px] font-bold text-ink">
                  Bán đồ bạn không dùng nữa
                </h2>
                <p className="mt-1.5 text-small leading-relaxed text-ink-muted">
                  Đồ dùng còn tốt nhưng không cần nữa, máy móc đổi đời mới. Đăng một lần, người
                  cần sẽ tìm thấy.
                </p>
              </div>
              <Link
                href="/product/create"
                className="inline-flex w-fit items-center rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
              >
                Đăng bán đồ cũ
              </Link>
            </section>

            <section
              aria-labelledby="panel-pay"
              className="flex-1 rounded-card bg-surface-card p-5"
            >
              <h2 id="panel-pay" className="text-[17px] font-bold text-ink">
                Trả kiểu nào cũng được
              </h2>
              <ul className="mt-2 flex flex-col gap-1 text-small text-ink-muted">
                <li>Thanh toán khi nhận hàng</li>
                <li>Ví Zoldify</li>
                <li>Thẻ ATM nội địa, thẻ quốc tế và QR qua PayOS</li>
              </ul>
            </section>
          </div>
        </div>

        {/* --- Amazon: lưới bốn thẻ trắng, mỗi thẻ một tầm tiền --- */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {BANDS.map((band) => {
            const items = bandItems[band.key] || [];
            return (
              <HomeCard
                key={band.key}
                id={`card-${band.key}`}
                title={band.title}
                href={`/search?${band.qs}&sort=newest`}
                linkText="Xem tất cả"
              >
                {bandState !== 'ready' || items.length === 0 ? (
                  <SectionState
                    state={bandState}
                    empty={items.length === 0}
                    emptyText="Chưa có món nào trong tầm này."
                    onRetry={loadBands}
                  />
                ) : (
                  <ul className="grid grid-cols-2 gap-3">
                    {items.slice(0, 4).map((item) => (
                      <li key={item.id}>
                        <ItemTile item={item} />
                      </li>
                    ))}
                  </ul>
                )}
              </HomeCard>
            );
          })}
        </div>

        {/* --- Amazon + Lazada: dải hàng cuộn ngang --- */}
        {newestState === 'ready' && newest.length > 0 && (
          <ItemStrip
            id="strip-newest"
            title="Mới đăng gần đây"
            items={newest}
            href="/search?sort=newest"
          />
        )}
      </div>
    </div>
  );
}
