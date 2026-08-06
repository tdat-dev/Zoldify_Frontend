import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative overflow-x-clip pt-10 pb-14 md:pt-16 md:pb-20">
      <p className="label-condensed text-ink-muted mb-5">Đồ cũ, vẫn chất</p>

      {/* Điểm phá bố cục: chữ tràn khỏi mép trái canvas từ md trở lên. */}
      <h1 className="hero-display text-ink md:-ml-[7vw] lg:-ml-[9vw]">
        <span data-coin-anchor className="relative inline-flex items-baseline">GIỮ</span>
        <br />
        TIỀN HỘ
      </h1>

      <p className="mt-7 max-w-[46ch] text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.55] text-ink-muted [text-wrap:pretty]">
        Bạn chuyển tiền cho Zoldify, không chuyển cho người lạ. Người bán chỉ lấy được khi bạn bấm đã nhận hàng.
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href="/search"
          data-hero-cta
          className="px-6 py-3 bg-brand text-white rounded-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Tìm giáo trình, đồ dùng
        </Link>
        <Link
          href="/product/create"
          data-hero-cta
          className="px-6 py-3 border border-ink/25 text-ink rounded-sm font-medium hover:bg-ink/5 transition-colors"
        >
          Đăng bán đồ của bạn
        </Link>
      </div>
    </section>
  );
}
