'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Eye, Loader2, Search, ChevronDown, MapPin, Phone, User as UserIcon, Package, X, Clock, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';
import BackButton from '@/components/BackButton';

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  price: number | string;
  quantity: number;
  subtotal: number | string;
  product?: { id: number; name: string; image?: string };
}

interface Order {
  id: number;
  code: string;
  total_amount: number | string;
  shipping_fee: number | string;
  discount: number | string;
  final_amount: number | string;
  status: OrderStatus;
  payment_method: string;
  payment_status?: string;
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  province?: string;
  district?: string;
  note?: string;
  created_at: string;
  user?: { id: number; full_name: string; email: string; phone_number?: string };
  items: OrderItem[];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipping: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>({
    pending: 0, confirmed: 0, shipping: 0, delivered: 0, cancelled: 0,
  });

  const fetchOrders = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { currentPage: p, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await http.get('/orders', { params });
      const data = res.data?.data || res.data;
      setOrders(data?.result || []);
      setMeta(data?.meta || { current: 1, pageSize: 20, total: 0, pages: 0 });
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || 'Lỗi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const counts: Record<OrderStatus, number> = { pending: 0, confirmed: 0, shipping: 0, delivered: 0, cancelled: 0 };
      await Promise.all(
        STATUS_OPTIONS.map(async (s) => {
          const res = await http.get('/orders', { params: { status: s, limit: 1, currentPage: 1 } });
          const data = res.data?.data || res.data;
          counts[s] = data?.meta?.total ?? 0;
        })
      );
      setStatusCounts(counts);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [statusFilter, fetchOrders]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await http.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast(`Đã cập nhật trạng thái: ${STATUS_LABELS[newStatus]}`, 'success');
      fetchStatusCounts();
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (v: number | string) => {
    const n = Number(v) || 0;
    return n.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  };

  const statusCards: { key: OrderStatus; label: string; bg: string; text: string }[] = [
    { key: 'pending', label: 'Chờ xử lý', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
    { key: 'confirmed', label: 'Đã xác nhận', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    { key: 'shipping', label: 'Đang giao', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    { key: 'delivered', label: 'Hoàn thành', bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
    { key: 'cancelled', label: 'Đã hủy', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <BackButton />
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-gray-600 text-sm mt-1">
            {loading ? 'Đang tải...' : `Tổng cộng ${meta.total} đơn hàng`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-4 py-2 text-sm rounded-lg border font-medium ${
              !statusFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Lọc theo trạng thái...</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {statusCards.map((c) => (
          <div
            key={c.key}
            onClick={() => { setStatusFilter(c.key); setPage(1); }}
            className={`p-4 rounded-lg border cursor-pointer transition ${
              statusFilter === c.key ? `${c.bg} ring-2 ring-blue-400` : `${c.bg} hover:shadow-md`
            }`}
          >
            <div className={`text-xs font-medium ${c.text}`}>{c.label}</div>
            <div className={`text-2xl font-bold mt-1 ${c.text}`}>{statusCounts[c.key]}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Mã ĐH</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Người mua</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Người nhận</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Thanh toán</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Ngày tạo</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-600">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Không có đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-medium text-gray-800">{order.code}</span>
                      <div className="text-xs text-gray-600 mt-0.5">{order.items?.length || 0} sản phẩm</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-800">{order.user?.full_name || '—'}</div>
                      <div className="text-xs text-gray-600">{order.user?.email || '—'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-800">{order.receiver_name}</div>
                      <div className="text-xs text-gray-600">{order.receiver_phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-red-600">{formatCurrency(order.final_amount)}</div>
                      {Number(order.shipping_fee) > 0 && (
                        <div className="text-xs text-gray-600">ship: {formatCurrency(order.shipping_fee)}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {order.payment_method?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none cursor-pointer pr-7 pl-3 py-1.5 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            STATUS_STYLES[order.status]
                          } ${updatingId === order.id ? 'opacity-50' : ''}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        {updatingId === order.id ? (
                          <Loader2 className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 animate-spin" />
                        ) : (
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => { setPage(page - 1); fetchOrders(page - 1); }}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Trước
          </button>
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); fetchOrders(p); }}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                p === meta.current
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => { setPage(page + 1); fetchOrders(page + 1); }}
            disabled={page === meta.pages}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng</h2>
                <p className="text-sm text-gray-600 font-mono">{viewingOrder.code}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_STYLES[viewingOrder.status]}`}>
                  {STATUS_LABELS[viewingOrder.status]}
                </span>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Ngày đặt</div>
                  <div className="text-sm text-gray-800">{formatDate(viewingOrder.created_at)}</div>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600 text-xs">Tài khoản</div>
                    <div className="font-medium">{viewingOrder.user?.full_name || '—'}</div>
                    <div className="text-xs text-gray-600">{viewingOrder.user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Receiver */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Thông tin nhận hàng
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div>
                      <div className="font-medium">{viewingOrder.receiver_name}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {viewingOrder.receiver_phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 mt-0.5" />
                    <div className="text-gray-700">
                      {viewingOrder.shipping_address}
                      {(viewingOrder.district || viewingOrder.province) && (
                        <div className="text-xs text-gray-600">
                          {[viewingOrder.district, viewingOrder.province].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  {viewingOrder.note && (
                    <div className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-2">
                      Ghi chú: {viewingOrder.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Sản phẩm ({viewingOrder.items?.length || 0})
                </h3>
                <div className="space-y-2">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.product?.image || item.product_image ? (
                          <img
                            src={(item.product?.image || item.product_image || '').startsWith('http') ? (item.product?.image || item.product_image || '') : `http://localhost:3000/${item.product?.image || item.product_image}`}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 line-clamp-1">{item.product_name}</div>
                        <div className="text-xs text-gray-600">SL: {item.quantity} × {formatCurrency(item.price)}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(viewingOrder.total_amount)}</span>
                </div>
                {Number(viewingOrder.discount) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá</span>
                    <span className="text-green-600">-{formatCurrency(viewingOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí ship</span>
                  <span>{Number(viewingOrder.shipping_fee) > 0 ? formatCurrency(viewingOrder.shipping_fee) : 'Miễn phí'}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatCurrency(viewingOrder.final_amount)}</span>
                </div>
                <div className="text-xs text-gray-600 pt-1">
                  Thanh toán: <span className="font-medium">{viewingOrder.payment_method?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
