"use client";

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
}: {
  progress: number;
  className?: string;
  size?: number;
}) {
  // Xu lật nhẹ theo hành trình để thấy nó là vật thể, không phải chấm tròn.
  const spin = progress * 540;
  return (
    <span
      data-escrow-coin
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ transform: `rotateY(${spin}deg)` }}>
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
