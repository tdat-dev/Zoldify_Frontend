"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Truck, QrCode, Loader, CreditCard, Package } from 'lucide-react';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { payosService } from '@/services/payos.service';
import { paymentService } from '@/services/payment.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import type { CreateOrderDto } from '@/api';
import { useRouter, useSearchParams } from 'next/navigation';
import GhnAddressPicker from '@/components/GhnAddressPicker';
import type { ShippingQuote } from '@/services/order.service';
import { formatPrice } from '@/lib/format';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCat = useTranslations('category');
  const tc = useTranslations('common');
  const { allowed } = useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshCartCount } = useCart();
  // Lấy đúng danh sách phương thức mà backend chấp nhận, thay vì để string
  // rồi gửi giá trị backend không hiểu.
  const [paymentMethod, setPaymentMethod] =
    useState<CreateOrderDto['payment_method']>('cod');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Một khoá cho cả phiên thanh toán này. Lần trước lỗi mà chưa tạo đơn thì
  // backend xử lý như mới; lần trước đã tạo đơn (chỉ mất phản hồi) thì gửi lại
  // nhận về đúng đơn đó.
  const idempotencyKey = useRef(taoKhoaChongTrung());
  const [note, setNote] = useState('');
  const [addressInfo, setAddressInfo] = useState({
    receiver_name: '',
    receiver_phone: '',
    shipping_address: '',
    province: '',
    district: '',
    ghn_district_id: 0,
    ghn_ward_code: '',
  });

  // Phí ship do server tính theo từng người bán (from = pickup người bán).
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const shippingFee = quote?.total ?? 0;
  const selectedIds = (searchParams.get('ids') || '').split(',').filter(Boolean).map(Number);
  // Số dư ví để hiện ngay trên lựa chọn "Ví Zoldify". null = chưa biết (API
  // hỏng thì thôi không hiện, không chặn đặt hàng vì backend vẫn tự kiểm).
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (allowed) fetchCart();
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    paymentService
      .getBalance()
      .then((res) => setWalletBalance(Number(res.data?.data?.balance ?? 0)))
      .catch(() => setWalletBalance(null));
  }, [allowed]);

  // Trả về danh sách vừa nạp (null nếu hỏng) để luồng đặt hàng đọc được
  // ngay, không phải chờ state cập nhật.
  const fetchCart = async (): Promise<any[] | null> => {
    setLoadFailed(false);
    try {
      const res = await cartService.getAll();
      const items = res.data?.data?.result || [];
      let mapped = items.map((item: any) => ({
        id: item.id,
        name: item.product?.name || t('removedItem'),
        price: Number(item.product?.price || 0),
        quantity: item.quantity,
        stock: Number(item.product?.stock ?? 0),
        image: item.product?.image || null,
        product_id: item.product?.id,
      }));
      if (selectedIds.length > 0) {
        mapped = mapped.filter((it: any) => selectedIds.includes(it.id));
      }
      setCartItems(mapped);
      return mapped;
    } catch {
      // Bản trước chỉ console.error rồi để mảng rỗng, nên API hỏng lại hiện
      // "chưa chọn món nào" — nói sai sự thật ngay ở bước cuối của luồng mua.
      setLoadFailed(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subtotal + shippingFee;

  // Báo giá phí ship khi đã có địa chỉ nhận chuẩn GHN + có món trong giỏ.
  useEffect(() => {
    const { ghn_district_id, ghn_ward_code } = addressInfo;
    if (!ghn_district_id || !ghn_ward_code || cartItems.length === 0) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    orderService
      .shippingQuote({
        to_district_id: ghn_district_id,
        to_ward_code: ghn_ward_code,
        cart_item_ids: cartItems.map((it) => it.id),
      })
      .then((res) => {
        if (!cancelled) setQuote(res.data?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      })
      .finally(() => {
        if (!cancelled) setQuoting(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressInfo.ghn_district_id, addressInfo.ghn_ward_code, cartItems.length]);
  // Cùng luật với giỏ hàng và với orders.service phía backend: một đơn, một
  // loại tiền. Xem chú thích ở cart/page.tsx.
  const cur = cartItems[0]?.currency;
  const mixedCurrency = cartItems.some((i: any) => (i.currency || 'VND') !== (cur || 'VND'));

  // Đủ ba cấp địa chỉ GHN. Thiếu quận/phường thì backend không tính được phí
  // và đơn đi với phí ship 0đ, tức là ai cũng lấy được "miễn phí giao hàng"
  // chỉ bằng cách bỏ trống hai ô đó.
  const areaComplete =
    !!addressInfo.province && !!addressInfo.ghn_district_id && !!addressInfo.ghn_ward_code;
  const [showAreaError, setShowAreaError] = useState(false);
  // POST /orders hết giờ chờ mà không có response: đơn có thể đã được tạo.
  const [lostResponse, setLostResponse] = useState(false);

  const handleOrder = async () => {
    if (!areaComplete) {
      setShowAreaError(true);
      return;
    }
    if (!addressInfo.receiver_name || !addressInfo.receiver_phone || !addressInfo.shipping_address) {
      toast(t('errAddress'), 'error');
      return;
    }
    if (cartItems.length === 0) {
      toast(t('errNoItems'), 'error');
      return;
    }
    // Biết chắc ví không đủ thì đừng tạo đơn: tạo xong mới trừ hụt là để lại
    // một đơn treo chưa trả mà kho đã bị giữ.
    if (paymentMethod === 'wallet' && walletBalance !== null && walletBalance < grandTotal) {
      toast(t('walletShort'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Bước 1: Tạo order trước (PENDING)
      const orderRes = await orderService.create({
        receiver_name: addressInfo.receiver_name,
        receiver_phone: addressInfo.receiver_phone,
        shipping_address: addressInfo.shipping_address,
        province: addressInfo.province,
        district: addressInfo.district,
        ghn_district_id: addressInfo.ghn_district_id || undefined,
        ghn_ward_code: addressInfo.ghn_ward_code || undefined,
        note,
        payment_method: paymentMethod,
        cart_item_ids: cartItems.map((it) => it.id),
      }, idempotencyKey.current);
      const order = orderRes.data?.data || orderRes.data;
      const orderId = order?.id;

      // Bước 2: Nếu là PayOS → tạo link thanh toán và redirect
      if (paymentMethod === 'payos') {
        if (!orderId) {
          toast(t('errNoCode'), 'error');
          refreshCartCount();
          router.push('/profile/orders');
          return;
        }
        // Tạo link hỏng KHÔNG được rơi xuống catch chung bên dưới: lúc này đơn
        // đã có và giỏ đã bị xoá, ở lại trang này chỉ còn nút "Đặt hàng" bấm ra
        // "Giỏ hàng trống". Đưa người mua tới trang đơn, ở đó có "Thanh toán
        // ngay" gọi lại đúng create-link này.
        let checkoutUrl: string | undefined;
        let linkReason: string | undefined;
        try {
          const payosRes = await payosService.createLink({ type: 'order', order_id: orderId });
          checkoutUrl = payosRes.data?.data?.checkoutUrl;
        } catch (linkErr: any) {
          const m = linkErr.response?.data?.message;
          linkReason = Array.isArray(m) ? m[0] : m;
        }
        refreshCartCount();
        if (!checkoutUrl) {
          toast(
            t('createdUnpaid', { id: orderId, reason: linkReason || t('errNoPayLink') }),
            'error',
          );
          router.push(`/profile/orders/${orderId}`);
          return;
        }
        // Redirect sang PayOS
        window.location.href = checkoutUrl;
        return;
      }

      // Bước 2 (ví): POST /orders chỉ TẠO đơn, không trừ đồng nào. Tiền chỉ rời
      // ví ở POST /payments. Bản trước bỏ qua bước này nên mọi đơn "trả bằng
      // ví" đều nằm ở trạng thái chưa thanh toán mà người mua vẫn thấy "Đặt
      // hàng xong".
      if (paymentMethod === 'wallet') {
        if (!orderId) {
          toast(t('errNoCode'), 'error');
          refreshCartCount();
          router.push('/profile/orders');
          return;
        }
        try {
          await paymentService.create({ order_id: orderId, payment_method: 'wallet' });
        } catch (payErr: any) {
          // Đơn ĐÃ có (giỏ đã bị xoá phía backend), chỉ chưa trả. Đưa người mua
          // tới trang đơn để trả lại, đừng báo "đặt xong".
          const m = payErr.response?.data?.message;
          const reason = (Array.isArray(m) ? m[0] : m) || t('walletNotCharged');
          toast(t('createdUnpaid', { id: orderId, reason }), 'error');
          refreshCartCount();
          router.push(`/profile/orders/${orderId}`);
          return;
        }
      }

      // COD / Wallet đã trừ → success page
      refreshCartCount();
      router.push('/cart/success');
    } catch (err: any) {
      if (!err.response) {
        // Hết giờ chờ hoặc rớt mạng: KHÔNG biết đơn đã được tạo hay chưa.
        // Backend xoá các dòng giỏ trong cùng transaction tạo đơn, nên nạp lại
        // giỏ là cách trả lời: món còn thì đơn chưa có, đặt lại an toàn; món
        // mất thì đơn đã có. Bản trước để người mua bấm lại ngay và nhận
        // "Giỏ hàng trống, không thể tạo đơn hàng", không hiểu chuyện gì.
        const submittedIds = cartItems.map((it) => it.id);
        const fresh = await fetchCart();
        refreshCartCount();
        if (fresh && fresh.some((it: any) => submittedIds.includes(it.id))) {
          toast(t('errNetwork'), 'error');
        } else {
          setLostResponse(true);
          if (!fresh) toast(t('lostResponse'), 'error');
        }
        return;
      }
      const msg = err.response?.data?.message || t('errSubmit');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
      // 400/409 thường là món vừa bị người khác mua hết hoặc giá vừa đổi. Nạp
      // lại giỏ để màn hình nói đúng (cảnh báo hết hàng, giá mới) trước khi
      // người mua bấm lại.
      if (err.response.status === 400 || err.response.status === 409) {
        fetchCart();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface-page">
        <p className="text-body text-ink-muted">{t('loading')}</p>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen bg-surface-page">
        <div className="mx-auto max-w-[1240px] px-4 py-10">
          <div className="rounded-card bg-surface-card p-10 text-center">
            <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
            <p className="mt-2 text-small text-ink-muted">
              {t('loadFailedHint')}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchCart();
              }}
              className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {tc('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const soldOutItems = cartItems.filter((i) => i.stock <= 0);
  const canOrder =
    cartItems.length > 0 && soldOutItems.length === 0 && !submitting && !lostResponse;

  const payOption = (
    value: CreateOrderDto['payment_method'],
    title: string,
    desc: string | null,
    Icon: typeof Truck,
  ) => (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-control border p-3.5 transition-colors ${
        paymentMethod === value ? 'border-brand bg-brand-tint' : 'border-ink/16 hover:border-ink/30'
      }`}
    >
      <input
        type="radio"
        name="payment_method"
        value={value}
        checked={paymentMethod === value}
        onChange={() => setPaymentMethod(value)}
        className="h-4 w-4 shrink-0 accent-brand"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-small font-semibold text-ink">{title}</span>
        {desc && (
          <span className="mt-0.5 block text-caption font-normal text-ink-muted">{desc}</span>
        )}
      </span>
      <Icon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
    </label>
  );

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[1240px] px-4 py-5">
        <nav aria-label={tCat('breadcrumbLabel')} className="mb-3 flex items-center gap-1.5 text-small text-ink-muted">
          <Link href="/cart" className="hover:text-brand">
            {t('breadcrumbCart')}
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-ink" aria-current="page">
            {t('title')}
          </span>
        </nav>

        <h1 className="text-h1 text-ink">{t('title')}</h1>

        {soldOutItems.length > 0 && (
          <p
            role="alert"
            className="mt-4 rounded-control border border-state-danger-fg/30 bg-state-danger-bg px-4 py-3 text-body text-state-danger-fg"
          >
            {/* Không nối thêm chữ vào sau t(): chuỗi soldOutWarning đã kết thúc
                bằng "trước khi đặt.", nên dòng cứng ở đây làm câu đó in HAI LẦN
                trên màn hình. Vết của một lần tách chuỗi bỏ dở. */}
            {t('soldOutWarning', { count: soldOutItems.length })}
          </p>
        )}

        {lostResponse && (
          <div
            role="alert"
            className="mt-4 rounded-control border border-state-pending-fg/30 bg-state-pending-bg px-4 py-3 text-body text-state-pending-fg"
          >
            {t('lostResponse')}{' '}
            <Link href="/profile/orders" className="font-semibold underline">
              {t('lostResponseLink')}
            </Link>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-8">
            <section aria-labelledby="sec-ship" className="rounded-card bg-surface-card p-5">
              <h2 id="sec-ship" className="mb-4 flex items-center gap-2 text-h3 text-ink">
                <MapPin className="h-5 w-5 text-brand" aria-hidden="true" /> {t('shipTo')}
              </h2>
              <GhnAddressPicker onSelect={setAddressInfo} />
              {showAreaError && !areaComplete && (
                <p role="alert" className="mt-3 text-small text-state-danger-fg">
                  {t('errAddressArea')}
                </p>
              )}
            </section>

            <section aria-labelledby="sec-note" className="rounded-card bg-surface-card p-5">
              <h2 id="sec-note" className="text-h3 text-ink">
                {t('messageSeller')}
              </h2>
              <label htmlFor="order-note" className="sr-only">
                {t('note')}
              </label>
              <textarea
                id="order-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('notePlaceholder')}
                className="mt-3 w-full resize-y rounded-control border border-ink/16 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </section>

            <section aria-labelledby="sec-items" className="overflow-hidden rounded-card bg-surface-card">
              <h2
                id="sec-items"
                className="border-b border-ink/10 px-5 py-3.5 text-small font-semibold text-ink"
              >
                {t('itemCount', { count: cartItems.length })}
              </h2>
              <ul>
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 border-b border-ink/10 px-5 py-3.5 last:border-b-0"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
                      {item.image ? (
                        <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-ink-faint" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="clamp-2 text-body text-ink">{item.name}</p>
                      <p className="mt-0.5 text-small text-ink-muted">
                        {formatPrice(item.price, cur)}
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-body font-bold tabular-nums text-price">
                      {formatPrice(item.price * item.quantity, cur)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-card bg-surface-card p-5 lg:sticky lg:top-24">
              <h2 className="border-b border-ink/10 pb-4 text-h3 text-ink">{t('payment')}</h2>

              <dl className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body text-ink-muted">{t('goods')}</dt>
                  <dd className="text-body tabular-nums text-ink">{formatPrice(subtotal, cur)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body text-ink-muted">{t('shippingFee')}</dt>
                  <dd className="text-body text-ink">
                    {quoting
                      ? t('shippingCalc')
                      : !areaComplete
                        ? t('shippingPending')
                        : shippingFee === 0
                        ? t('free')
                        : formatPrice(shippingFee, cur)}
                  </dd>
                </div>

                {/* Phí ship tách theo từng người bán — mỗi shop tự gửi từ địa
                    chỉ của mình nên phí tính riêng. */}
                {quote && quote.items.length > 1 && (
                  <div className="mt-1 rounded-control bg-surface-sunken px-3 py-2">
                    <p className="mb-1 text-caption font-semibold text-ink-muted">
                      {t('shippingByShop')}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {quote.items.map((it) => (
                        <li
                          key={it.seller_id}
                          className="flex items-baseline justify-between gap-3 text-caption"
                        >
                          <span className="min-w-0 truncate text-ink-muted">{it.seller_name}</span>
                          <span className="shrink-0 tabular-nums text-ink">
                            {it.fee === 0 ? t('free') : formatPrice(it.fee, cur)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {quote && quote.items.some((it) => !it.has_pickup) && (
                  <p className="text-caption text-state-pending-fg">
                    {t('pickupMissingNote')}
                  </p>
                )}
              </dl>

              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
                <span className="text-body font-semibold text-ink">{t('total')}</span>
                <span className="text-h2 tabular-nums text-price">{formatPrice(grandTotal, cur)}</span>
              </div>

              <fieldset className="mt-5">
                <legend className="mb-3 text-small font-semibold text-ink">{t('payWith')}</legend>
                <div className="flex flex-col gap-2">
                  {payOption('cod', t('cod'), t('codHint'), Truck)}
                  {payOption(
                    'wallet',
                    t('wallet'),
                    walletBalance !== null
                      ? `${t('walletHint')} · ${t('walletBalance', { amount: formatPrice(walletBalance) })}`
                      : t('walletHint'),
                    QrCode,
                  )}
                  {payOption(
                    'payos',
                    t('card'),
                    t('cardHint'),
                    CreditCard,
                  )}
                </div>
                {paymentMethod === 'wallet' && walletBalance !== null && walletBalance < grandTotal && (
                  <p role="alert" className="mt-2 text-caption text-state-danger-fg">
                    {t('walletShort')}
                  </p>
                )}
              </fieldset>

              <button
                type="button"
                onClick={handleOrder}
                disabled={!canOrder}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-control bg-brand py-3 text-body font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink-muted"
              >
                {submitting && <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {submitting ? t('submitting') : t('submit')}
              </button>

              <p className="mt-3 text-center text-small">
                <Link href="/cart" className="text-ink-muted hover:text-brand">
                  {t('backToCart')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function taoKhoaChongTrung(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}
