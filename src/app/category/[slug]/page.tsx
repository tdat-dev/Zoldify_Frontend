import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CategoryView } from '@/components/category/CategoryView';
import { JsonLd } from '@/components/JsonLd';
import { categoryJsonLd } from '@/lib/seo';
import { getCategoryBySlug, getCategoryProducts } from '@/lib/server-api';

type Props = { params: { slug: string } };

async function resolveCategory(slug: string) {
  const result = await getCategoryBySlug(slug);
  if (result.status === 'not_found') notFound();
  return result.status === 'ok' ? result.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await resolveCategory(params.slug);
  if (!category) return {};

  const t = await getTranslations('seo');
  const title = t('categoryTitle', { name: category.name });
  const description = t('categoryDesc', { name: category.name });

  return {
    title,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { type: 'website', siteName: 'Zoldify', title, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await resolveCategory(params.slug);
  const products = category ? await getCategoryProducts(category.id) : null;
  const page = products?.status === 'ok' ? products.data : null;
  const t = await getTranslations('category');

  return (
    <>
      {category && page && (
        <JsonLd data={categoryJsonLd(category, page.result, t('breadcrumbHome'))} />
      )}
      <CategoryView
        slug={params.slug}
        initialCategory={category}
        initialProducts={page?.result ?? null}
        initialMeta={page?.meta ?? null}
      />
    </>
  );
}
