import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative pt-10 pb-14 md:pt-16 md:pb-20">
      <p className="label-condensed text-ink-muted mb-5">Đồ cũ, vẫn chất</p>

      {/* Điểm phá bố cục: khối chữ display thoát khỏi cột nội dung căn giữa và
          chạm ĐÚNG mép trái viewport (x = 0) từ md trở lên — không đi xa hơn
          mép đó. Kỹ thuật "full-bleed breakout": left-1/2 + w-screen +
          -translate-x-1/2 định vị lại khối theo toạ độ viewport thật, bất kể
          container cha đang căn giữa/có padding bao nhiêu, nên lề âm cố định
          theo vw (bản cũ) không còn cần nữa — nó từng đẩy chữ đi xa hơn mép
          cắt thật của overflow-x-clip (vốn nằm ở mép trong của container có
          padding, không phải mép viewport), làm mất hẳn chữ cái đầu dòng ở
          các bề rộng md/lg/xl. overflow-x-clip cho container này giờ đặt ở
          div ngoài cùng của page.tsx (span toàn bộ viewport thật) thay vì ở
          section, để không cắt hụt phần thoát khung. */}
      <div className="md:relative md:left-1/2 md:w-screen md:-translate-x-1/2">
        <h1 className="hero-display text-ink">
          <span data-coin-anchor className="relative inline-flex items-baseline">GIỮ</span>
          <br />
          TIỀN HỘ
        </h1>
      </div>

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
