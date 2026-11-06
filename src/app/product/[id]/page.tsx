import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { ProductDetail } from '@/components/product/ProductDetail';
import { formatPrice } from '@/lib/format';
import { normalizeCondition } from '@/lib/product-condition';
import { parseProductId, productPath } from '@/lib/public-urls';
import { isProductIndexable, productJsonLd } from '@/lib/seo';
import { getProduct } from '@/lib/server-api';

type Props = { params: { id: string } };

/**
 * Đừng thêm loading.tsx ở app/ hay ở đây: có nó thì Next gửi mã 200 trước khi
 * trang chạy xong, nên 404 thành soft 404 và chuyển hướng thành 200. Đã đo:
 * /product/99999999 trả 200 khi còn app/loading.tsx.
 */
async function resolveProduct(segment: string) {
  const id = parseProductId(segment);
  if (!id) notFound();

  const result = await getProduct(id);
  if (result.status === 'not_found') notFound();
  if (result.status === 'error') return { id, product: null };

  const path = productPath(result.data);
  if (segment !== path.split('/').pop()) permanentRedirect(path);
  return { id, product: result.data };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await resolveProduct(params.id);
  if (!product) return {};

  const [t, tc] = await Promise.all([getTranslations('seo'), getTranslations('condition')]);
  const values = {
    name: product.name,
    condition: tc(normalizeCondition(product.condition)),
    price: formatPrice(product.price, product.currency),
  };
  const title = t('productTitle', values);
  const description = t('productDesc', values);
  const images = product.image ? [product.image] : undefined;

  return {
    title,
    description,
    alternates: { canonical: productPath(product) },
    robots: isProductIndexable(product) ? undefined : { index: false, follow: true },
    openGraph: { type: 'website', siteName: 'Zoldify', title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id, product } = await resolveProduct(params.id);
  const t = await getTranslations('product');

  return (
    <>
      {product && isProductIndexable(product) && (
        <JsonLd data={productJsonLd(product, t('home'))} />
      )}
      <ProductDetail productId={id} initialProduct={product} />
    </>
  );
}
