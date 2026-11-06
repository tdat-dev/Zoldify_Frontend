import { SITE_URL } from './config';
import { normalizeCondition } from './product-condition';
import { productPath } from './public-urls';

/**
 * Luật SEO dùng chung cho các trang công khai. Lý do của từng luật ở
 * docs/seo/nghien-cuu-co-che-seo-san.md, mục 4.
 */

/** Đã bán quá mốc này thì không giữ trong Google nữa. Giả định khởi đầu. */
const SOLD_INDEX_DAYS = 60;
const DAY_MS = 86_400_000;

/**
 * Dữ liệu sinh cho bài đo 1 triệu dòng. Không được lọt vào Google: tin giả hàng
 * loạt có thể làm cả site bị đánh giá là nội dung rác. Phải là `noindex`, không
 * chặn trong robots.txt, vì URL bị chặn thì Google không đọc được `noindex`.
 */
export function isTestProduct(p: { slug?: string | null }): boolean {
  return /^sp-1m-/.test(p.slug ?? '');
}

export function isTestShop(s: { slug?: string | null }): boolean {
  return /^shop-1m-/.test(s.slug ?? '');
}

export function productAvailability(p: { status?: string; stock?: unknown }): 'InStock' | 'SoldOut' {
  return p.status === 'active' && Number(p.stock) > 0 ? 'InStock' : 'SoldOut';
}

/**
 * Trang vẫn trả 200 cho người xem trong mọi trường hợp: người mua cần xem lại
 * món đã mua, người bán cần xem tin đang chờ duyệt. Chỉ khác là có cho Google
 * index hay không. App Router cũng không trả được 410 từ trang.
 */
export function isProductIndexable(p: any, now = Date.now()): boolean {
  if (isTestProduct(p)) return false;
  if (p.status !== 'active' && p.status !== 'sold') return false;
  if (productAvailability(p) === 'InStock') return true;
  return now - new Date(p.updated_at).getTime() < SOLD_INDEX_DAYS * DAY_MS;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

function breadcrumbList(items: { name: string; path?: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function productJsonLd(p: any, homeLabel: string) {
  const url = absoluteUrl(productPath(p));
  const images = p.images?.length ? p.images : p.image ? [p.image] : [];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: p.name,
        ...(images.length ? { image: images } : {}),
        ...(p.description ? { description: String(p.description).slice(0, 500) } : {}),
        sku: String(p.id),
        ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
        ...(p.category?.name ? { category: p.category.name } : {}),
        offers: {
          '@type': 'Offer',
          url,
          price: Number(p.price),
          priceCurrency: p.currency || 'VND',
          itemCondition:
            normalizeCondition(p.condition) === 'new'
              ? 'https://schema.org/NewCondition'
              : 'https://schema.org/UsedCondition',
          availability: `https://schema.org/${productAvailability(p)}`,
          ...(p.seller?.full_name
            ? { seller: { '@type': 'Person', name: p.seller.full_name } }
            : {}),
        },
        ...(Number(p.review_count) > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: Number(p.rating_avg),
                reviewCount: Number(p.review_count),
              },
            }
          : {}),
      },
      breadcrumbList([
        { name: homeLabel, path: '/' },
        ...(p.category?.slug
          ? [{ name: p.category.name, path: `/category/${p.category.slug}` }]
          : []),
        { name: p.name },
      ]),
    ],
  };
}

export function categoryJsonLd(category: any, products: any[], homeLabel: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbList([{ name: homeLabel, path: '/' }, { name: category.name }]),
      {
        '@type': 'ItemList',
        name: category.name,
        // Tin thử có noindex, đưa vào danh sách chỉ làm rối tín hiệu.
        itemListElement: products
          .filter((p) => !isTestProduct(p))
          .map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(productPath(p)),
          })),
      },
    ],
  };
}

export function homeJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Zoldify',
        url,
        logo: absoluteUrl('/images/icon.png'),
      },
      {
        '@type': 'WebSite',
        name: 'Zoldify',
        url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${absoluteUrl('/search')}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}
