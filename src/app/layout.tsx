import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { AnnounceBar } from "@/components/AnnounceBar";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/Toast";

// Be Vietnam Pro thay Inter: tiêu đề sản phẩm tiếng Việt xuống 2 dòng ở 13-14px
// trong lưới dày, dấu chồng (ữ, ề, ộ) ở cỡ đó là chỗ font Latin-first vỡ.
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-bvp",
});

/**
 * Trước đây chỉ có title và description, KHÔNG có OpenGraph. Chia sẻ một link
 * Zoldify lên Facebook, Zalo hay Messenger thì ra một ô trống: không ảnh,
 * không mô tả, chỉ mỗi cái URL. Với một sàn mà người ta gửi link món hàng cho
 * nhau suốt thì đó là mất mát thật.
 *
 * public/images/og-default.jpg có sẵn trong repo nhưng chưa bao giờ được tham
 * chiếu ở đâu — và nó vuông 1024x1024, sai tỉ lệ cho thẻ chia sẻ. Ảnh mới là
 * 1200x630, kích thước cả Facebook, Zalo lẫn Twitter đều nhận.
 *
 * metadataBase để Next dựng URL tuyệt đối cho ảnh: trình thu thập của mạng xã
 * hội không hiểu đường dẫn tương đối.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
const TITLE = "Zoldify — Chợ đồ cũ";
const DESCRIPTION =
  "Mua bán đồ cũ còn dùng tốt. Đăng tin miễn phí, xem tận nơi, trả khi nhận hàng.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Trang con đặt title riêng sẽ tự nối đuôi thương hiệu, không phải lặp tay.
    template: "%s — Zoldify",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Zoldify",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/media/og.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // lang phải theo ngôn ngữ đang hiển thị, không gán cứng "vi": trình đọc màn
  // hình chọn giọng đọc theo thuộc tính này, và trình duyệt dùng nó để gợi ý dịch.
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      {/* className: áp font trực tiếp (cách dùng chuẩn của next/font, không phụ
          thuộc Tailwind sinh utility). variable: để token --font-bvp dùng được
          trong CSS. Thiếu className thì cả trang rơi về Times New Roman. */}
      <body className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <a href="#main" className="skip-link">Tới nội dung chính</a>
                {/* Khung (header/footer) do SiteChrome chọn theo route: khu xác
                    thực dùng bản rút gọn, phần còn lại dùng bản đầy đủ. */}
                {/* AnnounceBar dựng ở ĐÂY (phía server) rồi mới đưa xuống: nó
                    là server component async, import thẳng vào SiteChrome sẽ
                    làm trắng mọi trang không-phải-auth. */}
                <SiteChrome announce={<AnnounceBar />}>{children}</SiteChrome>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

