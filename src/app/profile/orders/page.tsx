"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Package, Wallet, Loader, ShoppingBasket, ShoppingBag } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  pending_payment: 'Chờ thanh toán',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipping: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function UserOrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast, confirm } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchOrders();
  }, [isAuthenticated, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeTab !== 'all') params.status = activeTab;
      const res = await orderService.getAll(1, 20, activeTab === 'all' ? undefined : activeTab);
      setOrders(res.data?.data?.result || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id: number) => {
    const ok = await confirm('Bạn có chắc muốn hủy đơn hàng này?');
    if (!ok) return;
    try {
      await orderService.cancel(id);
      fetchOrders();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Hủy đơn thất bại', 'error');
    }
  };

  const handlePayment = async (id: number, total: number) => {
    const ok = await confirm(`Xác nhận thanh toán ${total.toLocaleString('vi-VN')}đ qua Ví Zoldify?`);
    if (!ok) return;
    try {
      await orderService.updateStatus(id, { status: 'pending' });
      toast('Thanh toán thành công!', 'success');
      fetchOrders();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Thanh toán thất bại', 'error');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between overflow-x-auto">
           <div className="flex gap-4">
             <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
               <User className="w-4 h-4" /> Thông tin cá nhân
             </Link>
             <Link href="/profile/orders" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md whitespace-nowrap">
               <Package className="w-4 h-4" /> Đơn hàng
             </Link>
            <Link href="/profile/wallet" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
              <Wallet className="w-4 h-4" /> Ví & Thanh toán
            </Link>
            <Link href="/profile/products" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
              <ShoppingBag className="w-4 h-4" /> Sản phẩm của tôi
            </Link>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['all', 'pending', 'pending_payment', 'shipping', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === status ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-blue-600'}`}
              >
                {status === 'all' ? 'Tất cả' : STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center text-gray-600"><Loader className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-gray-600">
                <ShoppingBasket className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>Bạn chưa có đơn hàng nào.</p>
                <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Mua sắm ngay</Link>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                    <div className="flex gap-3 items-center">
                      <span className="font-bold text-blue-600">#ORD-{order.id}</span>
                      <span className="text-xs text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : ''}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-red-600">
                      {Number(order.total_amount).toLocaleString('vi-VN')}đ
                    </div>
                  </div>

                  {order.items?.slice(0, 2).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 mb-3">
                      <img src={item.product_image || '/images/default-product.png'} alt={item.product_name} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-600">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && <p className="text-xs text-gray-600 mb-3">+{order.items.length - 2} sản phẩm khác</p>}

                  <div className="flex flex-wrap justify-end items-center gap-2">
                    {order.status === 'pending_payment' && (
                      <>
                        <button onClick={() => handleCancel(order.id)} className="px-4 py-2 border border-red-500 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 whitespace-nowrap">Hủy đơn hàng</button>
                        <button onClick={() => handlePayment(order.id, order.total_amount)} className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 whitespace-nowrap">Thanh toán ngay</button>
                      </>
                    )}
                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order.id)} className="px-4 py-2 border border-red-500 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 whitespace-nowrap">Hủy đơn hàng</button>
                    )}
                    <Link href={`/profile/orders/${order.id}`} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 whitespace-nowrap">Chi tiết</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
