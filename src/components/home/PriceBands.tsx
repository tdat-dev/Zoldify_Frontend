import Link from 'next/link';

/**
 * Lọc theo TẦM TIỀN — chỗ mà Shopee và Lazada để "Flash Sale" / "Deal Chớp Nhoáng".
 *
 * Đây là chất riêng của Zoldify, không phải bắt chước: ba sàn kia bán hàng mới
 * sản xuất hàng loạt nên trục tổ chức của họ là khuyến mãi (giảm bao nhiêu %,
 * còn mấy tiếng). Zoldify bán đồ cũ, mỗi món một cái, không có sale nào — trục
 * đúng với người mua ở đây là túi tiền. Sinh viên hỏi "có gì dưới trăm nghìn"
 * trước khi hỏi "có giảm mấy phần trăm".
 *
 * Mọi ô đều dẫn tới /search với price_min/price_max THẬT. Trang tìm kiếm trước
 * đây không đọc hai tham số này từ URL (chỉ đọc `q`), đã sửa cùng ngày để link
 * ở đây không phải link chết.
 */
const BANDS = [
  { label: 'Dưới 100k', hint: 'giáo trình, đồ lặt vặt', params: 'price_max=100000' },
  { label: '100k – 300k', hint: 'đồ dùng, phụ kiện', params: 'price_min=100000&price_max=300000' },
  { label: '300k – 1 triệu', hint: 'máy tính, tai nghe', params: 'price_min=300000&price_max=1000000' },
  { label: 'Trên 1 triệu', hint: 'laptop, xe đạp', params: 'price_min=1000000' },
];

export function PriceBands() {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-ink/10 lg:grid-cols-4">
      {BANDS.map((band) => (
        <li key={band.label}>
          <Link
            href={`/search?${band.params}&sort=newest`}
            className="flex h-full flex-col justify-center bg-surface-card px-4 py-5 transition-colors hover:bg-brand-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:px-5 md:py-6"
          >
            <span className="text-[17px] font-bold tabular-nums text-ink md:text-[19px]">
              {band.label}
            </span>
            <span className="mt-1 text-small text-ink-muted">{band.hint}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
