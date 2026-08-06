"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, Loader, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cartService } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Stars } from './Stars';
import { demoRating, demoDiscount } from '@/lib/demo';

/**
 * Thẻ hàng theo đúng thứ tự của mẫu: nhãn giảm giá góc trái + tim góc phải →
 * ảnh → dòng thương hiệu → tên → sao và số lượt → giá kèm giá gạch → nút thêm
 * vào giỏ.
 *
 * Trường THẬT: name, price, image, stock, sold, condition, brand, seller.
 * Trường DEMO: sao đánh giá, số lượt, phần trăm giảm, giá gạch — xem src/lib/demo.ts.
 *
 * Nút tim là thật, lưu vào localStorage của máy (backend chưa có wishlist), nên
 * bấm vào có xảy ra chuyện và giữ được sau khi tải lại trang.
 */
const WISHLIST_KEY = 'zoldify_wishlist';

const CONDITION: Record<string, { label: string; className: string }> = {
  new: { label: 'Mới', className: 'bg-brand text-white' },
  refurbished: { label: 'Tân trang', className: 'bg-emerald-600 text-white' },
  used: { label: 'Đã dùng', className: 'bg-ink/80 text-white' },
};

function readWishlist(): number[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function ProductCard({ item }: { item: any }) {
  const stock = Number(item.stock ?? item.quantity);
  const sold = Number(item.sold);
  const soldOut = Number.isFinite(stock) && stock <= 0;
  const cond = CONDITION[String(item.condition)] ?? null;
  const byline = item.brand || item.seller?.name || null;
  const rating = demoRating(item);
  const discount = demoDiscount(item);

  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const { refreshCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setSaved(readWishlist().includes(Number(item.id)));
  }, [item.id]);

  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = Number(item.id);
    const list = readWishlist();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setSaved(next.includes(id));
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await cartService.add(item.id, 1);
      await refreshCartCount();
      toast('Đã thêm vào giỏ', 'success');
    } catch {
      toast('Chưa thêm được vào giỏ. Thử lại giúp mình.', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-ink/8 bg-surface-card transition-shadow hover:shadow-md">
      <div className="relative">
        <Link href={`/product/${item.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-surface-sunken">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-9 w-9 text-ink-faint" aria-hidden="true" />
              </div>
            )}
          </div>
        </Link>

        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <span className="flex flex-col items-start gap-1.5">
            {soldOut ? (
              <span className="rounded-md bg-ink/85 px-2 py-1 text-[11px] font-bold text-white">
                Hết hàng
              </span>
            ) : discount ? (
              <span className="rounded-md bg-price px-2 py-1 text-[11px] font-bold text-white">
                -{discount.percent}%
              </span>
            ) : null}
            {!soldOut && cond && (
              <span className={`rounded-md px-2 py-1 text-[11px] font-bold ${cond.className}`}>
                {cond.label}
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={toggleSaved}
            aria-pressed={saved}
            aria-label={saved ? 'Bỏ khỏi danh sách đã lưu' : 'Lưu món này'}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-surface-card/90 text-ink-muted shadow-sm transition-colors hover:text-price"
          >
            <Heart
              className={`h-4 w-4 ${saved ? 'text-price' : ''}`}
              fill={saved ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <Link href={`/product/${item.id}`} className="flex flex-1 flex-col px-3.5 pb-1 pt-3">
        {byline && (
          <p className="mb-1 truncate text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            {byline}
          </p>
        )}

        <h3 className="clamp-2 text-[13.5px] font-semibold leading-[1.35] text-ink">{item.name}</h3>

        {rating && (
          <p className="mt-1.5 flex items-center gap-1.5">
            <Stars rating={rating.rating} />
            <span className="text-[11.5px] text-ink-muted">({rating.count})</span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-base font-extrabold text-price">{formatPrice(item.price)}</span>
          {discount && (
            <span className="text-[12.5px] text-ink-faint line-through">
              {formatPrice(discount.original)}
            </span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-2 text-[11.5px] text-ink-muted">
          {Number.isFinite(sold) && sold > 0 && <span>Đã bán {sold}</span>}
          {Number.isFinite(sold) && sold > 0 && Number.isFinite(stock) && stock > 0 && (
            <span aria-hidden="true" className="text-ink-faint">·</span>
          )}
          {Number.isFinite(stock) && stock > 0 && <span>Còn {stock}</span>}
        </p>
      </Link>

      <div className="p-3.5 pt-2.5">
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || soldOut}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
        >
          {adding ? (
            <Loader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {soldOut ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}
