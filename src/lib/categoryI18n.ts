'use client';

import { useLocale } from 'next-intl';

/**
 * Tên danh mục theo ngôn ngữ.
 *
 * Danh mục là một tập CỐ ĐỊNH, ít khi đổi tên (chủ yếu đổi thứ tự), nên dịch
 * TĨNH theo slug ở đây — không cần dịch máy như nội dung tin đăng. Slug lạ (danh
 * mục admin thêm sau) tự fallback về tên trong DB, nên thêm danh mục không vỡ,
 * chỉ là chưa có bản tiếng Anh cho tới khi thêm vào bảng dưới.
 */
const EN: Record<string, string> = {
  'dien-thoai': 'Phones',
  laptop: 'Laptops',
  'tai-nghe': 'Headphones',
  'dong-ho': 'Watches',
  'may-tinh-bang': 'Tablets',
  'phu-kien': 'Accessories',
  'quan-ao': 'Clothing',
  'the-thao': 'Sports',
  'nau-an': 'Kitchen & Cooking',
};

type CatLike = { slug?: string | null; name?: string | null };

/** Hook trả về hàm map một danh mục -> tên hiển thị đúng ngôn ngữ đang chọn. */
export function useCategoryName(): (cat: CatLike) => string {
  const locale = useLocale();
  return (cat) => {
    const fallback = String(cat?.name || cat?.slug || '');
    if (locale === 'en' && cat?.slug && EN[cat.slug]) return EN[cat.slug];
    return fallback;
  };
}
