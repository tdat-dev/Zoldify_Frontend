"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { addressService } from '@/services/address.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AddressForm, type AddressValues } from '@/components/account/AddressForm';

/** Sửa địa chỉ. Biểu mẫu dùng chung với trang thêm — xem AddressForm. */
export default function EditAddressPage() {
  const { allowed } = useRequireAuth();
  const params = useParams();
  const t = useTranslations('addresses');
  const tc = useTranslations('common');

  const id = Number(params.id);
  const [initial, setInitial] = useState<Partial<AddressValues> | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await addressService.getById(id);
      const a = res.data?.data;
      if (!a) {
        setState('error');
        return;
      }
      setInitial({
        recipient_name: a.recipient_name || '',
        phone_number: a.phone_number || '',
        label: a.label || '',
        province: a.province || '',
        district: a.district || '',
        ward: a.ward || '',
        street: a.street || '',
        is_default: !!a.is_default,
      });
      setState('ready');
    } catch {
      setState('error');
    }
  }, [id]);

  useEffect(() => {
    if (allowed && Number.isFinite(id)) load();
  }, [allowed, id, load]);

  const handleSubmit = async (values: AddressValues) => {
    await addressService.update(id, values);
  };

  if (state === 'loading') {
    return (
      <div className="max-w-[640px] rounded-card bg-surface-card px-6 py-20 text-center text-body text-ink-muted">
        {tc('loading')}
      </div>
    );
  }

  if (state === 'error' || !initial) {
    return (
      <div className="max-w-[640px] rounded-card bg-surface-card px-6 py-20 text-center">
        <p className="text-body font-semibold text-ink">{t('loadOneFailed')}</p>
        <Link
          href="/addresses"
          className="mt-5 inline-block rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {t('title')}
        </Link>
      </div>
    );
  }

  return <AddressForm title={t('editTitle')} initial={initial} onSubmit={handleSubmit} />;
}
