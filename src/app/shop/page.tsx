import { permanentRedirect } from 'next/navigation';
import { ShopView } from '@/components/shop/ShopView';
import { shopPath } from '@/lib/public-urls';
import { getShop } from '@/lib/server-api';

/**
 * `/shop` là shop của chính mình. `/shop?seller=ID` là URL cũ của shop người
 * khác, vẫn còn trong app và link đã chia sẻ, nên chuyển về URL mới.
 */
export default async function MyShopPage({
  searchParams,
}: {
  searchParams: { seller?: string };
}) {
  const sellerId = Number(searchParams.seller);
  if (Number.isInteger(sellerId) && sellerId > 0) {
    const shop = await getShop(sellerId);
    permanentRedirect(
      shop.status === 'ok' ? shopPath(shop.data.user) : `/shop/${sellerId}`,
    );
  }

  return <ShopView />;
}
