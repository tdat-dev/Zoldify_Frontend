"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, Loader } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cartService } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

/**
 * Thẻ sản phẩm kiểu sàn TMĐT: ảnh vuông, nhãn trạng thái, tên 2 dòng, giá đỏ,
 * nút thêm vào giỏ THẬT (gọi cartService, không phải nút trang trí).
 *
 * Không có trái tim wishlist như các trang mẫu — backend không có wishlist, và
 * một nút bấm vào không xảy ra gì là lỗi, không phải trang trí.
 */
export function ProductCard({ item }: { item: any }) {
  const stock = Number(item.stock ?? item.quantity);
  const sold = Number(item.sold);
  const soldOut = Number.isFinite(stock) && stock <= 0;

  const [adding, setAdding] = useState(false);
  const { refreshCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-ink/8 bg-surface-card transition-shadow hover:shadow-lg">
      <Link href={`/product/${item.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-surface-sunken">
          {item.image ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-9 w-9 text-ink-faint" aria-hidden="true" />
            </div>
          )}

          {/* Nhãn nền đặc, không nền nhạt: nhãn nằm trên ảnh sản phẩm nên nền
              nhạt bị chìm vào ảnh, đọc không ra. */}
          {soldOut ? (
            <span className="absolute left-2 top-2 rounded-md bg-ink/85 px-2 py-1 text-[11px] font-bold text-white">
              Hết hàng
            </span>
          ) : Number.isFinite(sold) && sold > 0 ? (
            <span className="absolute left-2 top-2 rounded-md bg-price px-2 py-1 text-[11px] font-bold text-white">
              Đã bán {sold}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-3">
          <h3 className="clamp-2 mb-2 text-[13px] leading-[1.35] text-ink">
            {item.name}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2">
            <span className="text-[15px] font-bold text-price">{formatPrice(item.price)}</span>
            {Number.isFinite(stock) && stock > 0 && (
              <span className="whitespace-nowrap text-[11px] text-ink-faint">Còn {stock}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || soldOut}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink-faint"
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
