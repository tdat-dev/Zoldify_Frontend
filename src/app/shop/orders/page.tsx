'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Search, X, Package, MapPin, Phone, User as UserIcon, Eye, CheckCircle2, XCircle, Truck, Clock, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';
import { formatPrice, imageUrl } from '@/lib/format';
import { ORDER_FLOW, ORDER_STATUSES, flowIndex, orderStatusTone, type OrderStatus } from '@/lib/order-status';
import { TONE_CLASS } from '@/lib/status-tone';

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  price: number | string;
  quantity: number;
  subtotal: number | string;
  product?: { id: number; name: string; image?: string; seller_id?: number };
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
  tracking_code?: string;
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

/**
 * Nhãn và màu lấy từ nguồn chung (src/lib/order-status.ts).
 *
 * Đây là BẢN SAO THỨ NĂM của bộ trạng thái đơn từng bị chép tay, và cũng thiếu
 * `processing` lẫn `refunded` như bốn bản kia.
 */
const TABS: { key: string; status?: OrderStatus }[] = [
  { key: 'all' },
  ...ORDER_STATUSES.map((s) => ({ key: s, status: s })),
];

/**
 * Bước tiếp theo trên chuỗi trạng thái, null nếu đã hết chuỗi.
 *
 * Bản trước tính bước kế bằng `order.status === 'pending' ? 'confirmed' :
 * 'shipping'`. Hai hậu quả:
 *
 *  - `processing` bị bỏ qua hoàn toàn, người bán không đánh dấu "đang chuẩn bị
 *    hàng" được.
 *  - Đơn đang ở `shipping` thì biểu thức trả về đúng `shipping` — bấm nút là
 *    một lệnh PATCH không đổi gì, xong hiện toast "Đã chuyển sang: Đang giao".
 *    Một thông báo thành công cho việc không xảy ra. Nghĩa là NGƯỜI BÁN KHÔNG
 *    BAO GIỜ ĐÁNH DẤU ĐƯỢC ĐƠN ĐÃ GIAO — đơn kẹt ở "đang giao" vĩnh viễn.
 */
function nextInFlow(status: unknown): OrderStatus | null {
  const i = flowIndex(status);
  if (i === -1 || i >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1];
}

export default function ShopOrdersPage() {
  const { toast } = useToast();
  const tStatus = useTranslations('orderStatus');
  const tShort = useTranslations('orderStatusShort');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Order | null>(null);

  const fetchOrders = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params: any = { as: 'seller', currentPage: p, limit: 20 };
      const tab = TABS.find((t) => t.key === activeTab);
      if (tab?.status) params.status = tab.status;
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
  }, [activeTab, toast]);

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [fetchOrders]);

  const handleConfirmShip = async (order: Order) => {
    const nextStatus = nextInFlow(order.status);
    if (!nextStatus) return;
    setActionLoading(order.id);
    try {
      await http.patch(`/orders/${order.id}/status`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      );
      toast(`Đã chuyển sang: ${tStatus(nextStatus)}`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Cập nhật thất bại';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    const order = confirmCancel;
    setConfirmCancel(null);
    setActionLoading(order.id);
    try {
      await http.patch(`/orders/${order.id}/cancel`);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' as OrderStatus } : o))
      );
      toast('Đã hủy đơn hàng', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Hủy đơn thất bại';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (v: number | string) => formatPrice(v);
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  };

  const filteredOrders = search
    ? orders.filter((o) =>
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        o.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
        o.items?.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase()))
      )
    : orders;

  // Địa chỉ backend viết cứng ở đây từng là `http://localhost:3000/` — lên môi
  // trường thật là ảnh chết hết. Nay dùng imageUrl() chung.
  const getImageSrc = imageUrl;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Đơn hàng của shop</h1>
          <p className="text-gray-600 text-sm mt-1">{loading ? 'Đang tải...' : `${meta.total} đơn hàng`}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setPage(1); }}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {t.status ? tShort(t.status) : 'Tất cả'}
              </button>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên người nhận, sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500"
              />
            </div>
            <Link
              href="/product/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm whitespace-nowrap"
            >
              + Đăng bán mới
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Đang tải đơn hàng...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-600">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Chưa có đơn hàng nào</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="font-bold text-blue-600">{order.code}</span>
                        <span className="text-xs text-gray-600">{formatDate(order.created_at)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TONE_CLASS[orderStatusTone(order.status)]}`}>
                          {tStatus(order.status)}
                        </span>
                        {order.tracking_code && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            GHN: {order.tracking_code}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {order.payment_method?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-red-600">
                        {formatCurrency(order.final_amount)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {getImageSrc(item.product?.image || item.product_image) ? (
                              <img
                                src={getImageSrc(item.product?.image || item.product_image)!}
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
                            <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-600">x{item.quantity} · {formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>
                      {/* Nút chỉ hiện khi CÒN bước tiếp theo, và nói rõ nó
                          chuyển đơn sang trạng thái nào. Bản cũ hiện nút cho cả
                          đơn đang giao rồi gửi một lệnh không đổi gì. */}
                      {nextInFlow(order.status) && (
                        <button
                          onClick={() => handleConfirmShip(order)}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          {tShort(nextInFlow(order.status)!)}
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          onClick={() => setConfirmCancel(order)}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 border border-red-300 text-red-700 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {meta.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => { setPage(page - 1); fetchOrders(page - 1); }}
              disabled={page === 1}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 bg-white"
            >
              Trước
            </button>
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => { setPage(p); fetchOrders(p); }}
                className={`w-9 h-9 rounded-md text-sm font-medium ${
                  p === meta.current ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => { setPage(page + 1); fetchOrders(page + 1); }}
              disabled={page === meta.pages}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 bg-white"
            >
              Sau
            </button>
          </div>
        )}
      </div>

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
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${TONE_CLASS[orderStatusTone(viewingOrder.status)]}`}>
                  {tStatus(viewingOrder.status)}
                </span>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Ngày đặt</div>
                  <div className="text-sm text-gray-800">{formatDate(viewingOrder.created_at)}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Khách hàng
                </h3>
                <div className="text-sm space-y-1">
                  <div className="font-medium">{viewingOrder.user?.full_name || '—'}</div>
                  <div className="text-xs text-gray-600">{viewingOrder.user?.email || ''}</div>
                </div>
              </div>

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

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Sản phẩm ({viewingOrder.items?.length || 0})
                </h3>
                <div className="space-y-2">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {getImageSrc(item.product?.image || item.product_image) ? (
                          <img
                            src={getImageSrc(item.product?.image || item.product_image)!}
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
                      <div className="text-sm font-semibold text-gray-800">{formatCurrency(item.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span><span>{formatCurrency(viewingOrder.total_amount)}</span>
                </div>
                {Number(viewingOrder.discount) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá</span><span className="text-green-700">-{formatCurrency(viewingOrder.discount)}</span>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmCancel(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-lg font-bold text-gray-800">Hủy đơn hàng</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Bạn có chắc muốn hủy đơn <span className="font-mono font-semibold">{confirmCancel.code}</span>?
                  {confirmCancel.user && (
                    <> Khách hàng <span className="font-medium">{confirmCancel.user.full_name}</span> sẽ được hoàn tiền (nếu đã thanh toán).</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(null)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Không
              </button>
              <button onClick={handleCancel} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                Hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
