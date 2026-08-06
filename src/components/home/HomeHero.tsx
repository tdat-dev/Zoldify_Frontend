"use client";

import Link from 'next/link';
import { EscrowCoin } from './EscrowCoin';

export function HomeHero({
  coinProgress,
  reduced,
  coinTravelX,
  coinTravelY,
}: {
  coinProgress: number;
  reduced: boolean;
  coinTravelX: number;
  coinTravelY: number;
}) {
  // Xu rơi thẳng theo Y trong suốt hành trình, nhưng chỉ bắt đầu tấp ngang
  // sang cột của đích ở 35% CUỐI — nếu tấp ngang ngay từ đầu, nó cắt chéo qua
  // toàn bộ đoạn văn/nút bấm của hero trông như một vệt bay lạc, không như một
  // đồng tiền rơi rồi tấp vào đúng chỗ ở cuối.
  const xEase = Math.min(Math.max((coinProgress - 0.65) / 0.35, 0), 1);
  const coinX = xEase * coinTravelX;
  const coinY = coinProgress * coinTravelY;
  return (
    // z-20: xu di chuyển RA NGOÀI khung hero (đi xuống các section sau bằng
    // absolute + translate lớn). Không có z-index tường minh ở đây, nó vẫn
    // nằm đúng thứ tự DOM (trước EscrowStages) nên bị bg-surface-card của các
    // thẻ chặng vẽ ĐÈ LÊN — xu biến mất giữa chừng khi bay ngang qua chúng.
    // Nâng cả section hero lên một ngữ cảnh xếp lớp riêng để xu (và mọi thứ
    // bên trong hero) luôn vẽ trên các section liền sau nó.
    <section className="relative z-20 pt-10 pb-14 md:pt-16 md:pb-20">
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
