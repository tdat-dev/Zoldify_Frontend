import Link from 'next/link';
import { Plus } from 'lucide-react';

/**
 * Dải giới thiệu mỏng, không phải hero.
 *
 * Cả Shopee, Lazada lẫn Amazon đều KHÔNG có khối khẩu hiệu ở đầu trang — vào là
 * banner rồi hàng luôn, vì ai cũng biết họ bán gì. Zoldify thì chưa ai biết, và
 * hợp đồng LANDING_BRAND đòi người lần đầu phải hiểu được đối tượng, thứ được
 * mời và việc làm tiếp theo trong năm giây. Nên giữ một dòng, không giữ cả khối.
 *
 * Đã thử ngược lại hai lần: tiêu đề 136px thì đẩy nội dung xuống dưới màn hình,
 * 56px thì vẫn chiếm nguyên một màn trước khi thấy món nào. Ở đây nó thành một
 * dải cao chưa tới 80px và hàng bắt đầu ngay bên dưới.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-card bg-brand-tint px-4 py-4 md:px-5"
    >
      <div className="min-w-0">
        <h1 id="hero-title" className="text-h2 text-ink">
          Chợ đồ cũ của sinh viên
        </h1>
        <p className="mt-1 text-small text-ink-muted">
          Giáo trình, laptop, đồ ký túc xá. Mua bán giữa sinh viên với nhau.
        </p>
      </div>

      <Link
        href="/product/create"
        className="inline-flex shrink-0 items-center gap-2 rounded-control bg-brand px-4 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Đăng bán đồ cũ
      </Link>
    </section>
  );
}
