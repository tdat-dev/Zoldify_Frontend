import { getTranslations } from 'next-intl/server';
import { HomeView } from '@/components/home/HomeView';
import { JsonLd } from '@/components/JsonLd';
import { homeJsonLd } from '@/lib/seo';
import { getHomeData } from '@/lib/server-api';

export default async function HomePage() {
  const [initial, t] = await Promise.all([getHomeData(), getTranslations('seo')]);

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <HomeView initial={initial} heading={t('home')} />
    </>
  );
}
