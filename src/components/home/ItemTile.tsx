import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';

/**
 * Ô hàng nhỏ: ảnh vuông, tên cắt gọn, giá.
 *
 * Dùng ở hai chỗ — trong ô 2x2 của thẻ trang chủ (theo khuôn Amazon: bốn ảnh
 * nhỏ kèm nhãn), và trong dải cuộn ngang bên dưới. Cùng một ô, hai mật độ.
 */
export function ItemTile({
  item,
  size = 'sm',
}: {
  item: any;
  size?: 'sm' | 'md';
}) {
  const stock = Number(item.stock ?? item.quantity);
  const soldOut = Number.isFinite(stock) && stock <= 0;

  return (
    <Link
      href={`/product/${item.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
    >
      <div className="relative aspect-square overflow-hidden rounded-control bg-surface-sunken">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-ink-faint" aria-hidden="true" />
          </div>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-surface-card/80 text-small font-bold text-ink">
            Đã bán
          </span>
        )}
      </div>

      <p
        className={
          size === 'md'
            ? 'clamp-2 mt-2 text-small text-ink group-hover:text-brand'
            : 'clamp-2 mt-1.5 text-caption font-normal leading-snug text-ink-muted group-hover:text-brand'
        }
      >
        {item.name}
      </p>
      <p
        className={
          size === 'md'
            ? 'mt-1 text-[15px] font-bold tabular-nums text-price'
            : 'mt-0.5 text-small font-bold tabular-nums text-price'
        }
      >
        {formatPrice(item.price)}
      </p>
    </Link>
  );
}
