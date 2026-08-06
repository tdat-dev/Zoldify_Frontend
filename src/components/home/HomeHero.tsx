"use client";

import Link from 'next/link';
import { EscrowCoin } from './EscrowCoin';

export function HomeHero({
  coinProgress,
  reduced,
  coinX,
  coinY,
}: {
  coinProgress: number;
  reduced: boolean;
  coinX: number;
  coinY: number;
}) {
  return (
    // z-dropdown (token có tên, xem tailwind.config.ts — thang hợp lệ chỉ có
    // dropdown/sticky/backdrop/modal/toast/tooltip, không được dùng số rời).
    // Xu di chuyển RA NGOÀI khung hero (đi xuống các section sau bằng absolute
    // + translate lớn). Không nâng z-index ở đây thì hero vẫn nằm đúng thứ tự
    // DOM (trước EscrowStages) nên bị bg-surface-card của các thẻ chặng vẽ ĐÈ
    // LÊN — xu biến mất giữa chừng khi bay ngang qua chúng.
    //
    // Vì sao nâng cả SECTION thay vì chỉ nâng riêng đồng xu: z-index chỉ so
    // sánh được giữa các phần tử CÙNG một ngữ cảnh xếp lớp (stacking context).
    // Xu và các thẻ EscrowStages không phải anh em trực tiếp — chúng chỉ gặp
    // nhau ở cấp <section> (hero) so với <section> (EscrowStages), hai anh em
    // trong page.tsx. z-index đặt sâu bên trong (trên chính xu, hay trên span
    // neo) chỉ tranh thứ tự với các phần tử KHÁC trong cùng hero, không bao
    // giờ "thoát" ra để so với EscrowStages — nhất là ở md+ nơi div breakout
    // (`md:-translate-x-1/2`) tự tạo một stacking context riêng bọc quanh xu,
    // cô lập nó khỏi mọi thứ ngoài div đó. Nâng đúng ở cấp section — nơi hero
    // và EscrowStages thật sự là anh em — là phạm vi nhỏ nhất còn hoạt động.
    // Header sticky dùng z-sticky (200, xem tailwind.config.ts) nên vẫn ở trên
    // z-dropdown (100) — đã xác nhận lại bằng ảnh chụp cuộn qua header.
    <section className="relative z-dropdown pt-10 pb-14 md:pt-16 md:pb-20">
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
          <span data-coin-anchor className="relative inline-flex items-baseline">
            GIỮ
            <EscrowCoin
              progress={reduced ? 0 : coinProgress}
              size={0}
              className="!w-[0.62em] !h-[0.62em] absolute -right-[0.72em] top-[0.16em]"
              style={
                reduced
                  ? undefined
                  : { transform: `translate3d(${coinX}px, ${coinY}px, 0)` }
              }
            />
          </span>
          <br />
          TIỀN HỘ
        </h1>
      </div>

      <p className="mt-7 max-w-[46ch] text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.55] text-ink-muted [text-wrap:pretty]">
        Bạn chuyển tiền cho Zoldify, không chuyển cho người lạ. Trong lúc hàng đang đi, người bán không rút được đồng nào.
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
