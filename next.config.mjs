import createNextIntlPlugin from 'next-intl/plugin';

/** Locale đọc từ cookie, không từ URL — lý do ghi trong src/i18n/request.ts. */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gói runtime tối giản cho Docker: chỉ .next/standalone + static, bỏ node_modules dev.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ảnh /media dùng chung cho cả app mobile (expo-image đặt crossOrigin nên
  // BẮT BUỘC có CORS, nếu không trình duyệt chặn ảnh chéo origin). Mở CORS cho
  // riêng /media — chỉ là ảnh tĩnh công khai nên "*" an toàn.
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
