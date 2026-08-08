"use client";

import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';
import { Hero } from '@/components/home/Hero';
import { SectionCard } from '@/components/home/SectionCard';
import { PriceBands } from '@/components/home/PriceBands';
import { CategoryIndex } from '@/components/home/CategoryIndex';
import { ItemRow } from '@/components/home/ItemRow';
import { SectionState, type LoadState } from '@/components/home/SectionState';

/**
 * Trang chủ tổng hợp từ ba sàn tham chiếu (xem trực tiếp ngày 2026-08-08:
 * shopee.vn, lazada.vn, amazon.com) rồi đổi phần trục cho khớp Zoldify.
 *
 * LẤY của họ — kết cấu, không phải hình thức:
 *   · nền trang xám, khối nội dung trắng nổi lên (cả ba đều vậy)
 *   · header là một dải màu đặc, tách bạch khỏi nội dung (Shopee, Amazon)
 *   · ô tìm kiếm to giữa header, từ khoá gợi ý ngay dưới (Shopee)
 *   · mật độ cao, mỗi khối có tiêu đề trái + "xem tất cả" phải (cả ba)
 *   · bo góc gần vuông (cả ba)
 *
 * KHÔNG lấy: đếm ngược flash sale, phần trăm giảm, giá gạch ngang, "còn 5 cái",
 * banner chiến dịch. Zoldify không có dữ liệu nào trong số đó — dựng lên là bịa,
 * và đã xoá đúng đám đó khỏi trang này ngày 2026-08-07.
 *
 * ĐỔI trục: chỗ Shopee/Lazada để "Flash Sale", Zoldify để TẦM TIỀN. Ba sàn kia
 * bán hàng mới hàng loạt nên trục của họ là khuyến mãi; ở đây mỗi món một cái,
 * không có sale, và thứ người mua lọc trước tiên là túi tiền.
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
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-4 py-4 md:gap-4">
        <Hero />

        <SectionCard id="home-bands" title="Chọn theo tầm tiền">
          <PriceBands />
        </SectionCard>

        <SectionCard id="home-categories" title="Danh mục" href="/search">
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
        </SectionCard>

        <SectionCard
          id="home-newest"
          title="Mới đăng gần đây"
          href="/search?sort=newest"
          bleed={newestState === 'ready' && newest.length > 0}
        >
          {newestState !== 'ready' || newest.length === 0 ? (
            <SectionState
              state={newestState}
              empty={newest.length === 0}
              emptyText="Chưa ai đăng bán gì. Bạn đăng món đầu tiên nhé."
              onRetry={loadNewest}
            />
          ) : (
            <ul>
              {newest.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
