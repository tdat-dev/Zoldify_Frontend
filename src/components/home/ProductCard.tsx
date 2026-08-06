"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Heart } from 'lucide-react';
import { formatPrice, timeAgo } from '@/lib/format';
import { Stars } from './Stars';
import { demoRating, demoDiscount } from '@/lib/demo';

/**
 * Thẻ hàng cho chợ đồ cũ C2C.
 *
 * Ba khác biệt cố ý so với khuôn thương mại điện tử, đến từ bản phản biện:
 *
 * 1. ẢNH KHÔNG TRÀN MÉP. Ảnh mẫu đẹp vì ảnh sản phẩm của nó là ảnh studio cắt
 *    nền trắng — lấy mẫu pixel ra #FDFFFE, món hàng chỉ chiếm ~35% ô, nên mỗi
 *    thẻ về thị giác là ~85% trắng. Zoldify không bao giờ có ảnh đó: ảnh thật
 *    là ảnh điện thoại chụp trong phòng ký túc. Nên ta TỰ tạo khoảng trắng đó
 *    bằng p-3 quanh ảnh, và hạ aspect-square xuống 4/3 (giảm ~37% diện tích
 *    mực). Bốn thẻ cạnh nhau đọc ra là bốn VẬT, không phải bốn tấm ảnh dán sát.
 *
 * 2. KHÔNG CÓ NÚT "THÊM VÀO GIỎ". Hàng độc bản "Còn 1", mỗi món một người bán
 *    — hành động thật là xem món rồi nhắn người bán, không phải gom giỏ. Bỏ nút
 *    cũng trả lại cho hero hai CTA duy nhất của trang.
 *
 * 3. NHÃN TÌNH TRẠNG RỜI KHỎI ẢNH. Đặt trên ảnh thì nền bán trong suốt chồng
 *    lên ảnh bất kỳ; đo được 2.45:1 — lỗi tương phản nặng nhất trang. Giờ nó là
 *    một chip đặc nằm dưới ảnh, tương phản không phụ thuộc vào bức ảnh nào.
 *
 * Trường THẬT: name, price, image, stock, sold, condition, brand, seller, createdAt.
 * Trường DEMO: sao, số lượt, phần trăm rẻ hơn — xem src/lib/demo.ts.
 */
const WISHLIST_KEY = 'zoldify_wishlist';

const CONDITION: Record<string, { label: string; className: string }> = {
  new: { label: 'Như mới', className: 'bg-emerald-50 text-emerald-700' },
  refurbished: { label: 'Đã tân trang', className: 'bg-amber-50 text-amber-700' },
  used: { label: 'Đã dùng', className: 'bg-surface-sunken text-ink-muted' },
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
  const soldOut = Number.isFinite(stock) && stock <= 0;
  const cond = CONDITION[String(item.condition)] ?? null;
  const rating = demoRating(item);
  const discount = demoDiscount(item);
  const posted = timeAgo(item.createdAt ?? item.created_at);
  const seller = item.seller?.name;

  const [saved, setSaved] = useState(false);
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

  return (
    <div className="group relative flex flex-col rounded-xl border border-ink/12 bg-surface-card transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(20,30,60,0.18)]">
      {/* Nút lưu nằm NGOÀI thẻ ảnh, trên nền trắng của khung p-3: không đè lên
          ảnh nên không phụ thuộc độ sáng bức ảnh. 40px thay cho 32px trước đây. */}
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={saved}
        aria-label={saved ? 'Bỏ khỏi danh sách đã lưu' : 'Lưu món này'}
        className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-price"
      >
        <Heart
          className={`h-[18px] w-[18px] ${saved ? 'text-price' : ''}`}
          fill={saved ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      </button>

      <Link href={`/product/${item.id}`} className="flex flex-1 flex-col">
        <div className="p-3 pb-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-sunken">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-8 w-8 text-ink-faint" aria-hidden="true" />
              </div>
            )}

            {soldOut && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[13px] font-bold text-ink">
                Đã bán hết
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
          <h3 className="clamp-2 text-[14px] font-medium leading-[1.35] text-ink">{item.name}</h3>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-[15px] font-bold text-price">{formatPrice(item.price)}</span>
            {discount && (
              // Ảnh mẫu ghi "-20%". Ở chợ đồ cũ phép so đúng là với giá mua mới,
              // và đó cũng là con số sinh viên thật sự nhẩm trong đầu.
              <span className="text-[12px] text-ink-faint">
                rẻ hơn mua mới {discount.percent}%
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {cond && (
              <span className={`rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold ${cond.className}`}>
                {cond.label}
              </span>
            )}
            {rating && (
              <span className="flex items-center gap-1">
                <Stars rating={rating.rating} size={11} />
                <span className="text-[11.5px] text-ink-muted">{rating.rating}</span>
              </span>
            )}
          </div>

          {/* Dòng cuối là tín hiệu C2C, thay chỗ nút "Thêm vào giỏ": ai bán, đăng
              bao lâu rồi. Tên người bán KHÔNG viết hoa toàn bộ — ô đó ở ảnh mẫu
              dành cho tên thương hiệu (APPLE, SONY); đổ tên người vào rồi viết
              hoa hết thì dấu chồng vỡ ở 11px và sai cả ngữ nghĩa. */}
          {(seller || posted) && (
            <p className="mt-auto truncate pt-3 text-[12px] text-ink-muted">
              {seller}
              {seller && posted ? ' · ' : ''}
              {posted}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
