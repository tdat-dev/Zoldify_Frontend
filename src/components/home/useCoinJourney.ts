"use client";

import { useEffect, useRef, useState } from 'react';

const COIN_SELECTOR = '[data-escrow-coin]';
const TARGET_SELECTOR = '[data-coin-target]';
// Task 7 chưa gắn [data-coin-target] vào thẻ sản phẩm đầu tiên (không có backend
// trong môi trường này nên lưới sản phẩm rỗng). Chặng 3 của EscrowStages luôn có
// mặt, nên nó là đích dự phòng hợp lý: "tiền quay lại" cũng là một điểm kết thúc
// có nghĩa của hành trình, không phải một chỗ trú tạm bợ.
//
// Đích trỏ vào PHẦN TỬ NỘI DUNG CUỐI CÙNG bên trong thẻ (data-coin-landing-marker,
// gắn ở EscrowStages.tsx), KHÔNG PHẢI cả thẻ <li> ([data-escrow-stage="refund"]
// cũ). Lý do: "hạ cánh ngay dưới đích" (landingTop = targetRect.bottom, xem dưới)
// là một đích hình học phụ thuộc HOÀN TOÀN vào kích thước của target — với target
// là cả thẻ (to), hạ cánh dưới nó đặt xu hẳn ra NGOÀI thẻ, trôi lơ lửng trong
// khoảng trống xám bên dưới, không chạm gì cả (xác nhận bằng ảnh chụp thật:
// coin.top === target.bottom chính xác tới 0.0004px nhưng vẫn ĐỌC như trôi vô
// định, vì đường viền thẻ là một đường thẳng còn xu chỉ chạm đúng mép đó chứ
// không đè lên gì). Với target là phần tử nội dung cuối (nhỏ, giống hệt cách đích
// thật — giá sản phẩm — cũng là một <span> nhỏ nằm SÂU trong thẻ), hạ cánh ngay
// dưới nó khiến xu tràn qua vùng đệm còn lại của thẻ rồi hơi lấn ra mép — một cú
// straddle giống hệt đường có dữ liệu thật, đọc được là "tiền vừa tới nơi".
const FALLBACK_TARGET_SELECTOR = '[data-coin-landing-marker]';

// Xu chỉ bắt đầu tấp ngang sang cột của đích ở 35% CUỐI hành trình — nếu tấp
// ngang ngay từ đầu, nó cắt chéo qua toàn bộ đoạn văn/nút CTA của hero trông
// như một vệt bay lạc, không như một đồng tiền rơi rồi tấp vào đúng chỗ ở cuối.
const X_EASE_START = 0.65;

/**
 * Toạ độ PIXEL cuối cùng (`coinX`, `coinY`) để dịch chuyển đồng xu bằng
 * `transform: translate3d(coinX, coinY, 0)`, cộng `progress` (0→1, cho
 * EscrowCoin tự tính góc xoay) và `reduced` (prefers-reduced-motion).
 *
 * Đích là [data-coin-target] nếu có (Task 7 sẽ gắn vào giá sản phẩm đầu tiên),
 * fallback [data-escrow-stage="refund"] hôm nay (chưa có backend).
 *
 * === Vì sao đo PIXEL thật thay vì hằng số vh ===
 * Bản nháp đầu chỉ tính travel theo trục Y (bịa rằng đích luôn nằm thẳng dưới
 * chữ "GIỮ") — chụp ảnh ở nhiều mốc cuộn mới lộ ra: đích thật thường nằm ở CỘT
 * khác trong lưới nhiều cột, nên xu rơi thẳng thì trôi qua đúng cột của chặng
 * "pay" và bị thẻ đó che mất, không bao giờ chạm đích thật. Sửa bằng cách đo
 * lệch CẢ HAI trục giữa vị trí nghỉ của xu và đích (xem task-6-report.md).
 *
 * === Vì sao hạ cánh NGAY DƯỚI đích (chạm mép dưới), không phải một góc bên
 * trong đích ===
 * Bản sửa 2D đầu tiên hạ cánh ở góc TRÊN-TRÁI đích — với thẻ "refund" đó đúng
 * là góc chứa nhãn "CHẶNG 3" và tiêu đề, xu đáp thẳng lên chữ. Bản sửa tiếp
 * theo đổi sang góc DƯỚI-PHẢI, đoán rằng góc đó luôn trống — SAI: thẻ "refund"
 * cao 161px, trừ padding p-6 (24px x2) chỉ còn ~113px cho nhãn+tiêu đề+mô tả
 * hai dòng, gần như KÍN cả thẻ, dòng cuối của đoạn mô tả vẫn vươn tới đúng góc
 * dưới-phải — đo lại bằng cách so giao (bounding-box intersection) giữa xu và
 * MỌI phần tử có chữ trong DOM mới bắt được overlap ~2564px² với `<p>` mô tả,
 * dù đã giảm so với bản trước. Bài học: không có góc nào BÊN TRONG một hộp gần
 * kín chữ là "chắc chắn trống" chỉ bằng suy đoán hình học của hộp cha.
 *
 * Sửa triệt để: hạ cánh NGAY DƯỚI đích, xu KHÔNG BAO GIỜ đi vào bên trong hộp
 * của đích — `landingTop = targetRect.bottom` (mép trên của xu chạm đúng mép
 * dưới của đích) là một đảm bảo HÌNH HỌC, không phải suy đoán: hai hộp không
 * giao nhau theo trục Y thì không thể có phần tử chữ nào bên trong đích bị xu
 * che, bất kể đích ngắn hay dài, bất kể nội dung đổi sau này. Căn theo mép
 * phải của đích (`landingLeft = targetRect.right - coinW`) để xu vẫn đọc là
 * "cạnh đích", không trôi ra giữa hư không — đã xác nhận bằng ảnh chụp + quét
 * giao nhau với toàn bộ text trong DOM ở khung hạ cánh (task-6-report.md).
 *
 * === Vì sao đo lại vị trí nghỉ của xu MỖI LẦN, không phải một lần duy nhất ===
 * Bản trước đo vị trí nghỉ của [data-escrow-coin] MỘT LẦN lúc mount (lúc đó
 * chắc chắn transform=identity) rồi giữ mãi. Nhưng độ lệch giữa xu và neo tính
 * bằng CSS `em` (`-right-[0.72em]`), còn `.hero-display` dùng
 * `clamp(3.25rem, 9vw, 8.5rem)` — cỡ chữ đổi theo bề rộng cửa sổ trong khoảng
 * ~577–1511px, nên độ lệch đó cũng đổi theo mỗi lần resize mà không có gì báo
 * lại cho hook (reviewer bắt lỗi này, không phải tự phát hiện).
 *
 * Sửa bằng cách TỰ SỬA SAI mỗi khung hình thay vì đo một lần: mỗi lần compute
 * chạy, đọc vị trí ĐANG VẼ của xu (`coinRect`), trừ đi đúng độ dịch mà LẦN
 * TRƯỚC hook vừa áp (`lastApplied`, tự nhớ trong ref) để suy ra vị trí nghỉ
 * THẬT ở khung hình này — luôn đúng bất kể cỡ chữ vừa đổi hay chưa, không cần
 * biết "lúc nào là lúc an toàn để đo".
 */
export function useCoinJourney() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [coinX, setCoinX] = useState(0);
  const [coinY, setCoinY] = useState(0);
  const lastApplied = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduced) {
      setProgress(0);
      setCoinX(0);
      setCoinY(0);
      lastApplied.current = { x: 0, y: 0 };
      return;
    }

    let raf = 0;

    const compute = () => {
      raf = 0;
      const coin = document.querySelector(COIN_SELECTOR);
      const target = document.querySelector(TARGET_SELECTOR) || document.querySelector(FALLBACK_TARGET_SELECTOR);
      if (!coin || !target) {
        setProgress(0);
        setCoinX(0);
        setCoinY(0);
        lastApplied.current = { x: 0, y: 0 };
        return;
      }

      const coinRect = coin.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      // Gỡ đúng độ dịch đã áp lần trước để lấy vị trí nghỉ THẬT hiện tại (xem
      // JSDoc phía trên) — luôn khớp cỡ chữ hiện hành, không phụ thuộc thời
      // điểm đo.
      const restLeft = coinRect.left - lastApplied.current.x;
      const restTop = coinRect.top - lastApplied.current.y;

      // Hạ cánh NGAY DƯỚI đích, chạm mép dưới — xem JSDoc phía trên. Đây là
      // đảm bảo hình học: landingTop >= targetRect.bottom nên hộp của xu
      // không bao giờ giao với hộp của đích theo trục Y.
      const landingLeft = targetRect.right - coinRect.width;
      const landingTop = targetRect.bottom;
      const travelX = landingLeft - restLeft;
      const travelY = landingTop - restTop;

      // Tiến độ cuộn: 0 ở đỉnh trang, 1 khi đích tới điểm "hạ cánh" — lấy mốc
      // 55% chiều cao viewport để đích chạm điểm đó đúng lúc người dùng đang
      // nhìn vào khu vực đó, không phải mép trên/dưới màn hình.
      const end = window.scrollY + targetRect.top - window.innerHeight * 0.55;
      const span = Math.max(end, 1);
      const p = Math.min(Math.max(window.scrollY / span, 0), 1);

      const xEase = Math.min(Math.max((p - X_EASE_START) / (1 - X_EASE_START), 0), 1);
      const nextX = xEase * travelX;
      const nextY = p * travelY;

      setProgress(p);
      setCoinX(nextX);
      setCoinY(nextY);
      // Đây là "vị trí đã cam kết" cho lần tự sửa TIẾP THEO — không phụ thuộc
      // việc React đã re-render xong hay chưa, vì đây chỉ là bộ nhớ nội bộ
      // của hook, không đọc lại từ DOM.
      lastApplied.current = { x: nextX, y: nextY };
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Lưới sản phẩm/danh mục load xong (async, không có backend thật trong môi
    // trường dev thì mãi ở trạng thái loading) làm chiều cao trang đổi sau khi
    // mount — không có sự kiện scroll/resize nào báo việc này, nên cần theo dõi
    // riêng để coinX/coinY/progress không bị đứng lại với số đo lỗi thời.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    ro?.observe(document.body);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return { progress, reduced, coinX, coinY };
}
