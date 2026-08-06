import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/Toast";

const archivo = Archivo({
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
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
      <body className={`${archivo.variable} font-sans`}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <a href="#main" className="skip-link">Tới nội dung chính</a>
              <div className="min-h-screen bg-gray-50 flex flex-col">
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

