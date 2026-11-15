import createNextIntlPlugin from 'next-intl/plugin';

/** Locale đọc từ cookie, không từ URL — lý do ghi trong src/i18n/request.ts. */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gói runtime tối giản cho Docker: chỉ .next/standalone + static, bỏ node_modules dev.
  output: 'standalone',
  // Dữ liệu SSR cache trong bộ nhớ, không ghi ra đĩa: mỗi món hàng một file cache
  // sẽ ăn dần đĩa VPS, mà cache này mất khi khởi động lại cũng không sao.
  experimental: { isrFlushToDisk: false },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Danh mục và trang đích đã lên gốc URL. Khai ở đây để URL cũ chuyển ngay, không
  // tốn lượt render. Món hàng không làm được vậy: URL cũ chỉ có ID, phải hỏi API
  // mới biết tên, nên nằm ở app/product/[id].
  async redirects() {
    return [
      { source: '/category/:slug', destination: '/:slug', permanent: true },
      { source: '/category/:slug/:facet', destination: '/:slug/:facet', permanent: true },
    ];
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
