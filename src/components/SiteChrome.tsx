"use client";

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthHeader } from '@/components/auth/AuthHeader';

/**
 * Chọn bộ khung bao quanh nội dung theo route.
 *
 * VÌ SAO KHÔNG DÙNG ROUTE GROUP: `app/(auth)/layout.tsx` chỉ LỒNG THÊM vào
 * layout gốc chứ không thay được nó. Header, Footer và AnnounceBar đang do
 * layout gốc dựng, nên một layout con không có cách nào gỡ chúng ra. Muốn tách
 * hẳn thì phải nhân đôi cả layout gốc (font, provider, metadata) cho nhánh
 * auth — hai bản sẽ lệch nhau ngay lần sửa provider đầu tiên.
 *
 * Nên chỗ quyết định nằm ở đây, một chỗ, đọc được trong mười giây.
 */
const ROUTE_AUTH = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * `announce` được TRUYỀN VÀO chứ không import.
 *
 * AnnounceBar là server component `async` (nó gọi getTranslations của
 * next-intl/server). Import nó vào file này — một client component — là kéo nó
 * qua ranh giới client, và React ném ngay "async/await is not yet supported in
 * Client Components". Không phải chỉ hỏng cái thanh đó: nó nằm ở layout gốc
 * nên MỌI trang không-phải-auth đều trắng. Trang /login vẫn chạy vì nhánh auth
 * không đụng tới nó — đúng cái làm lỗi này khó đoán khi chỉ nhìn code.
 *
 * Truyền vào dưới dạng prop thì phần tử được dựng ở phía server rồi mới giao
 * xuống, client chỉ quyết định có đặt nó vào cây hay không. Đổi lại, server vẫn
 * dựng nó cả trên trang auth dù không hiện — một thanh chữ, đổi lấy việc không
 * phải nhân đôi layout gốc.
 */
export function SiteChrome({
  children,
  announce,
}: {
  children: ReactNode;
  announce: ReactNode;
}) {
  const pathname = usePathname();
  const laAuth = ROUTE_AUTH.includes(pathname);

  if (laAuth) {
    // Không AnnounceBar, không Footer: cả hai đều mời người dùng đi chỗ khác,
    // mà trang này có đúng một việc cần xong.
    return (
      <div className="flex min-h-screen flex-col">
        <AuthHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {announce}
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
