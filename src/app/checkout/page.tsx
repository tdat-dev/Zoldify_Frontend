"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Truck, QrCode, Loader, CreditCard, Package } from 'lucide-react';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { payosService } from '@/services/payos.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import type { CreateOrderDto } from '@/api';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressPicker from '@/components/AddressPicker';
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
  const [note, setNote] = useState('');
  const [addressInfo, setAddressInfo] = useState({
    receiver_name: '',
    receiver_phone: '',
    shipping_address: '',
    province: '',
    district: '',
  });

  const SHIPPING_FEE: number = 0;
  const selectedIds = (searchParams.get('ids') || '').split(',').filter(Boolean).map(Number);

  useEffect(() => {
    if (allowed) fetchCart();
  }, [allowed]);

  const fetchCart = async () => {
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
    } catch {
      // Bản trước chỉ console.error rồi để mảng rỗng, nên API hỏng lại hiện
      // "chưa chọn món nào" — nói sai sự thật ngay ở bước cuối của luồng mua.
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subtotal + SHIPPING_FEE;
  // Cùng luật với giỏ hàng và với orders.service phía backend: một đơn, một
  // loại tiền. Xem chú thích ở cart/page.tsx.
  const cur = cartItems[0]?.currency;
  const mixedCurrency = cartItems.some((i: any) => (i.currency || 'VND') !== (cur || 'VND'));

  const handleOrder = async () => {
    if (!addressInfo.receiver_name || !addressInfo.receiver_phone || !addressInfo.shipping_address) {
      toast(t('errAddress'), 'error');
      return;
    }
    if (cartItems.length === 0) {
      toast(t('errNoItems'), 'error');
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
        note,
        payment_method: paymentMethod,
        cart_item_ids: cartItems.map((it) => it.id),
      });
      const order = orderRes.data?.data || orderRes.data;
      const orderId = order?.id;

      // Bước 2: Nếu là PayOS → tạo link thanh toán và redirect
      if (paymentMethod === 'payos') {
        if (!orderId) {
          toast(t('errNoCode'), 'error');
          setSubmitting(false);
          return;
        }
        const payosRes = await payosService.createLink({ type: 'order', order_id: orderId });
        const checkoutUrl = payosRes.data?.data?.checkoutUrl;
        if (!checkoutUrl) {
          toast(t('errNoPayLink'), 'error');
          setSubmitting(false);
          return;
        }
        refreshCartCount();
        // Redirect sang PayOS
        window.location.href = checkoutUrl;
        return;
      }

      // COD / Wallet → success page
      refreshCartCount();
      router.push('/cart/success');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('errSubmit');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
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
  const canOrder = cartItems.length > 0 && soldOutItems.length === 0 && !submitting;

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

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-8">
            <section aria-labelledby="sec-ship" className="rounded-card bg-surface-card p-5">
              <h2 id="sec-ship" className="mb-4 flex items-center gap-2 text-h3 text-ink">
                <MapPin className="h-5 w-5 text-brand" aria-hidden="true" /> {t('shipTo')}
              </h2>
              <AddressPicker onSelect={setAddressInfo} />
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
                    {SHIPPING_FEE === 0 ? t('free') : formatPrice(SHIPPING_FEE, cur)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
                <span className="text-body font-semibold text-ink">{t('total')}</span>
                <span className="text-h2 tabular-nums text-price">{formatPrice(grandTotal, cur)}</span>
              </div>

              <fieldset className="mt-5">
                <legend className="mb-3 text-small font-semibold text-ink">{t('payWith')}</legend>
                <div className="flex flex-col gap-2">
                  {payOption('cod', t('cod'), t('codHint'), Truck)}
                  {payOption('wallet', t('wallet'), t('walletHint'), QrCode)}
                  {payOption(
                    'payos',
                    t('card'),
                    t('cardHint'),
                    CreditCard,
                  )}
                </div>
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
