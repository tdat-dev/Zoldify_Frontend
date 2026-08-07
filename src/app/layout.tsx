import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AnnounceBar } from "@/components/AnnounceBar";
import Footer from "@/components/Footer";
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

export const metadata: Metadata = {
  title: "Zoldify - Nền tảng mua bán đồ cũ",
  description: "Zoldify - Nền tảng mua bán đồ cũ cho sinh viên",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* className: áp font trực tiếp (cách dùng chuẩn của next/font, không phụ
          thuộc Tailwind sinh utility). variable: để token --font-bvp dùng được
          trong CSS. Thiếu className thì cả trang rơi về Times New Roman. */}
      <body className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <a href="#main" className="skip-link">Tới nội dung chính</a>
              <div className="flex min-h-screen flex-col">
                <AnnounceBar />
                <Header />
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

