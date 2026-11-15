"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, Package, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { cartService } from '@/services/cart.service';
import type { AssistantProduct } from '@/services/assistant.service';
import { formatPrice } from '@/lib/format';
import { imageUrl } from '@/lib/image-url';

/** Màu nhãn giá: dùng chung bảng màu trạng thái như ConditionBadge. */
const VERDICT_STYLE = {
  good: { key: 'verdictGood', cls: 'bg-state-success-bg text-state-success-fg' },
  fair: { key: 'verdictFair', cls: 'bg-state-neutral-bg text-state-neutral-fg' },
  high: { key: 'verdictHigh', cls: 'bg-state-pending-bg text-state-pending-fg' },
} as const;

/**
 * Thẻ món trong khung trợ lý. "Mua ngay" làm đúng như nút cùng tên ở trang chi
 * tiết (ProductDetail.handleBuyNow): món đã có trong giỏ thì đặt lại số lượng
 * 1 thay vì cộng dồn, rồi mở trang Đặt hàng chỉ với món đó. Dừng ở trang Đặt
 * hàng: người mua tự chọn cách trả và tự bấm đặt, trợ lý không chạm tới tiền.
 */
export function AssistantProductCard({ product, onNavigate }: { product: AssistantProduct; onNavigate: () => void }) {
  const t = useTranslations('assistant');
  const tc = useTranslations('condition');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const buyNow = async () => {
    if (!isAuthenticated) {
      onNavigate();
      router.push('/login');
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const cart = await cartService.getAll(1, 100);
      const existing = (cart.data?.data?.result ?? []).find((it: any) => Number(it.product?.id) === product.id);
      const res = existing ? await cartService.update(existing.id, 1) : await cartService.add(product.id, 1);
      refreshCartCount();
      const cartId = existing?.id ?? res.data?.data?.id;
      onNavigate();
      router.push(cartId ? `/checkout?ids=${cartId}` : '/cart');
    } catch (err: any) {
      toast(err.response?.data?.message || t('buyFailed'), 'error');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const src = product.image ? imageUrl(product.image, 400) : null;
  const verdict = product.verdict ? VERDICT_STYLE[product.verdict] : null;
  return (
    <li className="flex gap-3 rounded-card border border-ink/10 bg-surface-card p-2">
      <Link href={`/product/${product.id}`} onClick={onNavigate} className="h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-sunken">
        {src ? (
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Package className="m-auto mt-5 h-6 w-6 text-ink-faint" aria-hidden="true" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/product/${product.id}`} onClick={onNavigate} className="line-clamp-2 text-small text-ink hover:text-brand">
          {product.name}
        </Link>
        <span className="text-small font-semibold tabular-nums text-price">{formatPrice(product.price)}</span>
        <span className="truncate text-caption text-ink-muted">
          {[product.condition ? tc(product.condition as any) : null, product.province_name].filter(Boolean).join(' · ')}
        </span>
        {(verdict || product.over_budget) && (
          <span className="mt-1 flex flex-wrap gap-1">
            {verdict && (
              <span className={`rounded-control px-1.5 py-0.5 text-caption font-medium ${verdict.cls}`}>{t(verdict.key)}</span>
            )}
            {product.over_budget && (
              <span className="rounded-control bg-state-danger-bg px-1.5 py-0.5 text-caption font-medium text-state-danger-fg">
                {t('overBudget')}
              </span>
            )}
          </span>
        )}
        {product.ai_pending && (
          <p className="mt-1 inline-flex items-center gap-1 text-caption text-ink-faint" aria-live="polite">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            {t('aiReviewing')}
          </p>
        )}
        {product.note && (
          <p className="mt-1 text-caption text-ink-muted">
            {product.ai_note && (
              <span className="mr-1 inline-flex items-center gap-0.5 font-medium text-brand">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {t('aiNote')}:
              </span>
            )}
            {product.note}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={buyNow}
        disabled={busy}
        className="self-center whitespace-nowrap rounded-control bg-brand px-3 py-1.5 text-caption font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-label={t('buying')} /> : t('buyNow')}
      </button>
    </li>
  );
}
