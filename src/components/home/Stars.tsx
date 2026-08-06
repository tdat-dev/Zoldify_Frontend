import { Star } from 'lucide-react';

/**
 * Dải 5 sao có nửa sao, dùng cho thẻ sản phẩm và hero.
 * Điểm truyền vào hiện là số DEMO (xem src/lib/demo.ts) vì API danh sách chưa
 * trả điểm đánh giá tổng.
 */
export function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-[1px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-amber-300" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star
                className="text-amber-400"
                style={{ width: size, height: size }}
                fill="currentColor"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
