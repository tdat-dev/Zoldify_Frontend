"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Loader } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cartService } from '@/services/cart.service';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

/**
 * Một món = MỘT DÒNG trong sổ kê.
 *
 * Vì sao dòng chứ không phải thẻ: đồ cũ mỗi món chỉ có một cái và mang metadata
 * riêng (tình trạng, người bán, đăng lúc nào). Lưới thẻ đều tăm tắp là ngôn ngữ
 * của hàng sản xuất hàng loạt — nó nói sai bản chất món hàng, và khi chỉ có vài
 * món thì lưới thẻ đọc ra là "hỏng", còn sổ kê vài dòng vẫn ra sổ kê.
 *
 * TƯƠNG TÁC ĐẶC TRƯNG — cột phải đổi giữa GIÁ và HÀNH ĐỘNG:
 * Lúc nghỉ, cột phải là con số, nên mắt quét dọc được cả cột giá — đúng cách
 * người ta đọc một bảng kê, và giá là thứ sinh viên lọc trước tiên. Khi trỏ
 * hoặc tab vào dòng, con số trượt lên nhường chỗ cho nút ngay TẠI vị trí đó.
 *
 * Chỉ đổi từ md trở lên. Màn cảm ứng không có hover: dưới md, dòng là một liên
 * kết, giá hiện thường trực, việc thêm giỏ nằm ở trang chi tiết. Đưa hành vi
 * hover xuống mobile thì nút vĩnh viễn không xuất hiện.
 *
 * Người bật "giảm chuyển động" vẫn đổi, chỉ là đổi tức thì — khối reduced-motion
 * trong globals.css đã hạ mọi transition xuống 0.01ms.
 */
function postedAgo(value?: string): string | null {
  if (!value) return null;
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return null;
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return null;
}

export function ItemRow({ item }: { item: any }) {
  const stock = Number(item.stock ?? item.quantity);
  const soldOut = Number.isFinite(stock) && stock <= 0;
  const condition = String(item.condition) === 'new' ? 'Như mới' : 'Đã dùng';
  const seller = item.seller?.name || item.brand || null;
  const posted = postedAgo(item.created_at ?? item.createdAt);

  const [adding, setAdding] = useState(false);
  const { refreshCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleAdd = async () => {
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

  // Các mẩu metadata thật, ghép bằng dấu chấm giữa. Thiếu cái nào thì bỏ cái đó
  // chứ không in chỗ trống.
  const meta = [condition, seller, posted].filter(Boolean);

  return (
    // Hairline chạy hết bề ngang màn hình, nội dung dòng vẫn neo trong khung
    // 1240px — vạch kẻ dài hơn cột chữ là điểm mạo hiểm bố cục của trang, và
    // cũng là cách một cuốn sổ kê thật kẻ dòng.
    <li className="group border-b border-ink/10 transition-colors hover:bg-surface-sunken/50">
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 py-3 md:gap-5">
        <Link
          href={`/product/${item.id}`}
          className="flex min-w-0 flex-1 items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        >
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-control bg-surface-sunken md:h-16 md:w-16">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-ink-faint" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-snug text-ink">
              {item.name}
            </h3>
            {meta.length > 0 && (
              <p className="mt-1 truncate text-small text-ink-muted">{meta.join(' · ')}</p>
            )}
          </div>
        </Link>

        {soldOut ? (
          <span className="shrink-0 text-small text-ink-faint">Đã bán</span>
        ) : (
          <>
            {/* Dưới md: chỉ giá, không đổi. */}
            <span className="shrink-0 text-[16px] font-bold tabular-nums text-price md:hidden">
              {formatPrice(item.price)}
            </span>

            {/* Từ md: khung cố định cao 40px, hai lớp trượt qua nhau trong đó.
                overflow-hidden để lớp đang ở ngoài bị xén, không nhận chuột. */}
            <div className="relative hidden h-10 w-[148px] shrink-0 overflow-hidden md:block">
              <span className="absolute inset-0 flex items-center justify-end text-[17px] font-bold tabular-nums text-price transition-transform duration-200 ease-out group-hover:-translate-y-full group-focus-within:-translate-y-full">
                {formatPrice(item.price)}
              </span>

              <div className="absolute inset-0 flex translate-y-full items-center justify-end transition-transform duration-200 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className="inline-flex h-9 items-center gap-2 rounded-control bg-brand px-4 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:bg-ink-faint"
                >
                  {adding && <Loader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
