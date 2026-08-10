"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Cổng đăng nhập cho các trang chỉ dành cho người đã đăng nhập.
 *
 * Trước đây mỗi trang tự viết `if (!isAuthenticated) { router.push('/login') }`
 * ngay trong effect nạp dữ liệu — 13 bản chép tay. Chúng chỉ đúng nhờ một tác
 * dụng phụ: AuthProvider trả về null trong lúc đọc localStorage, nên các trang
 * này không hề render trước khi biết trạng thái đăng nhập. Cái giá của tác dụng
 * phụ đó là toàn site không server-render gì cả.
 *
 * Bỏ được `return null` thì phải trả lại cái nó đang che: chờ `authReady` rồi
 * mới kết luận. Trả về `allowed` để trang dùng làm điều kiện nạp dữ liệu — ba
 * trạng thái (chưa biết / không được vào / được vào) không nhét vừa một boolean.
 *
 * Dùng replace chứ không push: người bị đá về /login mà bấm Quay lại sẽ quay
 * đúng vào trang vừa bị chặn rồi lại bị đá tiếp, kẹt vòng.
 */
export function useRequireAuth() {
  const { authReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !isAuthenticated) router.replace('/login');
  }, [authReady, isAuthenticated, router]);

  return {
    authReady,
    isAuthenticated,
    /** Đã biết chắc là đăng nhập rồi — an toàn để gọi API cần token. */
    allowed: authReady && isAuthenticated,
  };
}
