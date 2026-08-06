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
 * Thẻ hàng theo đúng thứ tự của trang tham chiếu: nhãn góc trái trên → ảnh →
 * dòng thương hiệu nhỏ → tên đậm → dòng chỉ số → giá → nút Thêm vào giỏ.
 *
 * Ánh xạ sang dữ liệu Zoldify có thật:
 * - nhãn "-20%" / "New"  -> `condition` (mới / đã dùng / tân trang), trường thật
 *   người bán chọn lúc đăng.
 * - dòng thương hiệu     -> `brand`, không có thì tên người bán.
 * - sao đánh giá + số review -> API danh sách không trả điểm tổng, nên dùng
 *   `sold` (đã bán) và `stock` (còn lại). Không vẽ sao rỗng cho đủ chỗ.
 * - giá gạch ngang       -> không có giá gốc, không bịa.
 *
 * Không có nút trái tim: backend chưa có wishlist, để một nút bấm vào không xảy
 * ra gì là lỗi chứ không phải trang trí.
 */
const CONDITION: Record<string, { label: string; className: string }> = {
  new: { label: 'Mới', className: 'bg-brand text-white' },
  refurbished: { label: 'Tân trang', className: 'bg-emerald-600 text-white' },
  used: { label: 'Đã dùng', className: 'bg-ink/80 text-white' },
};

export function ProductCard({ item }: { item: any }) {
  const stock = Number(item.stock ?? item.quantity);
  const sold = Number(item.sold);
  const soldOut = Number.isFinite(stock) && stock <= 0;
  const cond = CONDITION[String(item.condition)] ?? null;
  const byline = item.brand || item.seller?.name || null;

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
    <div className="group flex flex-col overflow-hidden rounded-xl border border-ink/8 bg-surface-card transition-shadow hover:shadow-md">
      <Link href={`/product/${item.id}`} className="flex flex-1 flex-col">
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

          {soldOut ? (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-ink/85 px-2 py-1 text-[11px] font-bold text-white">
              Hết hàng
            </span>
          ) : cond ? (
            <span className={`absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[11px] font-bold ${cond.className}`}>
              {cond.label}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-3.5 pb-1 pt-3">
          {byline && (
            <p className="mb-1 truncate text-[11px] font-medium uppercase tracking-wide text-ink-faint">
              {byline}
            </p>
          )}

          <h3 className="clamp-2 text-[13.5px] font-semibold leading-[1.35] text-ink">
            {item.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-ink-muted">
            {Number.isFinite(sold) && sold > 0 && <span>Đã bán {sold}</span>}
            {Number.isFinite(sold) && sold > 0 && Number.isFinite(stock) && stock > 0 && (
              <span aria-hidden="true" className="text-ink-faint">
                ·
              </span>
            )}
            {Number.isFinite(stock) && stock > 0 && <span>Còn {stock}</span>}
          </div>

          <p className="mt-2 text-base font-extrabold text-price">{formatPrice(item.price)}</p>
        </div>
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
