import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Hero chỉ còn một câu và một lối đi.
 *
 * Ô tìm kiếm đã chuyển lên header (cùng hàng từ khoá gợi ý), nên hero không giữ
 * ô nào nữa — trước đó hai ô tìm kiếm cùng hiện một lúc trên cùng màn hình.
 *
 * Không có ảnh: endpoint sinh ảnh (cliproxy.zoldify.com) đang trả 502, ba
 * provider còn lại chưa có API key. Nên art direction ở đây do CHỮ gánh, và
 * trần chất lượng của hướng này được ghi nhận là "media-free vì ràng buộc".
 * Khi có ảnh thật, chỗ đặt là một dải ảnh tràn viền ngay dưới khối chữ này.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="pt-6 md:pt-9">
      {/* Cỡ chữ đã thử 136px cho lấp hết bề ngang: đo ra khối tiêu đề cao 277px,
          đẩy mục "Danh mục" xuống mép dưới màn hình 776px. Trên một sàn mà việc
          chính là TÌM MÓN, để khẩu hiệu to gấp mấy lần ô tìm kiếm là ngược thứ
          bậc — trang hét lên một câu rồi mới cho người ta làm việc của họ.

          56px: đủ để là tiêu đề trang, không giành chỗ của nội dung. Đổi lại,
          hero không còn "khoảnh khắc chữ cỡ viewport" — đây là đánh đổi có chủ ý
          nghiêng về công năng, không phải quên. */}
      <h1
        id="hero-title"
        className="animate-rise max-w-[16ch] text-[clamp(1.875rem,4.5vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink [text-wrap:balance]"
      >
        Đồ cũ còn tốt, giá sinh viên
      </h1>

      <p className="animate-rise mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-muted [animation-delay:60ms] md:text-[16px]">
        Giáo trình, laptop, đồ ký túc xá. Mua bán giữa sinh viên với nhau.
      </p>

      <div className="animate-rise mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 [animation-delay:120ms] md:mt-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-small font-semibold text-white transition-[background-color,transform] hover:bg-brand-dark active:scale-[0.98]"
        >
          Xem hàng đang bán
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="text-small text-ink-muted">
          Có đồ không dùng nữa?{' '}
          <Link href="/product/create" className="font-semibold text-brand hover:text-brand-dark">
            Đăng bán
          </Link>
        </p>
      </div>
    </section>
  );
}
