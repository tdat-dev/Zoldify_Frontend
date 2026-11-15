import type { Metadata } from 'next';

/**
 * Trang kết quả tìm kiếm không vào Google: mỗi từ khoá là một URL, ai cũng tạo
 * được vô số trang mỏng. Dùng `noindex` và KHÔNG chặn trong robots.txt, không
 * thì Google không đọc được thẻ này. `follow` để vẫn đi theo link tới món hàng.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
