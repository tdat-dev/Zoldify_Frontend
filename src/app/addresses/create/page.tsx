"use client";

import { useTranslations } from 'next-intl';
import { addressService } from '@/services/address.service';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AddressForm, type AddressValues } from '@/components/account/AddressForm';

/** Thêm địa chỉ. Toàn bộ biểu mẫu nằm ở AddressForm, dùng chung với trang sửa. */
export default function CreateAddressPage() {
  useRequireAuth();
  const t = useTranslations('addresses');

  const handleSubmit = async (values: AddressValues) => {
    await addressService.create(values);
  };

  return <AddressForm title={t('createTitle')} onSubmit={handleSubmit} />;
}
