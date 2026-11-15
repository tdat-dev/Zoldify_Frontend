import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ShopView } from '@/components/shop/ShopView';
import { parseShopId, shopPath } from '@/lib/public-urls';
import { isTestShop } from '@/lib/seo';
import { getShop, getShopProducts } from '@/lib/server-api';

type Props = { params: { seller: string } };

/**
 * API báo không có shop cũng có thể là người bán chưa tạo shop nhưng vẫn có tin
 * đăng, nên chỉ báo 404 khi không có tin nào. Các trang đó vẫn hiện cho người
 * xem, không cho Google index.
 */
async function resolveShop(segment: string) {
  const sellerId = parseShopId(segment);
  if (!sellerId) notFound();

  const [shop, products] = await Promise.all([getShop(sellerId), getShopProducts(sellerId)]);
  const items = products.status === 'ok' ? products.data.result : null;
  if (shop.status === 'not_found' && !items?.length) notFound();

  if (shop.status === 'ok') {
    const path = shopPath(shop.data.user);
    if (segment !== path.split('/').pop()) permanentRedirect(path);
  }
  return { sellerId, shop: shop.status === 'ok' ? shop.data : null, items };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shop } = await resolveShop(params.seller);
  if (!shop) return { robots: { index: false, follow: true } };

  const t = await getTranslations('seo');
  const values = { name: shop.name, count: Number(shop.productCount) || 0 };
  const title = t('shopTitle', values);
  const description = t('shopDesc', values);

  return {
    title,
    description,
    alternates: { canonical: shopPath(shop.user) },
    robots: isTestShop(shop) || !values.count ? { index: false, follow: true } : undefined,
    openGraph: { type: 'website', siteName: 'Zoldify', title, description },
  };
}

export default async function ShopPage({ params }: Props) {
  const { sellerId, shop, items } = await resolveShop(params.seller);

  return <ShopView sellerId={sellerId} initialShop={shop} initialProducts={items} />;
}
