"use client";

import { useTranslations } from 'next-intl';
import { normalizeCondition } from '@/lib/product-condition';

/**
 * Hiển thị tình trạng món đồ ở nơi CHỈ ĐỌC (trang chi tiết, thẻ hàng, đơn hàng).
 *
 * Đi qua `normalizeCondition` nên giá trị lạ trong DB — kể cả `used` và
 * `refurbished` do các bản trước ghi vào — vẫn ra một nhãn đọc được, thay vì in
 * nguyên chuỗi máy ra mặt trang cho người mua đọc.
 *
 * Trên sàn đồ cũ đây là thông tin hạng nhất, nên nó là một nhãn có nền chứ không
 * phải một dòng chữ xám lẫn giữa các thuộc tính khác.
 */
export function ConditionBadge({ value }: { value: unknown }) {
  const t = useTranslations('condition');
  const c = normalizeCondition(value);

  // Càng cũ càng lùi về tông trung tính; "mới" và "như mới" mới được tô đậm.
  const tone =
    c === 'new' || c === 'like_new'
      ? 'bg-state-success-bg text-state-success-fg'
      : 'bg-state-neutral-bg text-state-neutral-fg';

  return (
    <span
      className={`inline-flex items-center rounded-control px-2.5 py-1 text-small font-semibold ${tone}`}
    >
      {t(c)}
    </span>
  );
}
