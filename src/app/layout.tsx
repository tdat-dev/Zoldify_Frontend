import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
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

/**
 * generateMetadata thay cho hằng `metadata`: tiêu đề và mô tả phải theo ngôn
 * ngữ người đang xem. Viết cứng tiếng Việt ở đây thì tab trình duyệt và thẻ
 * chia sẻ lên Facebook/Zalo luôn là tiếng Việt, kể cả khi cả trang đang tiếng
 * Anh — và thẻ chia sẻ là thứ người CHƯA vào site nhìn thấy đầu tiên.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      // Trang con đặt title riêng sẽ tự nối đuôi thương hiệu, không phải lặp tay.
      template: "%s — Zoldify",
    },
    description,
    openGraph: {
      type: "website",
      siteName: "Zoldify",
      title,
      description,
      images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/media/og.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // lang phải theo ngôn ngữ đang hiển thị, không gán cứng "vi": trình đọc màn
  // hình chọn giọng đọc theo thuộc tính này, và trình duyệt dùng nó để gợi ý dịch.
  const locale = await getLocale();
  const messages = await getMessages();
  const tc = await getTranslations("meta");

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
                <a href="#main" className="skip-link">{tc("skipToContent")}</a>
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

