"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ghnService,
  resolveGhnLocation,
  type GhnProvince,
  type GhnDistrict,
  type GhnWard,
} from '@/services/ghn.service';
import { addressService, type Address } from '@/services/address.service';

export interface GhnAddressSelection {
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  province: string;
  district: string;
  /** Mã GHN — bắt buộc để tính phí và tạo vận đơn. */
  ghn_district_id: number;
  ghn_ward_code: string;
}

interface Props {
  onSelect: (address: GhnAddressSelection) => void;
}

/**
 * Bộ chọn địa chỉ NHẬN dùng danh mục GHN (ProvinceID/DistrictID/WardCode).
 * Tự điền sẵn từ sổ địa chỉ đã lưu (ưu tiên mã GHN, fallback khớp tên cho
 * địa chỉ cũ chưa lưu mã GHN).
 */
export default function GhnAddressPicker({ onSelect }: Props) {
  const t = useTranslations('addresses');

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [savedList, setSavedList] = useState<Address[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    receiver_name: '',
    receiver_phone: '',
    street: '',
    province_id: 0,
    province_name: '',
    district_id: 0,
    district_name: '',
    ward_code: '',
    ward_name: '',
  });

  useEffect(() => {
    ghnService.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  const emit = (f: typeof form) => {
    const shipping_address = [f.street, f.ward_name, f.district_name, f.province_name]
      .filter(Boolean)
      .join(', ');
    onSelect({
      receiver_name: f.receiver_name,
      receiver_phone: f.receiver_phone,
      shipping_address,
      province: f.province_name,
      district: f.district_name,
      ghn_district_id: f.district_id,
      ghn_ward_code: f.ward_code,
    });
  };

  const applySaved = async (saved: Address, provList: GhnProvince[]) => {
    setSelectedSavedId(saved.id);
    const resolved = await resolveGhnLocation(provList, saved);
    setDistricts(resolved.districts);
    setWards(resolved.wards);
    const next = {
      receiver_name: saved.recipient_name ?? '',
      receiver_phone: saved.phone_number ?? '',
      street: saved.street ?? '',
      province_id: resolved.province?.ProvinceID ?? 0,
      province_name: resolved.province?.ProvinceName ?? '',
      district_id: resolved.district?.DistrictID ?? 0,
      district_name: resolved.district?.DistrictName ?? '',
      ward_code: resolved.ward?.WardCode ?? '',
      ward_name: resolved.ward?.WardName ?? '',
    };
    setForm(next);
    emit(next);
  };

  // Điền sẵn địa chỉ MẶC ĐỊNH đã lưu (hoặc địa chỉ đầu tiên).
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || provinces.length === 0) return;
    prefilled.current = true;
    (async () => {
      try {
        const res = await addressService.getAll();
        const list: Address[] = res.data?.data?.result ?? res.data?.data ?? [];
        setSavedList(list);
        if (list.length === 0) return;
        const saved = list.find((a) => a.is_default) ?? list[0];
        await applySaved(saved, provinces);
      } catch {
        // Chưa đăng nhập hoặc lỗi mạng: để người mua tự nhập như trước.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces]);

  const patch = (partial: Partial<typeof form>) => {
    const next = { ...form, ...partial };
    setForm(next);
    emit(next);
  };

  const onProvince = async (id: number) => {
    const name = provinces.find((p) => p.ProvinceID === id)?.ProvinceName || '';
    const next = {
      ...form,
      province_id: id,
      province_name: name,
      district_id: 0,
      district_name: '',
      ward_code: '',
      ward_name: '',
    };
    setForm(next);
    emit(next);
    setDistricts(id ? await ghnService.getDistricts(id) : []);
    setWards([]);
  };

  const onDistrict = async (id: number) => {
    const name = districts.find((d) => d.DistrictID === id)?.DistrictName || '';
    const next = {
      ...form,
      district_id: id,
      district_name: name,
      ward_code: '',
      ward_name: '',
    };
    setForm(next);
    emit(next);
    setWards(id ? await ghnService.getWards(id) : []);
  };

  const onWard = (code: string) => {
    const name = wards.find((w) => w.WardCode === code)?.WardName || '';
    patch({ ward_code: code, ward_name: name });
  };

  const inputCls =
    'w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none';
  const selectCls = `${inputCls} bg-white disabled:bg-surface-sunken disabled:text-ink-muted`;

  return (
    <div className="space-y-3">
      {savedList.length > 0 && (
        <div className="rounded-control border border-ink/10 bg-surface-sunken/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-caption font-semibold text-ink-muted">{t('savedPick')}</span>
            <Link href="/addresses" className="text-caption font-semibold text-brand hover:underline">
              {t('manage')}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedList.map((a) => {
              const active = a.id === selectedSavedId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => applySaved(a, provinces)}
                  aria-pressed={active}
                  className={`max-w-full rounded-control border px-3 py-1.5 text-left text-small transition-colors ${
                    active
                      ? 'border-brand bg-brand-tint text-ink'
                      : 'border-ink/16 bg-surface-card text-ink-muted hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  <span className="font-semibold text-ink">
                    {a.label ? `${a.label} · ` : ''}
                    {a.recipient_name}
                  </span>
                  {a.is_default && (
                    <span className="ml-1.5 rounded bg-brand/15 px-1.5 py-0.5 text-caption font-semibold text-brand">
                      {t('default')}
                    </span>
                  )}
                  <span className="block truncate text-caption text-ink-muted">
                    {[a.street, a.ward, a.district, a.province].filter(Boolean).join(', ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="ghn-recipient" className="text-small font-semibold text-ink">
            {t('recipient')} <span className="text-price">*</span>
          </label>
          <input
            id="ghn-recipient"
            type="text"
            value={form.receiver_name}
            onChange={(e) => patch({ receiver_name: e.target.value })}
            className={inputCls}
            placeholder={t('recipientPlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="ghn-phone" className="text-small font-semibold text-ink">
            {t('phone')} <span className="text-price">*</span>
          </label>
          <input
            id="ghn-phone"
            type="tel"
            inputMode="tel"
            value={form.receiver_phone}
            onChange={(e) => patch({ receiver_phone: e.target.value })}
            className={inputCls}
            placeholder="090..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="ghn-province" className="text-small font-semibold text-ink">
            {t('province')} <span className="text-price">*</span>
          </label>
          <select
            id="ghn-province"
            value={form.province_id}
            onChange={(e) => onProvince(Number(e.target.value))}
            className={selectCls}
          >
            <option value={0}>{t('choose')}</option>
            {provinces.map((p) => (
              <option key={p.ProvinceID} value={p.ProvinceID}>
                {p.ProvinceName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ghn-district" className="text-small font-semibold text-ink">
            {t('district')} <span className="text-price">*</span>
          </label>
          <select
            id="ghn-district"
            value={form.district_id}
            onChange={(e) => onDistrict(Number(e.target.value))}
            disabled={!form.province_id}
            className={selectCls}
          >
            <option value={0}>{t('choose')}</option>
            {districts.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ghn-ward" className="text-small font-semibold text-ink">
            {t('ward')} <span className="text-price">*</span>
          </label>
          <select
            id="ghn-ward"
            value={form.ward_code}
            onChange={(e) => onWard(e.target.value)}
            disabled={!form.district_id}
            className={selectCls}
          >
            <option value="">{t('choose')}</option>
            {wards.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ghn-street" className="text-small font-semibold text-ink">
          {t('street')} <span className="text-price">*</span>
        </label>
        <input
          id="ghn-street"
          type="text"
          value={form.street}
          onChange={(e) => patch({ street: e.target.value })}
          className={inputCls}
          placeholder={t('streetPlaceholder')}
        />
      </div>
    </div>
  );
}
