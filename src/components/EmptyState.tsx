import type { ReactNode } from 'react';

/**
 * Trạng thái rỗng dùng chung cho các mặt phẳng CHIẾM CẢ TRANG — giỏ hàng, kết
 * quả tìm kiếm, danh mục, đơn hàng, thông báo.
 *
 * Cố ý tách khỏi SectionState: SectionState nằm bên trong những thẻ nhỏ (ô 2x2
 * của trang chủ) nên phải gọn, chỉ một dòng chữ. Ở đây thì cả khung trống, một
 * dòng chữ xám lửng lơ giữa vùng trắng đọc ra là "hỏng" chứ không phải "chưa có
 * gì" — nên có hình.
 *
 * Hình là nét vẽ đã tách nền trong suốt, KHÔNG phải icon thư viện: hộp rỗng nói
 * đúng nghĩa "chưa có gì trong này" ở một sàn đồ cũ, và giữ được nét xanh
 * thương hiệu thay vì màu xám mặc định của lucide.
 *
 * `title` nói CHUYỆN GÌ ĐANG XẢY RA, `hint` nói LÀM GÌ TIẾP. Trạng thái rỗng
 * không có lối đi tiếp là ngõ cụt — luôn truyền `action` khi người dùng còn
 * việc để làm.
 */
export function EmptyState({
  title,
  hint,
  action,
  className = '',
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center px-6 py-16 text-center ${className}`}>
      <img
        src="/media/empty-box.webp"
        alt=""
        width={320}
        height={231}
        loading="lazy"
        className="mb-6 h-auto w-[150px]"
      />
      <p className="text-body font-semibold text-ink">{title}</p>
      {hint && <p className="mt-2 max-w-[38ch] text-small leading-relaxed text-ink-muted">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
