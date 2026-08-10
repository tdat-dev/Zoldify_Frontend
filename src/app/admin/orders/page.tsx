'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingCart, Eye, Loader2, Search, ChevronDown, MapPin, Phone, User as UserIcon, Package, X, Clock, Truck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';
import BackButton from '@/components/BackButton';
import { formatPrice, imageUrl } from '@/lib/format';
import { ORDER_STATUSES, orderStatusTone, type OrderStatus } from '@/lib/order-status';
import { TONE_CLASS } from '@/lib/status-tone';

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  price: number | string;
  quantity: number;
  subtotal: number | string;
  product?: { id: number; name: string; image?: string };
}

/**
 * Ten truong PHAI khop backend: API tra ve `order_code` va `discount_amount`,
 * khong phai `code` va `discount`. Frontend khai sai ten nen ca hai luon
 * undefined:
 *
 *  - Cot "Ma DH" o bang quan tri hien rong vinh vien.
 *  - O tim kiem cua trang don nguoi ban goi `orderCode(o).toLowerCase()` tren
 *    undefined -> nem TypeError ngay ky tu dau tien.
 *
 * Giu ca hai ten va doc theo thu tu uu tien, de neu backend doi lai thi khong vo.
 */
interface Order {
  id: number;
  order_code?: string;
  code?: string;
  total_amount: number | string;
  shipping_fee: number | string;
  discount_amount?: number | string;
  discount?: number | string;
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

/**
 * Nhãn và màu lấy từ nguồn chung (src/lib/order-status.ts) thay vì chép tay.
 *
 * Bản trước là BẢN SAO THỨ TƯ của bộ trạng thái đơn, và nó tự khai một type
 * riêng thiếu `processing` lẫn `refunded`. Hậu quả không chỉ là nhãn sai:
 * STATUS_OPTIONS vừa là danh sách lọc VỪA là danh sách trong ô chọn để admin
 * đổi trạng thái đơn — nên admin KHÔNG THỂ chuyển đơn sang "đang chuẩn bị
 * hàng" hay đánh dấu "đã hoàn tiền". Hai trạng thái backend không với tới được
 * từ giao diện quản trị. Đơn đang ở hai trạng thái đó cũng tra ra `undefined`
 * trong bảng nhãn và hiện ra ô trống.
 *
 * Thêm: `delivered` ở đây từng là "Hoàn thành" trong khi phía người mua là
 * "Đã giao" — cùng một trạng thái, hai cái tên.
 */
const STATUS_OPTIONS = ORDER_STATUSES;

/** Bảng đếm rỗng dựng từ chính danh sách trạng thái, không liệt kê tay. */
const emptyCounts = () =>
  Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;


/** Ma don hien cho nguoi doc. Khong co ma thi dung so thu tu, khong de trong. */
function orderCode(o: Order): string {
  return o.order_code || o.code || `#${o.id}`;
}

function orderDiscount(o: Order): number {
  return Number(o.discount_amount ?? o.discount ?? 0);
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const tStatus = useTranslations('orderStatus');
  const statusClass = (s: unknown) => TONE_CLASS[orderStatusTone(s)];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>(emptyCounts);

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
      toast(err.response?.data?.message || t('ordLoadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const counts = emptyCounts();
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
      toast(t('ordUpdated', { status: tStatus(newStatus) }), 'success');
      fetchStatusCounts();
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));
    } catch (err: any) {
      const msg = err.response?.data?.message || t('ordUpdateFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (v: number | string) => formatPrice(v);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  };

  // Thẻ đếm cho cả BẢY trạng thái, không phải năm. Trạng thái nào không đếm
  // được thì vẫn phải hiện — số 0 là thông tin, còn thiếu hẳn thẻ thì admin
  // không biết trạng thái đó tồn tại.
  const statusCards = ORDER_STATUSES.map((key) => ({ key, tone: orderStatusTone(key) }));

  return (
    <div className="p-6 max-w-7xl mx-auto bg-surface-page min-h-screen">
      <BackButton />
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('ordTitle')}</h1>
          <p className="text-ink-muted text-small mt-1">
            {loading ? tc('loading') : t('ordCount', { count: meta.total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-4 py-2 text-small rounded-control border font-medium ${
              !statusFilter ? 'bg-brand text-white border-brand' : 'bg-surface-card text-ink-muted border-ink/16 hover:bg-surface-page'
            }`}
          >
            {t('ordAll')}
          </button>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-ink/16 rounded-control text-small focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface-card"
          >
            <option value="">{t('ordFilter')}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{tStatus(s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 xl:grid-cols-7">
        {statusCards.map((c) => (
          <button
            type="button"
            key={c.key}
            aria-pressed={statusFilter === c.key}
            onClick={() => { setStatusFilter(c.key); setPage(1); }}
            className={`rounded-control p-4 text-left transition ${TONE_CLASS[c.tone]} ${
              statusFilter === c.key ? 'ring-2 ring-brand' : 'hover:opacity-90'
            }`}
          >
            <div className="text-caption font-medium">{tStatus(c.key)}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{statusCounts[c.key]}</div>
          </button>
        ))}
      </div>

      <div className="bg-surface-card rounded-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{t('ordLoading')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-page border-b">
              <tr>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colOrderCode')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colBuyer')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colReceiver')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colTotal')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colPayment')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colStatus')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colCreated')}</th>
                <th className="text-center py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <ShoppingCart className="w-12 h-12 mx-auto text-ink-faint mb-3" />
                    <p>{t('ordEmpty')}</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-page transition">
                    <td className="py-4 px-6">
                      <span className="font-mono text-small font-medium text-ink">{orderCode(order)}</span>
                      <div className="text-caption text-ink-muted mt-0.5">{t('ordItems', { count: order.items?.length || 0 })}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-small font-medium text-ink">{order.user?.full_name || '—'}</div>
                      <div className="text-caption text-ink-muted">{order.user?.email || '—'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-small text-ink">{order.receiver_name}</div>
                      <div className="text-caption text-ink-muted">{order.receiver_phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-small font-semibold text-red-600">{formatCurrency(order.final_amount)}</div>
                      {Number(order.shipping_fee) > 0 && (
                        <div className="text-caption text-ink-muted">ship: {formatCurrency(order.shipping_fee)}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-caption px-2 py-1 rounded-full bg-surface-sunken text-ink">
                        {order.payment_method?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none cursor-pointer pr-7 pl-3 py-1.5 rounded-full text-caption font-medium border-0 focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                            statusClass(order.status)
                          } ${updatingId === order.id ? 'opacity-50' : ''}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{tStatus(s)}</option>
                          ))}
                        </select>
                        {updatingId === order.id ? (
                          <Loader2 className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 animate-spin" />
                        ) : (
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-small text-ink-muted whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-2 text-blue-500 hover:bg-brand-tint rounded-control transition"
                          title={t('viewDetail')}
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
            className="px-3 py-1.5 border rounded-control text-small disabled:opacity-50 hover:bg-surface-page"
          >
            {t('prev')}
          </button>
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); fetchOrders(p); }}
              className={`w-9 h-9 rounded-control text-small font-medium ${
                p === meta.current
                  ? 'bg-brand text-white'
                  : 'bg-surface-card text-ink-muted hover:bg-surface-sunken border'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => { setPage(page + 1); fetchOrders(page + 1); }}
            disabled={page === meta.pages}
            className="px-3 py-1.5 border rounded-control text-small disabled:opacity-50 hover:bg-surface-page"
          >
            Sau
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
          <div
            className="bg-surface-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-surface-card border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">{t('ordDetail')}</h2>
                <p className="text-small text-ink-muted font-mono">{orderCode(viewingOrder)}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 hover:bg-surface-sunken rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-full text-small font-medium ${statusClass(viewingOrder.status)}`}>
                  {tStatus(viewingOrder.status)}
                </span>
                <div className="text-right">
                  <div className="text-caption text-ink-muted">{t('placedAt')}</div>
                  <div className="text-small text-ink">{formatDate(viewingOrder.created_at)}</div>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-surface-page rounded-control p-4">
                <h3 className="text-small font-semibold text-ink mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> {t('customer')}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-small">
                  <div>
                    <div className="text-ink-muted text-caption">{t('account')}</div>
                    <div className="font-medium">{viewingOrder.user?.full_name || '—'}</div>
                    <div className="text-caption text-ink-muted">{viewingOrder.user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Receiver */}
              <div className="bg-surface-page rounded-control p-4">
                <h3 className="text-small font-semibold text-ink mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {t('shipTo')}
                </h3>
                <div className="space-y-2 text-small">
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 text-ink-muted mt-0.5" />
                    <div>
                      <div className="font-medium">{viewingOrder.receiver_name}</div>
                      <div className="text-caption text-ink-muted flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {viewingOrder.receiver_phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-ink-muted mt-0.5" />
                    <div className="text-ink">
                      {viewingOrder.shipping_address}
                      {(viewingOrder.district || viewingOrder.province) && (
                        <div className="text-caption text-ink-muted">
                          {[viewingOrder.district, viewingOrder.province].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  {viewingOrder.note && (
                    <div className="text-caption text-ink-muted italic border-l-2 border-ink/16 pl-2">
                      {t('note', { note: viewingOrder.note })}
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-small font-semibold text-ink mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> {t('itemsIn', { count: viewingOrder.items?.length || 0 })}
                </h3>
                <div className="space-y-2">
                  {viewingOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-control">
                      <div className="w-14 h-14 rounded-control bg-surface-sunken overflow-hidden flex-shrink-0">
                        {item.product?.image || item.product_image ? (
                          <img
                            src={imageUrl(item.product?.image || item.product_image) || ''}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-muted">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-small font-medium text-ink line-clamp-1">{item.product_name}</div>
                        <div className="text-caption text-ink-muted">SL: {item.quantity} × {formatCurrency(item.price)}</div>
                      </div>
                      <div className="text-small font-semibold text-ink">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2 text-small">
                <div className="flex justify-between text-ink-muted">
                  <span>{t('subtotal')}</span>
                  <span>{formatCurrency(viewingOrder.total_amount)}</span>
                </div>
                {Number(orderDiscount(viewingOrder)) > 0 && (
                  <div className="flex justify-between text-ink-muted">
                    <span>{t('discount')}</span>
                    <span className="text-green-700">-{formatCurrency(orderDiscount(viewingOrder))}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-muted">
                  <span>{t('shippingFee')}</span>
                  <span>{Number(viewingOrder.shipping_fee) > 0 ? formatCurrency(viewingOrder.shipping_fee) : t('free')}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-ink pt-2 border-t">
                  <span>{t('total')}</span>
                  <span className="text-red-600">{formatCurrency(viewingOrder.final_amount)}</span>
                </div>
                <div className="text-caption text-ink-muted pt-1">
                  {t('paidBy')} <span className="font-medium">{viewingOrder.payment_method?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
