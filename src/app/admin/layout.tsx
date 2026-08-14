"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, authReady } = useAuth();
  const router = useRouter();

  // Phải chờ authReady rồi mới đá đi. Trước đây điều này đúng nhờ AuthProvider
  // không render gì cho tới khi đọc xong localStorage; bỏ được cái đó thì phải
  // kiểm tường minh, không thì admin nào tải lại trang cũng bị văng về /login.
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user && user.role !== 'admin') {
      router.replace('/');
    }
  }, [authReady, isAuthenticated, user, router]);

  if (!authReady || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null; // will redirect
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}