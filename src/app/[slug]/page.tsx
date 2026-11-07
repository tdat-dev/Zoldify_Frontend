import { CategoryScreen, categoryMetadata } from '@/app/_pages/category';
import { ProductScreen, productMetadata } from '@/app/_pages/product';
import { isProductSegment } from '@/lib/public-urls';

type Props = { params: { slug: string } };

/**
 * Món hàng và danh mục cùng nằm ở gốc URL, như Shopee và Lazada. Route tĩnh như
 * /cart hay /login được Next ưu tiên trước, nên chỉ đường dẫn còn lại mới vào đây.
 */
export function generateMetadata({ params }: Props) {
  return isProductSegment(params.slug)
    ? productMetadata(params.slug, `/${params.slug}`)
    : categoryMetadata(params.slug);
}

export default function RootSlugPage({ params }: Props) {
  return isProductSegment(params.slug) ? (
    <ProductScreen segment={params.slug} currentPath={`/${params.slug}`} />
  ) : (
    <CategoryScreen slug={params.slug} />
  );
}
