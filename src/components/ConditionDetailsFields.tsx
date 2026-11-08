"use client";

import { useTranslations } from 'next-intl';
import {
  LIMITS,
  type DurabilityError,
  type DurabilityForm,
} from '@/lib/condition-details';

/**
 * Các ô "Độ bền" trong phần tình trạng của trang đăng và trang sửa tin. Dùng
 * chung cho hai trang, cùng lý do với ConditionPicker.
 *
 * Mọi ô đều tuỳ chọn: ghi chú tình trạng phía trên đã bắt buộc với hàng cũ, còn
 * đây là phần người bán điền thêm để người mua so được giữa hai tin. Ô pin chỉ
 * hiện ở danh mục có pin (`hasBattery`).
 */
export function ConditionDetailsFields({
  value,
  onChange,
  withBattery,
  errors = [],
}: {
  value: DurabilityForm;
  onChange: (next: DurabilityForm) => void;
  withBattery: boolean;
  errors?: DurabilityError[];
}) {
  const t = useTranslations('durability');
  const set = <K extends keyof DurabilityForm>(k: K, v: DurabilityForm[K]) =>
    onChange({ ...value, [k]: v });

  const label = 'mb-1.5 block text-small font-semibold text-ink';
  const control =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-state-danger-fg';
  const hint = 'mt-1.5 text-caption text-ink-muted';
  const errText = 'mt-1.5 text-caption text-state-danger-fg';
  const coLoi = (k: DurabilityError) => errors.includes(k);

  // Ô số: inputMode numeric cho bàn phím số trên điện thoại, nhưng type text để
  // trình duyệt không tự đổi "1,5" thành rỗng mà không báo gì.
  const oSo = (
    k: 'battery' | 'usedMonths' | 'warrantyMonths',
    max: number,
  ) => (
    <div>
      <label htmlFor={`field-${k}`} className={label}>
        {t(k)}
      </label>
      <div className="relative">
        <input
          id={`field-${k}`}
          inputMode="numeric"
          value={value[k]}
          onChange={(e) => set(k, e.target.value.replace(/[^\d]/g, ''))}
          maxLength={3}
          aria-invalid={coLoi(k)}
          aria-describedby={`help-${k}`}
          className={`${control} pr-16 tabular-nums`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-small text-ink-muted"
        >
          {t(`${k}Unit`)}
        </span>
      </div>
      <p id={`help-${k}`} className={coLoi(k) ? errText : hint}>
        {coLoi(k) ? t('errRange', { max }) : t(`${k}Hint`)}
      </p>
    </div>
  );

  return (
    <fieldset className="mt-6 border-t border-ink/8 pt-5">
      <legend className="float-left w-full text-body font-semibold text-ink">
        {t('title')}
      </legend>
      <p className="clear-both mt-1 text-small text-ink-muted">{t('lead')}</p>

      <div
        className={`mt-4 grid grid-cols-1 gap-4 ${withBattery ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
      >
        {withBattery && oSo('battery', LIMITS.battery)}
        {oSo('usedMonths', LIMITS.usedMonths)}
        {oSo('warrantyMonths', LIMITS.warrantyMonths)}
      </div>

      <div className="mt-4">
        <label htmlFor="field-defects" className={label}>
          {t('defects')}
        </label>
        <textarea
          id="field-defects"
          rows={3}
          value={value.defects}
          onChange={(e) => set('defects', e.target.value)}
          placeholder={t('defectsPlaceholder')}
          aria-invalid={coLoi('defects')}
          aria-describedby="help-defects"
          className={control}
        />
        <p id="help-defects" className={coLoi('defects') ? errText : hint}>
          {coLoi('defects')
            ? t('errList', { items: LIMITS.items, chars: LIMITS.defectLength })
            : t('defectsHint')}
        </p>
      </div>

      <div className="mt-4">
        <label htmlFor="field-accessories" className={label}>
          {t('accessories')}
        </label>
        <input
          id="field-accessories"
          value={value.accessories}
          onChange={(e) => set('accessories', e.target.value)}
          placeholder={t('accessoriesPlaceholder')}
          aria-invalid={coLoi('accessories')}
          aria-describedby="help-accessories"
          className={control}
        />
        <p id="help-accessories" className={coLoi('accessories') ? errText : hint}>
          {coLoi('accessories')
            ? t('errList', {
                items: LIMITS.items,
                chars: LIMITS.accessoryLength,
              })
            : t('accessoriesHint')}
        </p>
      </div>

      <fieldset className="mt-4">
        <legend className={label}>{t('repaired')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['no', 'yes'] as const).map((v) => {
            const active = value.repaired === v;
            return (
              <label
                key={v}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-control border px-3.5 text-small transition-colors ${
                  active
                    ? 'border-brand bg-brand-tint text-ink'
                    : 'border-ink/16 text-ink hover:border-ink/30'
                }`}
              >
                <input
                  type="radio"
                  name="repaired"
                  value={v}
                  checked={active}
                  onChange={() => set('repaired', v)}
                  className="h-4 w-4 accent-brand"
                />
                {t(v === 'yes' ? 'repairedYes' : 'repairedNo')}
              </label>
            );
          })}
        </div>
        {value.repaired === 'yes' && (
          <div className="mt-3">
            <label htmlFor="field-repairNote" className={label}>
              {t('repairNote')}
            </label>
            <input
              id="field-repairNote"
              value={value.repairNote}
              onChange={(e) => set('repairNote', e.target.value)}
              maxLength={LIMITS.repairNote}
              placeholder={t('repairNotePlaceholder')}
              className={control}
            />
          </div>
        )}
      </fieldset>
    </fieldset>
  );
}
