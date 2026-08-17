"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  ghnService,
  type GhnProvince,
  type GhnDistrict,
  type GhnWard,
} from '@/services/ghn.service';

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
 *
 * Khác AddressPicker (dùng provinces.open-api.vn, chỉ có tên): ở đây phải là
 * danh mục GHN để đơn mang đúng ghn_district_id/ghn_ward_code — thứ GHN cần để
 * tính phí ship và tạo vận đơn. Mã hai nguồn không khớp nhau nên không thể
 * dùng lẫn.
 */
export default function GhnAddressPicker({ onSelect }: Props) {
  const t = useTranslations('addresses');

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);

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
