import createNextIntlPlugin from 'next-intl/plugin';

/** Locale đọc từ cookie, không từ URL — lý do ghi trong src/i18n/request.ts. */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
