import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { LandingLinks } from '@/components/category/LandingLinks';
import { JsonLd } from '@/components/JsonLd';
import { ProductDetail } from '@/components/product/ProductDetail';
import { formatPrice } from '@/lib/format';
import { normalizeCondition } from '@/lib/product-condition';
import { parseProductId, productPath } from '@/lib/public-urls';
import { isProductIndexable, productJsonLd } from '@/lib/seo';
import { getLandingFacets, getProduct } from '@/lib/server-api';

/**
 * Đừng thêm loading.tsx ở app/ hay ở đây: có nó thì Next gửi mã 200 trước khi
 * trang chạy xong, nên 404 thành soft 404 và chuyển hướng thành 200. Đã đo:
 * /product/99999999 trả 200 khi còn app/loading.tsx.
 */
async function resolveProduct(segment: string, currentPath: string) {
  const id = parseProductId(segment);
  if (!id) notFound();

  const result = await getProduct(id);
  if (result.status === 'not_found') notFound();
  if (result.status === 'error') return { id, product: null };

  const path = productPath(result.data);
  if (currentPath !== path) permanentRedirect(path);
  return { id, product: result.data };
}

export async function productMetadata(segment: string, currentPath: string): Promise<Metadata> {
  const { product } = await resolveProduct(segment, currentPath);
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

/** Dùng chung cho route gốc và `/product/[id]`: URL cũ chuyển một bước về URL chuẩn. */
export async function ProductScreen({
  segment,
  currentPath,
}: {
  segment: string;
  currentPath: string;
}) {
  const { id, product } = await resolveProduct(segment, currentPath);
  const t = await getTranslations('product');
  const landing = product?.category?.slug
    ? await getLandingFacets(product.category.slug)
    : null;

  return (
    <>
      {product && isProductIndexable(product) && (
        <JsonLd data={productJsonLd(product, t('home'))} />
      )}
      <ProductDetail productId={id} initialProduct={product} />
      {landing?.status === 'ok' && (
        <div className="mx-auto max-w-[1200px] bg-surface-page px-4 pb-24 md:pb-10">
          <LandingLinks
            categorySlug={product.category.slug}
            facets={landing.data.facets}
            limit={10}
          />
        </div>
      )}
    </>
  );
}
