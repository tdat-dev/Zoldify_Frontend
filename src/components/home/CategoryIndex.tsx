import Link from 'next/link';

/**
 * Chỉ mục danh mục dạng bảng kê: tên danh mục, số món canh phải, ngăn nhau bằng
 * hairline. Không ô bo góc, không icon.
 *
 * Bản trước là hàng ô vuông có icon `Package` xám lặp lại — mà icon đó chẳng nói
 * gì về danh mục, nó chỉ lấp chỗ trống ở vị trí lẽ ra là ảnh. Bảy ô giống hệt
 * nhau chỉ khác dòng chữ bên dưới là "lưới thẻ giống nhau" trong danh sách cấm
 * của craft-rules.
 *
 * Số món chỉ in khi API trả về thật; không có thì để trống, không đoán.
 */
export function CategoryIndex({ categories }: { categories: any[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const count = Number(cat.product_count ?? cat.productCount);
        return (
          <li key={cat.id} className="border-b border-ink/10">
            <Link
              href={`/category/${cat.slug || cat.id}`}
              className="flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <span className="truncate text-[15px] font-medium text-ink transition-colors group-hover:text-brand">
                {cat.name}
              </span>
              {Number.isFinite(count) && count > 0 && (
                <span className="shrink-0 text-small tabular-nums text-ink-faint">{count}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
