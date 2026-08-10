"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

export default function OrderDetailPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (params.id) fetchOrder();
  }, [isAuthenticated, params.id]);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getOne(Number(params.id));
      setOrder(res.data?.data || res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="bg-gray-50 min-h-screen flex items-center justify-center"><Loader className="w-6 h-6 animate-spin text-gray-600" /></div>;
  }

  if (!order) {
    return <div className="bg-gray-50 min-h-screen flex items-center justify-center"><p className="text-gray-600">Không tìm thấy đơn hàng</p></div>;
  }

  const subTotal = (order.total_amount || 0) - (order.shipping_fee || 0);

  return (
    // Khung trang nay do AccountShell lo.
    // TODO: phần thân dưới đây vẫn dùng lớp Tailwind cũ và bản đồ trạng thái
    // chép tay sai enum — thay bằng OrderStatusBadge ở lượt sau.
    <div>
      <div>
        <nav className="flex mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/profile/orders" className="hover:text-blue-600">Đơn hàng của tôi</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Chi tiết đơn hàng #ORD-{order.id}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800">Sản phẩm ({order.items?.length || 0})</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                        <img loading="lazy" decoding="async" src={item.product_image || '/images/default-product.png'} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{item.product_name}</h4>
                          <span className="font-bold text-gray-900 ml-4">{(Number(item.price_at_purchase || 0) * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                <div className="relative">
                  <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ring-2 ${order.status !== 'cancelled' ? 'bg-blue-500 ring-blue-100' : 'bg-gray-300 ring-gray-100'}`}></div>
                  <div className="text-sm font-bold text-gray-900">Đơn hàng được tạo</div>
                  <div className="text-xs text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : ''}</div>
                </div>
                {order.status !== 'cancelled' && (
                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ring-2 ${order.status === 'pending' ? 'bg-blue-500 ring-blue-100' : 'bg-gray-300 ring-gray-100'}`}></div>
                    <div className="text-sm font-bold text-gray-900">Đã xác nhận</div>
                  </div>
                )}
                {order.status === 'cancelled' && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-100"></div>
                    <div className="text-sm font-bold text-red-600">Đã hủy</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">Địa chỉ nhận hàng</h3>
              <div className="flex flex-col gap-2 text-sm">
                <span className="font-bold text-gray-900">{order.receiver_name || 'N/A'}</span>
                <span className="text-gray-600">{order.receiver_phone || 'N/A'}</span>
                <span className="text-gray-600 block mt-1">{order.shipping_address || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 mb-3 pb-3 border-b border-gray-100">Chi tiết thanh toán</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng tiền hàng</span>
                  <span>{subTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{(order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="font-bold text-xl text-red-600">{Number(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/profile/orders" className="block w-full text-center py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition text-sm shadow-sm">
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
