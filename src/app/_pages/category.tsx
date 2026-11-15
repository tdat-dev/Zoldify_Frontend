import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CategoryView } from '@/components/category/CategoryView';
import { LandingLinks } from '@/components/category/LandingLinks';
import { JsonLd } from '@/components/JsonLd';
import { categoryJsonLd } from '@/lib/seo';
import {
  getCategoryBySlug,
  getCategoryProducts,
  getLandingFacets,
  isKnownCategory,
} from '@/lib/server-api';

async function resolveCategory(slug: string) {
  if (!(await isKnownCategory(slug))) notFound();
  const result = await getCategoryBySlug(slug);
  if (result.status === 'not_found') notFound();
  return result.status === 'ok' ? result.data : null;
}

export async function categoryMetadata(slug: string): Promise<Metadata> {
  const category = await resolveCategory(slug);
  if (!category) return {};

  const t = await getTranslations('seo');
  const title = t('categoryTitle', { name: category.name });
  const description = t('categoryDesc', { name: category.name });

  return {
    title,
    description,
    alternates: { canonical: `/${category.slug}` },
    openGraph: { type: 'website', siteName: 'Zoldify', title, description },
  };
}

export async function CategoryScreen({ slug }: { slug: string }) {
  const category = await resolveCategory(slug);
  const products = category ? await getCategoryProducts(category.id) : null;
  const page = products?.status === 'ok' ? products.data : null;
  const landing = await getLandingFacets(slug);
  const t = await getTranslations('category');

  return (
    <>
      {category && page && (
        <JsonLd data={categoryJsonLd(category, page.result, t('breadcrumbHome'))} />
      )}
      <CategoryView
        slug={slug}
        initialCategory={category}
        initialProducts={page?.result ?? null}
        initialMeta={page?.meta ?? null}
      />
      {landing.status === 'ok' && (
        <div className="bg-surface-page px-4 pb-6 lg:px-6">
          <LandingLinks categorySlug={slug} facets={landing.data.facets} />
        </div>
      )}
    </>
  );
}
