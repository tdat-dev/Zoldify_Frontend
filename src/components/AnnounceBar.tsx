import Link from 'next/link';
import { ShieldCheck, Wallet } from 'lucide-react';

/**
 * Thanh thông báo mảnh trên cùng, đúng vị trí và tỉ lệ của trang tham chiếu.
 * Trang mẫu để khuyến mãi ("Summer Sale 60% OFF", "Free shipping over $99");
 * Zoldify không có chương trình giảm giá nào nên đặt vào đó hai việc sàn làm
 * thật, chứ không bịa một đợt sale không tồn tại.
 */
export function AnnounceBar() {
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-2 text-[12px]">
        {/* min-w-0: không có nó thì `truncate` ở span con vô tác dụng — flex item
            mặc định không co dưới kích thước nội dung, và cả thanh đẩy tràn trang. */}
        <p className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden="true" />
          <span className="truncate">Zoldify giữ tiền tới khi đơn xong, không chuyển thẳng cho người lạ.</span>
          <Link href="/search" className="hidden shrink-0 font-semibold text-brand-tint underline-offset-2 hover:underline sm:inline">
            Xem hàng đang bán
          </Link>
        </p>
        <p className="hidden shrink-0 items-center gap-2 text-white/70 md:flex">
          <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
          Trả khi nhận hàng, ví Zoldify, hoặc thẻ qua PayOS
        </p>
      </div>
    </div>
  );
}
