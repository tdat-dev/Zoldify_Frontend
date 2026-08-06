import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export function ProductCard({ item }: { item: any }) {
  const stock = item.stock ?? item.quantity;
  return (
    <Link
      href={`/product/${item.id}`}
      className="block bg-surface-card rounded-sm shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-brand/30 overflow-hidden"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <Package className="w-10 h-10 text-ink-muted" aria-hidden="true" />
        )}
        {Number(item.sold) > 0 && (
          <span className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs text-center py-1">
            Đã bán {item.sold}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-sm text-ink line-clamp-2 mb-2 min-h-[40px] font-normal">{item.name}</h3>
        <div className="flex justify-between items-end gap-2">
          <span className="text-red-600 text-base price-figure">
            {formatPrice(item.price)}
          </span>
          {Number.isFinite(Number(stock)) && (
            <span className="text-xs text-ink-muted whitespace-nowrap">Còn {stock}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
