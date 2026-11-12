/**
 * Ảnh minh hoạ danh mục cho trang chủ, theo slug. Ảnh ở
 * public/media/categories/<slug>.webp: icon 3D nền trắng tạo bằng Vanta Motion
 * (12/11/2026), cùng một khuôn prompt nên chín ô đứng chung một họ, thay cho ảnh
 * trong DB vốn trộn ảnh chụp với ảnh ghép, mỗi cái một kiểu.
 *
 * Danh mục mới chưa có ảnh ở đây thì vẫn dùng ảnh API trả về.
 */
const SLUGS_WITH_ART = new Set([
  'dien-thoai',
  'laptop',
  'tai-nghe',
  'dong-ho',
  'may-tinh-bang',
  'phu-kien',
  'quan-ao',
  'the-thao',
  'nau-an',
]);

export const ALL_CATEGORIES_ART = '/media/categories/all.webp';

export function categoryArt(slug: string | undefined): string | null {
  return slug && SLUGS_WITH_ART.has(slug) ? `/media/categories/${slug}.webp` : null;
}
