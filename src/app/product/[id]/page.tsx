import { ProductScreen, productMetadata } from '@/app/_pages/product';

type Props = { params: { id: string } };

/** URL cũ. Chỉ còn hiển thị thật khi tên món rỗng, còn lại chuyển về route gốc. */
export function generateMetadata({ params }: Props) {
  return productMetadata(params.id, `/product/${params.id}`);
}

export default function LegacyProductPage({ params }: Props) {
  return <ProductScreen segment={params.id} currentPath={`/product/${params.id}`} />;
}
