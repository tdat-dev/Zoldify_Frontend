import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Masthead của sổ kê, không phải hero panel.
 *
 * Một câu, một dòng dẫn, một lối đi, rồi hết. Ô tìm kiếm nằm ở header (cùng
 * hàng từ khoá gợi ý), nên chỗ này không giữ ô nào.
 *
 * Cỡ chữ: đã thử 136px ngày 2026-08-07, đo được khối tiêu đề cao 277px và đẩy
 * mục đầu tiên xuống mép dưới màn hình 776px. Trên một sàn mà việc chính là tìm
 * món, khẩu hiệu to gấp mấy lần ô tìm kiếm là ngược thứ bậc. Giữ ở 52px: đủ để
 * là tiêu đề trang, không giành chỗ của hàng.
 *
 * Không có ảnh: `cliproxy.zoldify.com` trả 502 (3 lần thử, 2 phiên), ba provider
 * còn lại chưa có key. Hướng media-free có chủ đích — cấu trúc và vạch hairline
 * gánh art direction. Không đặt hình khối giả vào chỗ của ảnh.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pb-8 pt-8 md:pb-11 md:pt-14">
      <div className="md:flex md:items-end md:justify-between md:gap-12">
        <div className="min-w-0">
          <h1
            id="hero-title"
            className="animate-rise max-w-[15ch] text-[clamp(1.875rem,4.2vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink [text-wrap:balance]"
          >
            Đồ cũ còn tốt, giá sinh viên
          </h1>
          <p className="animate-rise mt-3.5 max-w-[48ch] text-[15px] leading-relaxed text-ink-muted [animation-delay:60ms] md:text-[16px]">
            Giáo trình, laptop, đồ ký túc xá. Mua bán giữa sinh viên với nhau.
          </p>
        </div>

        <div className="animate-rise mt-6 shrink-0 [animation-delay:120ms] md:mt-0">
          <Link
            href="/product/create"
            className="inline-flex items-center gap-2 rounded-control border border-ink/16 px-5 py-2.5 text-small font-semibold text-ink transition-colors hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            Đăng bán đồ cũ
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
