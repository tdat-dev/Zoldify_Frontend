"use client";

import { useTranslations } from 'next-intl';

/**
 * Ô người bán tự kể tình trạng thật. Dùng chung cho trang đăng và trang sửa, cùng
 * lý do với ConditionPicker: hai bản chép tay sớm muộn cũng lệch nhau.
 */
export function ConditionNoteField({
  value,
  onChange,
  required = false,
  error,
}: {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  error?: string;
}) {
  const t = useTranslations('sell');
  const tc = useTranslations('common');

  return (
    <div className="mt-4">
      <label htmlFor="field-conditionNote" className="mb-1.5 block text-small font-semibold text-ink">
        {t('conditionNote')}{' '}
        {required ? (
          <span className="text-price">*</span>
        ) : (
          <span className="font-normal text-ink-faint">({tc('optional')})</span>
        )}
      </label>
      <textarea
        id="field-conditionNote"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder={t('conditionNotePlaceholder')}
        aria-invalid={!!error}
        aria-describedby={error ? 'err-conditionNote' : 'hint-conditionNote'}
        className="w-full rounded-control border border-ink/16 bg-surface-card px-3 py-2.5 text-body text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      {error ? (
        <p id="err-conditionNote" className="mt-1.5 text-caption text-state-danger-fg">
          {error}
        </p>
      ) : (
        <p id="hint-conditionNote" className="mt-1.5 text-caption text-ink-muted">
          {t('conditionNoteHint')}
        </p>
      )}
    </div>
  );
}
