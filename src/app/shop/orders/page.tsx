'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Search, Package, Eye, CheckCircle2, XCircle, Truck, Clock, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';
import { ListingsPanel } from '@/components/seller/ListingsPanel';
import { ShipmentPanel, thieuVanDon } from '@/components/seller/ShipmentPanel';
import { AccountShell } from '@/components/account/AccountShell';
import { formatPrice, imageUrl } from '@/lib/format';
import { ORDER_STATUSES, nextStatusFor, orderStatusTone, type OrderStatus } from '@/lib/order-status';
import { TONE_CLASS } from '@/lib/status-tone';
import { SellerOrderDetail } from '@/components/seller/SellerOrderDetail';
import {
  formatDate,
  isMultiSeller,
  orderCode,
  sellerSubtotal,
  type Order,
} from '@/components/seller/seller-order';


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
 * Bước kế mà NGƯỜI BÁN được phép đặt — soi bảng phân quyền của backend qua
 * nextStatusFor(), không đi mù theo chuỗi trạng thái.
 *
 * Bản trước tính bằng `order.status === 'pending' ? 'confirmed' : 'shipping'`:
 * bỏ qua `processing`, và đơn đang `shipping` thì trả về đúng `shipping` — một
 * lệnh PATCH không đổi gì, xong hiện toast "Đã chuyển sang: Đang giao".
 *
 * Bản sau đó đi theo ORDER_FLOW nên lại mời người bán bấm "Đã giao" trên đơn
 * đang giao. Backend từ chối 403: delivered là lệnh nhả tiền ký quỹ cho chính
 * người bán, chỉ NGƯỜI MUA mới xác nhận được. Đo được bằng phép chạy trọn vòng.
 */
function nextInFlow(status: unknown): OrderStatus | null {
  return nextStatusFor(status, 'seller');
}



export default function ShopOrdersPage() {
  const { toast } = useToast();
  const tStatus = useTranslations('orderStatus');
  const tShort = useTranslations('orderStatusShort');
  const t = useTranslations('shop');
  const tc = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  // Tab cấp trên: "Đơn hàng" (đơn bán được) vs "Tin đã đăng" (sản phẩm). Đọc
  // từ ?tab để link sâu (vd từ sidebar Hồ sơ) mở đúng tab.
  const [topTab, setTopTab] = useState<'orders' | 'listings'>(
    searchParams.get('tab') === 'listings' ? 'listings' : 'orders',
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Order | null>(null);

  // Nối thêm (`append`) thì KHÔNG bật `loading` — làm thế cả danh sách bị thay
  // bằng khung chờ, người bán mất chỗ đang đọc. Trang kế dùng `loadingMore` ở
  // chân danh sách thay vì che cả trang.
  const fetchOrders = useCallback(async (p = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const params: any = { as: 'seller', currentPage: p, limit: 20 };
      const tab = TABS.find((t) => t.key === activeTab);
      if (tab?.status) params.status = tab.status;
      const res = await http.get('/orders', { params });
      const data = res.data?.data || res.data;
      const result = data?.result || [];
      setOrders((prev) => (append ? [...prev, ...result] : result));
      setMeta(data?.meta || { current: 1, pageSize: 20, total: 0, pages: 0 });
    } catch (err: any) {
      console.error(err);
      // Lỗi khi nối thêm thì giữ nguyên danh sách cũ, chỉ báo khi lần đầu hỏng.
      if (!append) toast(err.response?.data?.message || t('ordersLoadFailed'), 'error');
    } finally {
      if (!append) setLoading(false);
      else setLoadingMore(false);
    }
  }, [activeTab, toast]);

  // Đổi tab -> `fetchOrders` đổi định danh -> effect này reset về trang 1 và
  // thay cả danh sách.
  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  // Kéo tới cuối -> tải trang kế và NỐI vào. Chốt chặn: đang tải hoặc hết trang
  // thì thôi. Trang hiện tại đọc từ `meta.current`, không giữ state trang riêng.
  const loadMore = useCallback(() => {
    if (loadingMore || loading) return;
    const cur = meta.current || 1;
    const pages = meta.pages || 1;
    if (cur >= pages) return;
    fetchOrders(cur + 1, true);
  }, [loadingMore, loading, meta, fetchOrders]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // rootMargin dương: kích hoạt TRƯỚC khi ô mồi vào khung, để trang kế về kịp
    // trước lúc chạm đáy — cuộn không khựng.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // Nạp lại ĐÚNG một đơn sau mỗi thao tác, kể cả khi lỗi. 409 nghĩa là đơn
  // vừa đổi trạng thái ở nơi khác (người mua huỷ, thanh toán xong...), nên
  // dòng đang hiện đã cũ. Không nạp lại cả danh sách: làm thế cả trang bị
  // thay bằng khung chờ và người bán mất chỗ đang cuộn.
  const refreshOrder = useCallback(async (id: number) => {
    try {
      const res = await http.get(`/orders/${id}`);
      const fresh = res.data?.data || res.data;
      if (fresh?.status) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: fresh.status } : o)));
      }
      return fresh;
    } catch {
      // Không nạp được thì giữ dòng như cũ; lần tải trang sau sẽ đúng.
      return null;
    }
  }, []);

  const handleConfirmShip = async (order: Order) => {
    const nextStatus = nextInFlow(order.status);
    if (!nextStatus) return;
    setActionLoading(order.id);
    let daChuyen = false;
    try {
      await http.patch(`/orders/${order.id}/status`, { status: nextStatus });
      daChuyen = true;
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      );
      toast(t('movedTo', { status: tStatus(nextStatus) }), 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('updateFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setActionLoading(null);
      const fresh = await refreshOrder(order.id);
      // Hai bước này tạo vận đơn, và GHN từ chối không chặn việc chuyển bước.
      // Không báo thì người bán tưởng xong, gói hàng rồi chờ GHN tới lấy mãi.
      if (
        daChuyen &&
        (nextStatus === 'confirmed' || nextStatus === 'processing') &&
        thieuVanDon(fresh)
      ) {
        toast(t('shipmentWarn'), 'error');
      }
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    const order = confirmCancel;
    setConfirmCancel(null);
    setActionLoading(order.id);
    try {
      // Đường huỷ của NGƯỜI BÁN; /cancel là của người mua nên luôn bị từ chối.
      await http.patch(`/orders/${order.id}/cancel-sale`);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' as OrderStatus } : o))
      );
      toast(t('cancelled'), 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('cancelFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setActionLoading(null);
      refreshOrder(order.id);
    }
  };

  const formatCurrency = (v: number | string, currency?: string) =>
    formatPrice(v, currency);

  const switchTab = (tab: 'orders' | 'listings') => {
    setTopTab(tab);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (tab === 'orders') params.delete('tab');
    else params.set('tab', tab);
    const qs = params.toString();
    router.replace(qs ? `/shop/orders?${qs}` : '/shop/orders', { scroll: false });
  };

  const filteredOrders = search
    ? orders.filter((o) =>
        orderCode(o).toLowerCase().includes(search.toLowerCase()) ||
        o.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
        o.items?.some((i) => i.product_name.toLowerCase().includes(search.toLowerCase()))
      )
    : orders;

  // Địa chỉ backend viết cứng ở đây từng là `http://localhost:3000/` — lên môi
  // trường thật là ảnh chết hết. Nay dùng imageUrl() chung.
  const getImageSrc = imageUrl;

  return (
    <>
    {/* Bọc trong AccountShell để giữ sidebar khu tài khoản — bấm "Đơn bán của
        tôi" từ sidebar không còn mất thanh bên trái, vẫn nhảy mục khác được.
        Sidebar cố định + tab ngang trong mục là chuẩn account hub (NN/g). */}
    <AccountShell>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-ink">{t('hubTitle')}</h1>
          {topTab === 'orders' && (
            <p className="text-ink-muted text-small mt-1">{loading ? tc('loading') : t('ordersCount', { count: meta.total })}</p>
          )}
        </div>

        {/* Tab cấp trên: Đơn hàng | Tin đã đăng. Dáng chip đặc để phân biệt rõ
            với hàng tab lọc trạng thái (gạch chân) nằm bên trong thẻ đơn. */}
        <div className="mb-4 inline-flex gap-1 rounded-control bg-surface-sunken p-1">
          {([
            { key: 'orders' as const, label: t('tabOrders') },
            { key: 'listings' as const, label: t('tabListings') },
          ]).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchTab(tab.key)}
              aria-pressed={topTab === tab.key}
              className={`rounded-control px-4 py-2 text-small font-semibold transition-colors ${
                topTab === tab.key
                  ? 'bg-surface-card text-brand shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {topTab === 'listings' ? (
          <ListingsPanel />
        ) : (
        <>
        <div className="bg-surface-card rounded-control border border-ink/10 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-ink/10 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-6 py-4 text-small font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.key
                    ? 'text-brand border-b-2 border-brand bg-brand-tint/50'
                    : 'text-ink-muted hover:text-brand'
                }`}
              >
                {/* `t` ở đây là phần tử tab của vòng lặp, KHÔNG phải hàm dịch —
                    trùng tên nên phải dùng tc() cho nhãn "Tất cả". */}
                {t.status ? tShort(t.status) : tc('all')}
              </button>
            ))}
          </div>

          <div className="p-4 bg-surface-page border-b border-ink/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-ink/16 rounded-control text-small outline-none focus:border-brand"
              />
            </div>
            <Link
              href="/product/create"
              className="px-4 py-2 bg-brand text-white rounded-control text-small font-medium hover:bg-brand-dark whitespace-nowrap"
            >
              {t('newListing')}
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-ink-muted">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>{t('loadingOrders')}</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-ink-muted">
                  <Package className="w-12 h-12 mx-auto text-ink-faint mb-3" />
                  <p>{t('noOrders')}</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-surface-page transition">
                    <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="font-bold text-brand">{orderCode(order)}</span>
                        <span className="text-caption text-ink-muted">{formatDate(order.created_at)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-caption font-medium ${TONE_CLASS[orderStatusTone(order.status)]}`}>
                          {tStatus(order.status)}
                        </span>
                        {order.tracking_code && (
                          <span className="px-2 py-0.5 rounded text-caption font-medium bg-state-pending-bg text-state-pending-fg">
                            GHN: {order.tracking_code}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-caption font-medium bg-surface-sunken text-ink">
                          {order.payment_method?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-small font-bold text-state-danger-fg">
                        {isMultiSeller(order)
                          ? t('yourPart', { amount: formatCurrency(sellerSubtotal(order)) })
                          : formatCurrency(order.final_amount)}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-control bg-surface-sunken overflow-hidden flex-shrink-0">
                            {getImageSrc(item.product?.image || item.product_image) ? (
                              <img
                                src={getImageSrc(item.product?.image || item.product_image)!}
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
                            <p className="text-small font-medium text-ink truncate">{item.product_name}</p>
                            <p className="text-caption text-ink-muted">x{item.quantity} · {formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="px-3 py-1.5 border border-ink/16 text-ink text-small font-medium rounded-control hover:bg-surface-page flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> {t('detail')}
                      </button>
                      {/* Nút chỉ hiện khi CÒN bước tiếp theo, và nói rõ nó
                          chuyển đơn sang trạng thái nào. Bản cũ hiện nút cho cả
                          đơn đang giao rồi gửi một lệnh không đổi gì. */}
                      {nextInFlow(order.status) && (
                        <button
                          onClick={() => handleConfirmShip(order)}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 bg-brand text-white text-small font-medium rounded-control hover:bg-brand-dark disabled:opacity-50 flex items-center gap-1"
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          {tShort(nextInFlow(order.status)!)}
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'confirmed') && !isMultiSeller(order) && (
                        <button
                          onClick={() => setConfirmCancel(order)}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1.5 border border-state-danger-fg/30 text-state-danger-fg text-small font-medium rounded-control hover:bg-state-danger-bg disabled:opacity-50"
                        >
                          {t('cancelOrder')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Cuộn vô hạn thay cho nút số trang: kéo tới đáy thì observer tự nối
            trang kế; nút "Xem thêm" là lối bấm tay cho bàn phím / không observer. */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {(meta.current || 1) < (meta.pages || 1) ? (
              <>
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-control border border-ink/16 bg-surface-card px-6 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:opacity-60"
                >
                  {loadingMore ? t('loadingMore') : t('loadMore')}
                </button>
                <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
              </>
            ) : (
              <p className="text-small text-ink-faint">{t('endReached')}</p>
            )}
          </div>
        )}
        </>
        )}
    </AccountShell>

      {viewingOrder && (
        <SellerOrderDetail
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onRefresh={() => refreshOrder(viewingOrder.id)}
        />
      )}

      {/* Cancel Confirm Modal */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4" onClick={() => setConfirmCancel(null)}>
          <div className="bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-state-danger-bg flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-state-danger-fg" />
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-lg font-bold text-ink">{t('cancelTitle')}</h2>
                <p className="text-small text-ink-muted mt-2">
                  {t('cancelAsk', { code: orderCode(confirmCancel) })}
                  {confirmCancel.user && ` ${t('refundNote', { name: confirmCancel.user.full_name })}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(null)} className="flex-1 px-4 py-2.5 border border-ink/16 text-ink rounded-control hover:bg-surface-page font-medium">
                {t('no')}
              </button>
              <button onClick={handleCancel} className="flex-1 px-4 py-2.5 bg-price text-white rounded-control hover:bg-state-danger-fg font-medium">
                {t('cancelOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
