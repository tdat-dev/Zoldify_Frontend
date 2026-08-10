"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { addressService } from '@/services/address.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';

/**
 * Sổ địa chỉ giao hàng.
 *
 * Bốn thứ của bản trước đã gỡ:
 *
 * 1. KHÔNG XOÁ ĐƯỢC ĐỊA CHỈ MẶC ĐỊNH. Cả nút "Đặt mặc định" lẫn nút xoá đều nằm
 *    trong `{!address.is_default && ...}`. Ai chỉ có một địa chỉ thì địa chỉ đó
 *    là mặc định, và không bao giờ xoá được nữa — kể cả khi đã chuyển nhà. Nay
 *    xoá được, chỉ hỏi thêm một câu vì việc đó kéo theo phải chọn mặc định mới.
 *
 * 2. LỖI BỊ NUỐT SẠCH. Cả ba thao tác (tải, xoá, đặt mặc định) đều
 *    `catch(err) { console.error(err) }`. Bấm xoá mà server từ chối thì màn hình
 *    không đổi gì, người dùng bấm tiếp vài lần rồi bỏ cuộc.
 *
 * 3. window.confirm() CHO VIỆC XOÁ, trong khi cả app dùng confirm của useToast.
 *
 * 4. `loading` không đặt lại khi tải lại danh sách, nên sau mỗi lần xoá màn hình
 *    đứng im ở dữ liệu cũ cho tới lúc response về.
 */
export default function AddressesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast, confirm } = useToast();
  const t = useTranslations('addresses');
  const tc = useTranslations('common');

  const [addresses, setAddresses] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const fetchAddresses = useCallback(async () => {
    setState('loading');
    try {
      const res = await addressService.getAll();
      setAddresses(res.data?.data || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, router, fetchAddresses]);

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      fetchAddresses();
    } catch (err: any) {
      toast(err.response?.data?.message || t('setDefaultFailed'), 'error');
    }
  };

  const handleDelete = async (address: any) => {
    const ask = address.is_default ? t('deleteDefaultAsk') : t('deleteAsk');
    if (!(await confirm(ask))) return;
    try {
      await addressService.delete(address.id);
      fetchAddresses();
    } catch (err: any) {
      toast(err.response?.data?.message || t('deleteFailed'), 'error');
    }
  };

  const addButton =
    'inline-flex items-center gap-2 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark';

  return (
    <div className="rounded-card bg-surface-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-6 py-5">
        <div>
          <h1 className="text-h2 text-ink">{t('title')}</h1>
          <p className="mt-1 text-small text-ink-muted">{t('lead')}</p>
        </div>
        {state === 'ready' && addresses.length > 0 && (
          <Link href="/addresses/create" className={addButton}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('add')}
          </Link>
        )}
      </div>

      {state === 'loading' ? (
        <p className="px-6 py-16 text-center text-body text-ink-muted">{tc('loading')}</p>
      ) : state === 'error' ? (
        <div className="px-6 py-16 text-center">
          <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
          <button
            type="button"
            onClick={fetchAddresses}
            className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {tc('retry')}
          </button>
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          title={t('empty')}
          hint={t('emptyHint')}
          action={
            <Link href="/addresses/create" className={addButton}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('addFirst')}
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-ink/10">
          {addresses.map((address: any) => (
            <li key={address.id} className="flex flex-wrap items-start gap-x-6 gap-y-3 px-6 py-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="text-body font-semibold text-ink">
                    {address.recipient_name}
                  </span>
                  <span className="text-small tabular-nums text-ink-muted">
                    {address.phone_number}
                  </span>
                  {address.label && (
                    <span className="rounded-control bg-surface-sunken px-2 py-0.5 text-caption text-ink-muted">
                      {address.label}
                    </span>
                  )}
                  {address.is_default && (
                    <span className="rounded-control bg-brand-tint px-2 py-0.5 text-caption font-semibold text-brand">
                      {t('default')}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-small leading-relaxed text-ink-muted">
                  {[address.street, address.ward, address.district, address.province]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/addresses/${address.id}/edit`}
                  className="rounded-control px-3 py-1.5 text-small font-semibold text-brand transition-colors hover:bg-brand-tint"
                >
                  {t('edit')}
                </Link>
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="rounded-control px-3 py-1.5 text-small text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                  >
                    {t('setDefault')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(address)}
                  aria-label={`${t('delete')} — ${address.recipient_name}`}
                  className="rounded-control p-2 text-ink-muted transition-colors hover:bg-price-bg hover:text-price"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
