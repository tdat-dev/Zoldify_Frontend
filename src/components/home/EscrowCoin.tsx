"use client";

import type { CSSProperties } from 'react';

/**
 * Đồng xu ký quỹ. Nó KHÔNG mang trạng thái của một đơn hàng nào.
 * Nó chỉ minh hoạ cơ chế chung: tiền đứng lại rồi mới đi tiếp.
 * Vẽ trạng thái escrow lên từng tin đăng là bịa dữ liệu (tin chưa bán
 * thì chưa có escrow), nên tuyệt đối không làm.
 */
export function EscrowCoin({
  progress,
  className = '',
  size = 64,
  style,
}: {
  progress: number;
  className?: string;
  size?: number;
  style?: CSSProperties;
}) {
  // Xu lật theo hành trình để thấy nó là vật thể, không phải chấm tròn.
  // Hệ số PHẢI là bội số của 360: ở progress=1 xu phải hạ cánh đúng góc 0deg
  // (chính diện, ₫ đọc xuôi). Một bội số lẻ của 180 (vd 540) khiến progress=1
  // hạ cánh ở 180deg — cos(180)=-1 — xu lật gương, ký hiệu tiền hiện ngược.
  //
  // Hệ số là 360 (một vòng), không phải 720 (hai vòng): không có `perspective`
  // trên tổ tiên nên rotateY thu bề rộng theo cos(góc) — ở góc 90/270deg xu
  // mỏng dính (gần như biến mất), ở 180deg xu lật gương. Đó là vật lý đúng của
  // một đồng xu lật, không phải lỗi. Nhưng người dùng cuộn rồi DỪNG lại giữa
  // hành trình có thể dừng đúng lúc đó. Dùng 720 thì việc này xảy ra ở progress
  // 0.125/0.25/0.375/0.625/0.75/0.875 (6 điểm); dùng 360 thì chỉ còn 0.25/0.5/0.75
  // (3 điểm) — bằng đúng một nửa. Không thể triệt tiêu hoàn toàn (một vòng lật
  // 3D luôn phải đi qua góc rìa), nên đây là quyết định GIẢM RỦI RO, không phải
  // xoá rủi ro; đã xem trực tiếp ảnh chụp ở scroll dừng giữa chừng trước khi
  // chốt (xem task-6-report.md).
  const spin = progress * 360;
  return (
    <span
      data-escrow-coin
      aria-hidden="true"
      className={`inline-block will-change-transform ${className}`}
      style={{ width: size || undefined, height: size || undefined, ...style }}
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ transform: `rotateY(${spin}deg)` }}>
        <circle cx="32" cy="32" r="30" fill="var(--brand-solid)" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="var(--brand-accent-solid)" strokeWidth="3" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" />
        <text
          x="32"
          y="43"
          textAnchor="middle"
          fill="#fff"
          fontSize="30"
          fontWeight="700"
          fontFamily="var(--font-archivo), sans-serif"
        >
          ₫
        </text>
      </svg>
    </span>
  );
}
