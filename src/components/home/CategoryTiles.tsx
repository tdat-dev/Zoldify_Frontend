import Link from 'next/link';

/**
 * Lưới danh mục dạng ô — khuôn lấy từ khối "CATEGORIES" của shopee.vn (xem
 * 2026-08-08): một khối trắng, tiêu đề viết hoa mảnh ở trên, bên dưới là lưới ô
 * đều nhau ngăn bằng hairline, mỗi ô có hình tròn ở giữa và tên bên dưới.
 *
 * Shopee đặt ảnh sản phẩm đại diện trong hình tròn. Zoldify dùng ảnh danh mục
 * khi API trả về; danh mục chưa có ảnh thì hiện chữ cái đầu chứ KHÔNG để một ô
 * xám rỗng — ô rỗng ở vị trí lẽ ra là ảnh đọc ra là "hỏng ảnh".
 */
export function CategoryTiles({ categories }: { categories: any[] }) {
  return (
    // h-full: cột bên phải cao theo ảnh flat-lay, không phải theo số danh mục.
    // Thiếu h-full thì thẻ trắng dừng ở chiều cao tự nhiên và để lộ một mảng nền
    // xám bên dưới — trông như thẻ bị cắt cụt.
    <section
      aria-labelledby="cat-tiles"
      className="flex h-full flex-col overflow-hidden rounded-card bg-surface-card"
    >
      <h2
        id="cat-tiles"
        className="border-b border-ink/10 px-5 py-3.5 text-small font-semibold uppercase tracking-wide text-ink-muted"
      >
        Danh mục
      </h2>

      {/* Viền trên TỪNG ô, không dùng gap-px trên nền màu: với gap-px, hàng cuối
          thiếu ô sẽ để lộ nguyên mảng nền xám ở chỗ trống — đo được khi 6 danh
          mục xếp trên lưới 5 cột. Viền từng ô thì ô trống đơn giản không tồn tại. */}
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">
        {categories.map((cat) => {
          const count = Number(cat.product_count ?? cat.productCount);
          return (
            <li key={cat.id} className="border-b border-r border-ink/10">
              <Link
                href={`/category/${cat.slug || cat.id}`}
                className="flex h-full flex-col items-center gap-2 bg-surface-card px-2 py-4 text-center transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
              >
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-brand-tint">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[19px] font-bold text-brand" aria-hidden="true">
                      {String(cat.name || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="clamp-2 text-caption font-normal leading-tight text-ink">
                  {cat.name}
                </span>
                {Number.isFinite(count) && count > 0 && (
                  <span className="text-caption font-normal tabular-nums text-ink-faint">
                    {count} món
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
