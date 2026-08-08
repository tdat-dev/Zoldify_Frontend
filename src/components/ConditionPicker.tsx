"use client";

import { useTranslations } from 'next-intl';
import { CONDITION_VALUES, type ConditionValue } from '@/lib/product-condition';

/**
 * Chọn tình trạng món đồ — bốn mức có mô tả, không phải dropdown.
 *
 * Đây là trường quan trọng nhất của một sàn đồ cũ: người mua đọc nó kỹ hơn cả
 * giá, và chọn sai là nguồn gốc của phần lớn đơn bị trả. Nên nó được bày ra hết
 * kèm câu giải thích, thay vì giấu trong một select ba dòng như form niêm yết
 * hàng mới của các sàn khác.
 *
 * Nhãn và mô tả lấy từ file ngôn ngữ (`condition.*`), nên đổi sang tiếng Anh là
 * đủ nghĩa chứ không phải chữ Việt còn sót lại.
 */
export function ConditionPicker({
  value,
  onChange,
}: {
  value: ConditionValue;
  onChange: (next: ConditionValue) => void;
}) {
  const t = useTranslations('condition');
  const tSell = useTranslations('sell');

  return (
    <fieldset>
      <legend className="sr-only">{tSell('conditionLegend')}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CONDITION_VALUES.map((c) => {
          const active = value === c;
          return (
            <label
              key={c}
              className={`flex cursor-pointer gap-3 rounded-control border p-3.5 transition-colors ${
                active ? 'border-brand bg-brand-tint' : 'border-ink/16 hover:border-ink/30'
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={c}
                checked={active}
                onChange={() => onChange(c)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="min-w-0">
                <span className="block text-small font-semibold text-ink">{t(c)}</span>
                <span className="mt-0.5 block text-caption font-normal leading-snug text-ink-muted">
                  {t(`${c}Hint`)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
