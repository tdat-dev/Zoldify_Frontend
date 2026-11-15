import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type Facet = { type: string; slug: string; label: string; count: number };

/**
 * Liên kết tới các trang đích của một danh mục. Đây là đường Google đi từ danh mục
 * và món hàng tới trang đích, không có nó thì trang đích chỉ tìm thấy qua sitemap.
 */
export async function LandingLinks({
  categorySlug,
  facets,
  limit = 16,
}: {
  categorySlug: string;
  facets: Facet[];
  limit?: number;
}) {
  if (facets.length === 0) return null;
  const t = await getTranslations('landing');

  return (
    <section aria-labelledby="landing-links" className="rounded-card bg-surface-card p-4">
      <h2 id="landing-links" className="mb-3 text-caption uppercase tracking-wide text-ink-faint">
        {t('browseMore')}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {facets.slice(0, limit).map((f) => (
          <li key={f.slug}>
            <Link
              href={`/${categorySlug}/${f.slug}`}
              className="inline-block rounded-control border border-ink/16 px-3 py-1.5 text-small text-ink transition-colors hover:border-brand hover:text-brand"
            >
              {f.type === 'location' ? t('atPlace', { place: f.label }) : f.label}{' '}
              <span className="tabular-nums text-ink-faint">{f.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
