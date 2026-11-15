import Script from "next/script";

/**
 * Mã đo đọc lúc chạy (biến GA_MEASUREMENT_ID, truyền từ layout) chứ không nhúng
 * lúc build, cùng cách với Firebase: đổi mã không phải build lại, và staging
 * không đặt biến thì không gửi số liệu nào vào báo cáo của prod.
 *
 * Không cần tự gửi page_view khi đổi route: GA4 bật sẵn đo theo lịch sử trình
 * duyệt trong Enhanced Measurement.
 *
 * `lazyOnload`: gtag.js nặng khoảng 175 KB, tải sớm thì tranh luồng chính với trang.
 * Đo Lighthouse mobile trên prod 07/11: trang sản phẩm 47 điểm, chặn gtag thì 73, thời
 * gian chặn luồng chính 840 ms xuống 260 ms. Đánh đổi là mất số liệu của người rời
 * trang trước khi tải xong.
 */
export function GoogleAnalytics({ id }: { id?: string }) {
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="lazyOnload"
      />
      <Script id="ga-init" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
      </Script>
    </>
  );
}
