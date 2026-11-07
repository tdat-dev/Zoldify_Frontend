import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';
import { LandingLinks } from '@/components/category/LandingLinks';
import { ItemTile } from '@/components/home/ItemTile';
import { JsonLd } from '@/components/JsonLd';
import { formatPrice } from '@/lib/format';
import { landingJsonLd } from '@/lib/seo';
import { getLandingPage, isKnownCategory } from '@/lib/server-api';

type Props = { params: { slug: string; facet: string } };

/**
 * Trang đích: danh mục theo hãng, tầm giá hoặc địa điểm. Backend quyết định trang nào
 * được mở (đủ tin thật, là tập con của danh mục), nên 404 ở đây là đúng luật chứ không
 * phải lỗi. Chỉ hiện tin thật, không có bộ lọc client: đây là trang để vào từ Google.
 */
async function resolvePage(params: Props['params']) {
  if (!(await isKnownCategory(params.slug))) notFound();
  const result = await getLandingPage(params.slug, params.facet);
  if (result.status === 'ok') return result.data;
  // API lỗi cũng là 404: trang này không có đường lùi về client, trả 200 rỗng thì
  // Google nhận một trang mỏng. Google sẽ quay lại thử sau.
  notFound();
}

async function headingOf(page: any) {
  const t = await getTranslations('landing');
  const values = { category: page.category.name, label: page.facet.label };
  if (page.facet.type === 'brand') return t('brandTitle', values);
  if (page.facet.type === 'location') return t('locationTitle', values);
  return t('priceTitle', values);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await resolvePage(params);
  const t = await getTranslations('landing');
  const title = await headingOf(page);
  const description = t('description', {
    title,
    count: page.total,
    min: formatPrice(page.price_min),
    max: formatPrice(page.price_max),
  });

  return {
    title,
    description,
    alternates: { canonical: `/${page.category.slug}/${page.facet.slug}` },
    openGraph: { type: 'website', siteName: 'Zoldify', title, description },
  };
}

export default async function LandingPage({ params }: Props) {
  const page = await resolvePage(params);
  const [t, tc, heading] = await Promise.all([
    getTranslations('landing'),
    getTranslations('category'),
    headingOf(page),
  ]);

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <JsonLd data={landingJsonLd(page, heading, tc('breadcrumbHome'))} />
      <div className="w-full px-4 py-3 lg:px-6">
        <nav
          aria-label={tc('breadcrumbLabel')}
          className="mb-3 flex items-center gap-1 text-small text-ink-muted"
        >
          <Link href="/" className="hover:text-brand">
            {tc('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
          <Link href={`/${page.category.slug}`} className="shrink-0 hover:text-brand">
            {page.category.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
          <span className="truncate text-ink" aria-current="page">
            {page.facet.label}
          </span>
        </nav>

        <h1 className="text-h2 text-ink">{heading}</h1>
        <p className="mt-1 text-small tabular-nums text-ink-muted">
          {t('summary', {
            count: page.total,
            min: formatPrice(page.price_min),
            max: formatPrice(page.price_max),
          })}
        </p>

        <div className="mt-3 rounded-card bg-surface-card p-4">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {page.items.map((item: any) => (
              <li key={item.id}>
                <ItemTile item={item} size="md" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <LandingLinks categorySlug={page.category.slug} facets={page.related} />
        </div>
      </div>
    </div>
  );
}
