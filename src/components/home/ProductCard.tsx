"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Heart, ShoppingCart, Loader } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cartService } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { Stars } from './Stars';
import { demoRating, demoDiscount } from '@/lib/demo';

/**
 * Thẻ hàng dựng bám sát ảnh mẫu, đúng thứ tự từng tầng:
 *   nhãn giảm giá (góc trái) + tim (góc phải)
 *   → ảnh nổi trên nền trắng
 *   → dòng thương hiệu nhỏ, xám
 *   → tên món, đậm
 *   → sao + số lượt trong ngoặc
 *   → giá đậm + giá gạch ngang
 *   → nút "Thêm vào giỏ" xanh đặc, tràn hết bề ngang
 *
 * Ảnh dùng object-contain trên nền trắng: ảnh mẫu để sản phẩm nổi giữa nền
 * trắng (ảnh studio cắt nền). Zoldify không có ảnh cắt nền, contain là cách gần
 * nhất mà vẫn thấy trọn món thay vì bị xén mép.
 *
 * Trường THẬT: name, price, image, stock, sold, condition, brand, seller.
 * Trường DEMO: sao, số lượt, phần trăm giảm, giá gạch — xem src/lib/demo.ts.
 */
const WISHLIST_KEY = 'zoldify_wishlist';

function readWishlist(): number[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function ProductCard({ item }: { item: any }) {
  const stock = Number(item.stock ?? item.quantity);
  const soldOut = Number.isFinite(stock) && stock <= 0;
  const rating = demoRating(item);
  const discount = demoDiscount(item);
  const byline = item.brand || item.seller?.name || null;
  const isNew = String(item.condition) === 'new';

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
    <div className="group flex flex-col rounded-xl border border-ink/12 bg-surface-card p-3 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(20,30,60,0.18)]">
      <div className="relative">
        <Link href={`/product/${item.id}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-9 w-9 text-ink-faint" aria-hidden="true" />
              </div>
            )}
            {soldOut && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[13px] font-bold text-ink">
                Đã bán hết
              </span>
            )}
          </div>
        </Link>

        {/* Nhãn góc trái: đỏ cho giảm giá, xanh cho hàng như mới — đúng như mẫu
            dùng đỏ "-20%" và xanh "New". */}
        {!soldOut && discount ? (
          <span className="absolute left-2 top-2 rounded-md bg-price px-2 py-1 text-[11px] font-bold text-white">
            -{discount.percent}%
          </span>
        ) : !soldOut && isNew ? (
          <span className="absolute left-2 top-2 rounded-md bg-brand px-2 py-1 text-[11px] font-bold text-white">
            Như mới
          </span>
        ) : null}

        <button
          type="button"
          onClick={toggleSaved}
          aria-pressed={saved}
          aria-label={saved ? 'Bỏ khỏi danh sách đã lưu' : 'Lưu món này'}
          className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-price"
        >
          <Heart
            className={`h-[18px] w-[18px] ${saved ? 'text-price' : ''}`}
            fill={saved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>

      <Link href={`/product/${item.id}`} className="flex flex-1 flex-col px-0.5 pt-3">
        {byline && <p className="mb-1 truncate text-[11.5px] text-ink-muted">{byline}</p>}

        <h3 className="clamp-2 text-[14.5px] font-semibold leading-[1.3] text-ink">{item.name}</h3>

        {rating && (
          <p className="mt-1.5 flex items-center gap-1.5">
            <Stars rating={rating.rating} size={12} />
            <span className="text-[11.5px] text-ink-muted">({rating.count})</span>
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[16px] font-bold text-ink">{formatPrice(item.price)}</span>
          {discount && (
            <span className="text-[12.5px] text-ink-faint line-through">
              {formatPrice(discount.original)}
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAdd}
        disabled={adding || soldOut}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
      >
        {adding ? (
          <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        )}
        {soldOut ? 'Hết hàng' : 'Thêm vào giỏ'}
      </button>
    </div>
  );
}
