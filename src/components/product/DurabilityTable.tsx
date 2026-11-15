"use client";

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { ConditionDetails } from '@/lib/condition-details';

/**
 * Thẻ "Độ bền" ở trang chi tiết: chỉ hiện dòng người bán đã khai, không có dòng
 * nào thì không hiện gì. Một dòng "Pin: –" trên trang công khai đọc như người bán
 * giấu, trong khi phần lớn chỉ là họ chưa điền.
 *
 * Cùng cột nhãn `w-32` với các dòng Tình trạng, Khu vực phía trên để mắt người
 * mua đi thẳng một hàng; nhãn vì thế phải ngắn ("Phụ kiện", không phải "Phụ kiện
 * kèm theo" như ở form). Khuyết điểm đứng ngay sau các con số: đó là dòng người
 * mua đồ cũ tìm trước tiên.
 */
export function DurabilityTable({
  details,
}: {
  details: ConditionDetails | null | undefined;
}) {
  const t = useTranslations('durability');
  if (!details) return null;

  const dong: { k: string; v: ReactNode }[] = [];
  if (details.battery_health !== undefined) {
    dong.push({ k: t('battery'), v: `${details.battery_health}%` });
  }
  if (details.used_months !== undefined) {
    dong.push({
      k: t('usedMonthsShort'),
      v:
        details.used_months === 0
          ? t('neverUsed')
          : t('months', { n: details.used_months }),
    });
  }
  if (details.warranty_months !== undefined) {
    dong.push({
      k: t('warrantyShort'),
      v:
        details.warranty_months === 0
          ? t('warrantyNone')
          : t('monthsLeft', { n: details.warranty_months }),
    });
  }
  if (details.defects?.length) {
    dong.push({
      k: t('defects'),
      v: (
        <ul className="flex flex-col gap-1">
          {details.defects.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ),
    });
  }
  if (details.accessories?.length) {
    dong.push({ k: t('accessoriesShort'), v: details.accessories.join(', ') });
  }
  if (details.repaired !== undefined) {
    dong.push({
      k: t('repairedShort'),
      v: details.repaired
        ? details.repair_note || t('repairedYes')
        : t('repairedNo'),
    });
  }
  if (!dong.length) return null;

  return (
    <section aria-labelledby="durability-title" className="border-t border-ink/8 pt-4">
      <h2 id="durability-title" className="text-body font-semibold text-ink">
        {t('title')}
      </h2>
      <dl className="mt-3 flex flex-col gap-2.5">
        {dong.map((d) => (
          <div key={d.k} className="flex gap-3">
            <dt className="w-32 shrink-0 text-ink-muted">{d.k}</dt>
            <dd className="min-w-0 text-ink">{d.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
