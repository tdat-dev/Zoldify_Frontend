"use client";

import { useEffect, useRef, useState } from 'react';

const ANCHOR_SELECTOR = '[data-coin-anchor]';
const COIN_SELECTOR = '[data-escrow-coin]';
const TARGET_SELECTOR = '[data-coin-target]';
// Task 7 chưa gắn [data-coin-target] vào thẻ sản phẩm đầu tiên (không có backend
// trong môi trường này nên lưới sản phẩm rỗng). Chặng 3 của EscrowStages luôn có
// mặt, nên nó là đích dự phòng hợp lý: "tiền quay lại" cũng là một điểm kết thúc
// có nghĩa của hành trình, không phải một chỗ trú tạm bợ.
const FALLBACK_TARGET_SELECTOR = '[data-escrow-stage="refund"]';

/**
 * Tiến độ hành trình của đồng xu, 0 ở đỉnh trang và 1 khi tới đích, cộng khoảng
 * cách PIXEL thật (cả X lẫn Y) để đi từ VỊ TRÍ NGHỈ của xu tới đích đó.
 *
 * Vì sao có travelX/travelY: nếu chỉ trả `progress` và để nơi gọi tự nhân với
 * một hằng số vh áng chừng, con số đó không có lý do gì để khớp với vị trí thật
 * của đích. Bản nháp đầu tiên chỉ tính travel theo trục Y (bịa rằng đích luôn
 * nằm thẳng dưới chữ "GIỮ") — chụp ảnh ở nhiều mốc cuộn mới lộ ra: đích thật
 * (chặng "refund", hoặc giá sản phẩm sau Task 7) thường nằm ở CỘT khác trong
 * lưới nhiều cột, nên xu rơi thẳng thì trôi qua đúng cột của chặng "pay" và bị
 * thẻ đó che mất, không bao giờ chạm đích thật (xem task-6-report.md).
 *
 * Vì sao mốc là VỊ TRÍ NGHỈ CỦA XU chứ không phải `[data-coin-anchor]`: xu
 * không nằm đúng góc trái-trên của neo — nó lệch sang phải bằng CSS
 * (`-right-[0.72em]`) để nằm cạnh chữ "GIỮ". Nếu lấy neo làm mốc, offset lệch
 * đó (~1 bề rộng chữ) bị cộng dồn vào travelX, khiến xu hạ cánh lố hẳn sang
 * phải so với đích thật (lỗi này bắt được khi so ảnh chụp, không phải đoán).
 * Nên đo đúng một lần vị trí nghỉ của `[data-escrow-coin]` so với neo — lúc
 * effect này chạy lần đầu, progress vẫn là giá trị khởi tạo 0 nên DOM chắc
 * chắn chưa có transform nào — rồi dùng độ lệch đó cho mọi lần tính sau,
 * cộng với vị trí neo hiện tại (neo luôn đo đúng vì bản thân nó không bị
 * transform).
 *
 * Đồng xu được đặt `position: absolute` bên trong neo (không phải `fixed`), nên
 * bản thân neo đã cuộn theo trang; khoảng lệch giữa neo và đích tính bằng
 * getBoundingClientRect() không đổi theo scrollY (cả hai cuộn cùng tốc độ), nên
 * chỉ cần đo lại khi bố cục thật sự đổi (resize, hoặc nội dung load xong).
 */
export function useCoinJourney() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [travelX, setTravelX] = useState(0);
  const [travelY, setTravelY] = useState(0);
  const restOffset = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduced) { setProgress(0); setTravelX(0); setTravelY(0); return; }

    let raf = 0;

    const compute = () => {
      raf = 0;
      const anchor = document.querySelector(ANCHOR_SELECTOR);
      const target = document.querySelector(TARGET_SELECTOR) || document.querySelector(FALLBACK_TARGET_SELECTOR);
      if (!anchor || !target) { setProgress(0); setTravelX(0); setTravelY(0); return; }

      const anchorRect = anchor.getBoundingClientRect();

      // Lần gọi đầu tiên: xu chắc chắn chưa bị transform (progress khởi tạo là
      // 0), nên đây là dịp DUY NHẤT đo an toàn vị trí nghỉ thật của nó.
      if (!restOffset.current) {
        const coin = document.querySelector(COIN_SELECTOR);
        if (coin) {
          const coinRect = coin.getBoundingClientRect();
          restOffset.current = { x: coinRect.left - anchorRect.left, y: coinRect.top - anchorRect.top };
        }
      }
      const offset = restOffset.current || { x: 0, y: 0 };

      const targetRect = target.getBoundingClientRect();
      // Hạ cánh ở MÉP TRÁI của đích (không phải tâm) — với chặng dự phòng đó
      // là mép trái thẻ; với giá sản phẩm (Task 7) đó là ngay trước chữ số đầu.
      setTravelX(targetRect.left - (anchorRect.left + offset.x));
      setTravelY(targetRect.top - (anchorRect.top + offset.y));

      // Tiến độ cuộn: 0 ở đỉnh trang, 1 khi đích tới điểm "hạ cánh" — lấy mốc
      // 55% chiều cao viewport để đích chạm điểm đó đúng lúc người dùng đang
      // nhìn vào khu vực đó, không phải mép trên/dưới màn hình.
      const end = window.scrollY + targetRect.top - window.innerHeight * 0.55;
      const span = Math.max(end, 1);
      const p = Math.min(Math.max(window.scrollY / span, 0), 1);
      setProgress(p);
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Lưới sản phẩm/danh mục load xong (async, không có backend thật trong môi
    // trường dev thì mãi ở trạng thái loading) làm chiều cao trang đổi sau khi
    // mount — không có sự kiện scroll/resize nào báo việc này, nên cần theo dõi
    // riêng để travel*/progress không bị đứng lại với số đo lỗi thời.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    ro?.observe(document.body);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return { progress, reduced, travelX, travelY };
}
