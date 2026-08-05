"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notification.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Bell, Loader, CheckCheck, Trash2, ArrowLeft, MessageSquare, ShoppingBag, CreditCard } from 'lucide-react';

const typeIcons: Record<string, any> = {
  order_status: ShoppingBag,
  message: MessageSquare,
  payment: CreditCard,
  system: Bell,
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { confirm, toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchNotis();
  }, [isAuthenticated]);

  const fetchNotis = async () => {
    try {
      const res = await notificationService.getAll(1, 50);
      setNotifications(res.data?.data?.result || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm('Xóa thông báo này?');
    if (!ok) return;
    try {
      await notificationService.remove(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast('Đã xóa thông báo', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Xóa thất bại', 'error');
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[800px] mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <span>&gt;</span>
          <span className="text-gray-800">Thông báo</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-800">Thông báo</h1>
          <button onClick={handleMarkAllRead} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <CheckCheck className="w-4 h-4" /> Đánh dấu đã đọc
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-600" /></div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có thông báo</h3>
            <p className="text-gray-600">Bạn sẽ nhận được thông báo khi có đơn hàng hoặc tin nhắn mới</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((noti: any) => {
              const Icon = typeIcons[noti.type] || Bell;
              return (
                <div
                  key={noti.id}
                  className={`bg-white rounded-lg shadow-sm p-4 flex gap-4 items-start transition-colors ${!noti.is_read ? 'border-l-4 border-brand bg-blue-50/30' : ''}`}
                >
                  <div className={`p-2 rounded-full flex-shrink-0 ${!noti.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${!noti.is_read ? 'text-brand' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !noti.is_read && handleMarkRead(noti.id)}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!noti.is_read ? 'font-bold text-gray-800' : 'text-gray-700'}`}>{noti.title}</h4>
                      <span className="text-[10px] text-gray-600 flex-shrink-0 ml-2">{formatTime(noti.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{noti.content}</p>
                    {noti.data?.order_code && (
                      <Link href={`/profile/orders/${noti.data.order_id}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                        Xem đơn hàng
                      </Link>
                    )}
                    {noti.data?.conversation_id && (
                      <Link href="/chat" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                        Mở chat
                      </Link>
                    )}
                  </div>
                  <button onClick={() => handleDelete(noti.id)} className="p-1 text-gray-300 hover:text-red-600 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-brand transition-colors inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
