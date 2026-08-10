"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Minus, Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { cartService } from '@/services/cart.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format';

/**
 * Giỏ hàng.
 *
 * Bốn thứ của bản trước đã sửa:
 *
 * 1. LƯỚI 12 CỘT KHÔNG REFLOW. `grid-cols-12` không có một biến thể responsive
 *    nào, nên trên điện thoại cả hàng tiêu đề lẫn từng dòng hàng bị nhồi vào 12
 *    cột hẹp. Nay dưới md mỗi món là một thẻ xếp dọc, từ md trở lên mới là hàng.
 *
 * 2. API HỎNG LẠI HIỆN "GIỎ TRỐNG". catch chỉ console.error rồi để mảng rỗng —
 *    người dùng tưởng mất hàng trong giỏ. Nay có trạng thái lỗi riêng.
 *
 * 3. NÚT MUA LÀ href="#" KHI CHƯA CHỌN GÌ. Một liên kết chết đội lốt nút bị vô
 *    hiệu: bấm vào là nhảy lên đầu trang. Nay là <button disabled> thật, kèm câu
 *    giải thích vì sao chưa bấm được.
 *
 * 4. SỐ LƯỢNG BÀY RA CHO MÓN CHỈ CÓ MỘT CÁI. Đồ cũ gần như luôn stock = 1.
 *    Bộ +/- chỉ hiện khi thật sự có nhiều hơn một.
 *
 * Thêm: cảnh báo khi số lượng trong giỏ vượt quá tồn kho hiện tại — món đồ cũ
 * có thể đã được người khác mua mất kể từ lúc bỏ vào giỏ.
 */
export default function CartPage() {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const { allowed } = useRequireAuth();
  const { refreshCartCount } = useCart();
  const { confirm, toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const fetchCart = useCallback(async () => {
    setState('loading');
    try {
      const res = await cartService.getAll();
      setCartItems(
        res.data?.data?.result?.map((item: any) => ({
          id: item.id,
          name: item.product?.name || t('removedItem'),
          price: Number(item.product?.price || 0),
          quantity: item.quantity,
          stock: Number(item.product?.stock ?? 0),
          image: item.product?.image || null,
          selected: Number(item.product?.stock ?? 0) > 0,
          product_id: item.product?.id,
        })) || [],
      );
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (allowed) fetchCart();
  }, [allowed, fetchCart]);

  const toggleSelectAll = (checked: boolean) =>
    setCartItems((prev) => prev.map((i) => (i.stock > 0 ? { ...i, selected: checked } : i)));

  const toggleItem = (id: number) =>
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)));

  const updateQuantity = async (id: number, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
    if (newQty === item.quantity) return;
    try {
      await cartService.update(id, newQty);
      setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
      refreshCartCount();
    } catch {
      toast(t('quantityFailed'), 'error');
    }
  };

  const removeItem = async (id: number, name: string) => {
    const ok = await confirm(t('removeAsk', { name }));
    if (!ok) return;
    try {
      await cartService.remove(id);
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      refreshCartCount();
    } catch {
      toast(t('removeFailed'), 'error');
    }
  };

  const buyable = cartItems.filter((i) => i.selected && i.stock > 0);
  const grandTotal = buyable.reduce((acc, i) => acc + i.price * Math.min(i.quantity, i.stock), 0);
  const selectableCount = cartItems.filter((i) => i.stock > 0).length;
  const allSelected = selectableCount > 0 && cartItems.every((i) => i.stock <= 0 || i.selected);

  if (state === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface-page">
        <p className="text-body text-ink-muted">{t('loading')}</p>
      </div>
    );
  }

  if (state === 'error') {
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
              onClick={fetchCart}
              className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {tc('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-surface-page">
        <div className="mx-auto max-w-[1240px] px-4 py-10">
          <h1 className="text-h1 text-ink">{t('title')}</h1>
          <div className="mt-5 rounded-card bg-surface-card">
            <EmptyState
              title={t('empty')}
              hint={t('emptyHint')}
              action={
                <Link
                  href="/search"
                  className="inline-block rounded-control bg-brand px-6 py-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {t('browse')}
                </Link>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[1240px] px-4 py-5">
        <h1 className="text-h1 text-ink">{t('title')}</h1>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-card bg-surface-card">
              {/* Hàng tiêu đề chỉ có nghĩa khi các cột thật sự tồn tại, tức từ md. */}
              <div className="hidden items-center gap-4 border-b border-ink/10 px-4 py-3 text-caption uppercase tracking-wide text-ink-faint md:flex">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="h-4 w-4 accent-brand"
                  />
                  <span>{t('selectAll')}</span>
                </label>
                <span className="ml-auto w-[110px] text-right">{t('colPrice')}</span>
                <span className="w-[130px] text-center">{t('colQuantity')}</span>
                <span className="w-[120px] text-right">{t('colTotal')}</span>
                <span className="w-9" />
              </div>

              <ul>
                {cartItems.map((item) => {
                  const gone = item.stock <= 0;
                  const overStock = !gone && item.quantity > item.stock;
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 border-b border-ink/10 px-4 py-4 last:border-b-0 md:flex-row md:items-center md:gap-4"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected && !gone}
                          disabled={gone}
                          onChange={() => toggleItem(item.id)}
                          aria-label={t('select', { name: item.name })}
                          className="mt-6 h-4 w-4 shrink-0 accent-brand disabled:opacity-40"
                        />
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-ink-faint" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.product_id}`}
                            className="clamp-2 text-body font-medium text-ink hover:text-brand"
                          >
                            {item.name}
                          </Link>
                          {gone ? (
                            <p className="mt-1 inline-flex items-center gap-1.5 text-small font-semibold text-state-danger-fg">
                              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                              {t('soldOut')}
                            </p>
                          ) : overStock ? (
                            <p className="mt-1 text-small text-state-pending-fg">
                              {t('stockShort', { stock: item.stock, quantity: item.quantity })}
                            </p>
                          ) : item.stock > 1 ? (
                            <p className="mt-1 text-small text-ink-muted">
                              {t('stockLeft', { stock: item.stock })}
                            </p>
                          ) : null}

                          {/* Ở mobile, giá nằm ngay dưới tên thay vì thành một cột. */}
                          <p className="mt-2 text-body font-bold tabular-nums text-price md:hidden">
                            {formatPrice(item.price * Math.min(item.quantity, item.stock || 1))}
                          </p>
                        </div>
                      </div>

                      <span className="hidden w-[110px] shrink-0 text-right text-body tabular-nums text-ink-muted md:block">
                        {formatPrice(item.price)}
                      </span>

                      <div className="flex items-center gap-3 md:w-[130px] md:shrink-0 md:justify-center">
                        {gone ? (
                          <span className="text-small text-ink-faint">—</span>
                        ) : item.stock > 1 ? (
                          <div className="flex items-center rounded-control border border-ink/16">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              aria-label={t('decrease')}
                              className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface-sunken disabled:text-ink-faint"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="w-10 text-center text-body font-semibold tabular-nums text-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label={t('increase')}
                              className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-surface-sunken disabled:text-ink-faint"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-small text-ink-muted">{t('onlyOne')}</span>
                        )}
                      </div>

                      <span className="hidden w-[120px] shrink-0 text-right text-body font-bold tabular-nums text-price md:block">
                        {gone ? '—' : formatPrice(item.price * Math.min(item.quantity, item.stock))}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.name)}
                        aria-label={t('removeItem', { name: item.name })}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-control text-ink-muted transition-colors hover:bg-price-bg hover:text-price md:self-center"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-card bg-surface-card p-5 lg:sticky lg:top-24">
              <h2 className="border-b border-ink/10 pb-4 text-h3 text-ink">{t('summary')}</h2>

              <dl className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-body tabular-nums text-ink-muted">
                    {t('selected', { count: buyable.length })}
                  </dt>
                  <dd className="text-body tabular-nums text-ink">{formatPrice(grandTotal)}</dd>
                </div>
                <p className="text-caption font-normal text-ink-muted">
                  {t('shippingLater')}
                </p>
              </dl>

              <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
                <span className="text-body font-semibold text-ink">{t('subtotal')}</span>
                <span className="text-h2 tabular-nums text-price">{formatPrice(grandTotal)}</span>
              </div>

              {/* Nút thật, không phải <a href="#"> đội lốt nút bị vô hiệu. Và có
                  câu nói rõ vì sao chưa bấm được, thay vì để người dùng đoán. */}
              {buyable.length > 0 ? (
                <Link
                  href={`/checkout?ids=${buyable.map((i) => i.id).join(',')}`}
                  className="mt-5 block w-full rounded-control bg-brand py-3 text-center text-body font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {t('checkoutCount', { count: buyable.length })}
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="mt-5 w-full cursor-not-allowed rounded-control bg-ink/15 py-3 text-center text-body font-semibold text-ink-muted"
                  >
                    {t('checkout')}
                  </button>
                  <p className="mt-2 text-center text-small text-ink-muted">
                    {t('needSelection')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
