import type { ReactNode } from 'react';
import { AccountNav } from './AccountNav';

/**
 * Khung chung cho mọi trang trong khu tài khoản.
 *
 * Dùng qua hai layout.tsx (một cho /profile/*, một cho /addresses/*) thay vì
 * gộp hai cây vào một route group `(account)`: gộp thì phải di chuyển thư mục,
 * mà /addresses là đường dẫn đã có link trỏ tới từ trang thanh toán và trang
 * thông tin cá nhân. Đổi URL để lấy một layout là cái giá không đáng.
 *
 * Trên mobile thanh điều hướng nằm TRÊN nội dung chứ không ẩn sau nút hamburger:
 * khu tài khoản là nơi người dùng nhảy qua lại giữa đơn hàng, địa chỉ và ví,
 * giấu đường đi ở đây chỉ tăng số lần chạm.
 */
export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[1240px] px-3 py-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="lg:w-[240px] lg:shrink-0">
            <AccountNav />
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
