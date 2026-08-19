"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/format';
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
// Tiêu đề đi qua formatPrice chứ không viết tay "100.000₫": bản viết tay thiếu
// khoảng trắng trước ₫ trong khi giá ngay bên dưới thẻ lại có (Intl vi-VN trả
// "250.000 ₫"), nên hai con số cạnh nhau trông như hai đơn vị khác nhau. Đi qua
// formatPrice thì đổi tiền tệ cũng theo luôn.
const BANDS = [
  { key: 'b1', max: 100000, params: { price_max: 100000 }, qs: 'price_max=100000' },
  { key: 'b2', min: 100000, max: 300000, params: { price_min: 100000, price_max: 300000 }, qs: 'price_min=100000&price_max=300000' },
  { key: 'b3', min: 300000, max: 1000000, params: { price_min: 300000, price_max: 1000000 }, qs: 'price_min=300000&price_max=1000000' },
  { key: 'b4', min: 1000000, params: { price_min: 1000000 }, qs: 'price_min=1000000' },
];

/**
 * Số cột ở breakpoint xl phải khớp số thẻ CÒN LẠI sau khi lọc, nếu không thì
 * lọc mất một tầm sẽ để lại một ô trống bằng một phần tư chiều rộng trang.
 *
 * Viết sẵn từng chuỗi đầy đủ, KHÔNG ghép `xl:grid-cols-${n}`: Tailwind quét mã
 * nguồn bằng văn bản nên tên lớp ghép động không sinh ra CSS nào — cùng cái bẫy
 * đã làm chết 21 lớp bo màu và suýt làm chết nhóm state-* hôm nay.
 */
const XL_COLS: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
};

// Nhan tam tien dung ham dich truyen vao, khong tu ghep chu: "Duoi"/"Tren"
// dat truoc so o tieng Viet nhung tieng Anh la "Under"/"Over" — cung vi tri,
// khac tu, nen phai la chuoi hoan chinh trong messages chu khong phai ghep tay.
function bandTitle(
  b: (typeof BANDS)[number],
  // Kiểu lấy thẳng từ next-intl thay vì tự khai `(key, values) => string`:
  // TranslationValues của nó hẹp hơn Record<string, unknown>, tự khai là lệch.
  t: ReturnType<typeof useTranslations<'home'>>,
): string {
  if (b.min === undefined) return t('bandUnder', { max: formatPrice(b.max) });
  if (b.max === undefined) return t('bandOver', { min: formatPrice(b.min) });
  return `${formatPrice(b.min)} – ${formatPrice(b.max)}`;
}

export default function HomePage() {
  const t = useTranslations('home');
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

  // Lúc đang tải thì giữ đủ bốn khung để bố cục không nhảy; tải xong mới lọc.
  const visibleBands =
    bandState === 'ready'
      ? BANDS.filter((b) => (bandItems[b.key] || []).length > 0)
      : BANDS;

  return (
    <div className="min-h-screen bg-surface-page pb-12">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-3 py-3">
        {/* --- Shopee: hàng lối tắt icon tròn --- */}
        <QuickLinks />

        {/* --- Shopee: khối 2/3 bên trái, hai ô nhỏ xếp dọc bên phải --- */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {catState !== 'ready' || categories.length === 0 ? (
              <div className="h-full rounded-card bg-surface-card">
                <SectionState
                  state={catState}
                  empty={categories.length === 0}
                  emptyText={t('noCategories')}
                  onRetry={loadCategories}
                />
              </div>
            ) : (
              <CategoryTiles categories={categories} />
            )}
          </div>

          {/* Cột này trước đây chia đôi cho "đăng bán" và một danh sách ba cách
              thanh toán. Danh sách đó lặp lại NGUYÊN VĂN Footer.tsx:35-37 — nói
              hai lần trên cùng một trang không làm nó đúng hơn, chỉ lấy mất chỗ.
              Cả cột nay dành cho việc đăng bán, thứ phân biệt một sàn đồ cũ với
              một sàn hàng mới. */}
          <section
            aria-labelledby="panel-sell"
            className="flex flex-col overflow-hidden rounded-card bg-brand-tint"
          >
            <img
              src="/media/sell-flatlay.webp"
              alt={t('sellPanelAlt')}
              width={1000}
              height={667}
              className="aspect-[3/2] w-full object-cover"
            />
            <div className="flex flex-1 flex-col justify-between gap-4 p-5">
              <div>
                <h2 id="panel-sell" className="text-[17px] font-bold text-ink">
                  {t('sellPanelTitle')}
                </h2>
                <p className="mt-1.5 text-small leading-relaxed text-ink-muted">
                  {t('sellPanelLead')}
                </p>
              </div>
              <Link
                href="/product/create"
                className="inline-flex w-fit items-center rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
              >
                {t('sellPanelCta')}
              </Link>
            </div>
          </section>
        </div>

        {/* --- Amazon: lưới thẻ trắng, mỗi thẻ một tầm tiền ---
            Khi đã tải xong thì CHỈ hiện tầm nào có hàng. Các thẻ trong lưới cao
            bằng nhau, nên một tầm rỗng chiếm trọn một phần tư chỗ đẹp nhất
            trang chủ chỉ để nói "không có gì" — đo được với dữ liệu thật: món
            rẻ nhất 250.000 ₫ nên thẻ "Dưới 100.000 ₫" cao gần 500px và trống
            trơn. Tầm rỗng không phải thông tin người mua cần. */}
        {bandState === 'error' ? (
          <div className="rounded-card bg-surface-card">
            <SectionState state="error" empty={false} onRetry={loadBands} />
          </div>
        ) : visibleBands.length > 0 ? (
          <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${XL_COLS[visibleBands.length]}`}>
            {visibleBands.map((band) => {
              const items = bandItems[band.key] || [];
              return (
                <HomeCard
                  key={band.key}
                  id={`card-${band.key}`}
                  title={bandTitle(band, t)}
                  href={`/search?${band.qs}&sort=newest`}
                >
                  {bandState !== 'ready' ? (
                    <SectionState state={bandState} empty={false} onRetry={loadBands} />
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
        ) : null}

        {/* --- Amazon + Lazada: dải hàng cuộn ngang --- */}
        {newestState === 'ready' && newest.length > 0 && (
          <ItemStrip
            id="strip-newest"
            title={t('newestTitle')}
            items={newest}
            href="/search?sort=newest"
            gateAuth
          />
        )}
      </div>
    </div>
  );
}
