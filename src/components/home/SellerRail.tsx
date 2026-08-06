import Link from 'next/link';
import { Package } from 'lucide-react';

/**
 * "Người bán trên Zoldify" — khối duy nhất trên trang chủ mà chỉ chợ C2C mới có.
 *
 * Chợ Tốt, Carousell, Mercari đều bán NGƯỜI trước khi bán MÓN: người mua quyết
 * định dựa vào việc người bán là ai, đang bán bao nhiêu món, đã bán được mấy
 * món. Trang chủ trước đó có 48 món và 0 khuôn mặt — đó là lý do nó đọc ra như
 * một shop bán sỉ chứ không phải một cái chợ.
 *
 * Dữ liệu THẬT hết: gom các món đang bán theo seller.id, đếm số món và tổng đã
 * bán, lấy 3 ảnh đầu làm thumbnail. Không có avatar thì dùng chữ cái đầu tên.
 */
type Seller = {
  id: number;
  name: string;
  avatar?: string;
  items: any[];
  sold: number;
};

function groupBySeller(products: any[]): Seller[] {
  const map = new Map<number, Seller>();
  for (const p of products) {
    const s = p.seller;
    if (!s?.id) continue;
    const cur: Seller =
      map.get(s.id) ?? { id: s.id, name: s.name || 'Người bán', avatar: s.avatar, items: [] as any[], sold: 0 };
    cur.items.push(p);
    cur.sold += Number(p.sold) || 0;
    map.set(s.id, cur);
  }
  // Array.from thay cho spread: tsconfig của dự án target dưới ES2015 nên không
  // iterate được MapIterator bằng spread.
  return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
}

export function SellerRail({ products }: { products: any[] }) {
  const sellers = groupBySeller(products).slice(0, 3);
  // Dưới 2 người bán thì lưới 3 cột chỉ ra một thẻ lẻ loi bên trái, đọc ra như
  // khối bị lỗi. Thà không hiện còn hơn hiện một cái chợ có đúng một người.
  if (sellers.length < 2) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sellers.map((s) => (
        <Link
          key={s.id}
          href={`/shop?seller=${s.id}`}
          className="group flex flex-col rounded-xl border border-ink/12 bg-surface-card p-4 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(20,30,60,0.18)]"
        >
          <div className="flex items-center gap-3">
            {s.avatar ? (
              <img
                src={s.avatar}
                alt=""
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-bold text-white">
                {s.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{s.name}</p>
              <p className="text-[12px] text-ink-muted">
                {s.items.length} món đang bán
                {s.sold > 0 && ` · đã bán ${s.sold}`}
              </p>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-2">
            {s.items.slice(0, 3).map((it) => (
              <div key={it.id} className="aspect-square overflow-hidden rounded-md bg-surface-sunken">
                {it.image ? (
                  <img src={it.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-4 w-4 text-ink-faint" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
