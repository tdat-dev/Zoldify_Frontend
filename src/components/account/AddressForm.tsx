"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ghnService,
  resolveGhnLocation,
  type GhnDistrict,
  type GhnProvince,
  type GhnWard,
} from '@/services/ghn.service';
import { useToast } from '@/components/Toast';

/**
 * Biểu mẫu địa chỉ, dùng chung cho THÊM và SỬA.
 *
 * Trước đây là hai file gần như giống hệt nhau, mỗi file ~200 dòng: cùng một
 * state, cùng logic tỉnh/huyện/xã, cùng khối JSX. Hai bản sao của một biểu mẫu
 * là hai bản sẽ trôi khỏi nhau — bản sửa đã dùng `p.districts` lấy sẵn từ danh
 * sách tỉnh trong khi bản thêm gọi getDistricts(code), nên chúng đã bắt đầu
 * khác nhau rồi.
 *
 * Ba thứ khác đã sửa luôn:
 *
 * 1. LỖI KHÔNG CHỈ RÕ Ô NÀO. Cả hai bản chỉ bắn một toast "Vui lòng điền đầy
 *    đủ thông tin bắt buộc" cho năm trường khác nhau. Nay lỗi nằm ngay dưới ô
 *    sai, và ô đầu tiên sai được đưa vào tầm nhìn.
 *
 * 2. SỐ ĐIỆN THOẠI KHÔNG KIỂM GÌ CẢ. Gõ chữ cũng lưu được, rồi người giao hàng
 *    không gọi được cho ai.
 *
 * 3. NHÃN KHÔNG NỐI VỚI Ô NHẬP (không htmlFor/id) trên toàn bộ biểu mẫu.
 *
 * CHƯA LÀM ĐƯỢC: không có trường quốc gia. Model địa chỉ của backend chỉ có
 * province/district/ward (identity/addresses/entities/address.entity.ts:31-37),
 * nên biểu mẫu này còn là biểu mẫu Việt Nam. Đây là việc phải sửa ở backend
 * trước, đã ghi trong docs/superpowers/specs/2026-08-08-da-quoc-gia-can-gi.md.
 */
export type AddressValues = {
  recipient_name: string;
  phone_number: string;
  label: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  ghn_province_id?: number;
  ghn_district_id?: number;
  ghn_ward_code?: string;
  is_default: boolean;
};

const EMPTY: AddressValues = {
  recipient_name: '',
  phone_number: '',
  label: '',
  province: '',
  district: '',
  ward: '',
  street: '',
  ghn_province_id: undefined,
  ghn_district_id: undefined,
  ghn_ward_code: undefined,
  is_default: false,
};

// Bon goi y nay la GOI Y, khong phai danh sach dong. Nguoi dung chon mot cai
// roi no duoc luu nguyen van xuong backend nhu du lieu cua ho — nen dich o day
// chi doi thu HIEN RA de chon, khong dong toi dia chi da luu.
const NICK_KEYS = ['home', 'work', 'school', 'friend'] as const;

type Errors = Partial<Record<keyof AddressValues, string>>;

export function AddressForm({
  title,
  initial,
  onSubmit,
}: {
  title: string;
  initial?: Partial<AddressValues>;
  onSubmit: (values: AddressValues) => Promise<void>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('addresses');
  const tc = useTranslations('common');

  const [form, setForm] = useState<AddressValues>({ ...EMPTY, ...initial });
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof AddressValues>(key: K, value: AddressValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Nạp danh mục GHN, rồi khôi phục tỉnh/quận/phường của địa chỉ đang sửa
  // (ưu tiên mã GHN, fallback khớp tên cho địa chỉ cũ tạo trước khi dùng GHN).
  const load = useCallback(async () => {
    const provs = await ghnService.getProvinces();
    setProvinces(provs);
    if (!initial?.ghn_province_id && !initial?.province) return;
    const resolved = await resolveGhnLocation(provs, initial);
    setDistricts(resolved.districts);
    setWards(resolved.wards);
    setForm((f) => ({
      ...f,
      province: resolved.province?.ProvinceName ?? f.province,
      district: resolved.district?.DistrictName ?? f.district,
      ward: resolved.ward?.WardName ?? f.ward,
      ghn_province_id: resolved.province?.ProvinceID ?? f.ghn_province_id,
      ghn_district_id: resolved.district?.DistrictID ?? f.ghn_district_id,
      ghn_ward_code: resolved.ward?.WardCode ?? f.ghn_ward_code,
    }));
  }, [
    initial?.ghn_province_id,
    initial?.ghn_district_id,
    initial?.ghn_ward_code,
    initial?.province,
    initial?.district,
    initial?.ward,
  ]);

  useEffect(() => {
    load().catch(() => setProvinces([]));
  }, [load]);

  const onProvince = async (id: number) => {
    const p = provinces.find((x) => x.ProvinceID === id);
    setForm((f) => ({
      ...f,
      province: p?.ProvinceName ?? '',
      district: '',
      ward: '',
      ghn_province_id: p?.ProvinceID,
      ghn_district_id: undefined,
      ghn_ward_code: undefined,
    }));
    setErrors((e) => ({ ...e, province: undefined }));
    setDistricts(p ? await ghnService.getDistricts(p.ProvinceID).catch(() => []) : []);
    setWards([]);
  };

  const onDistrict = async (id: number) => {
    const d = districts.find((x) => x.DistrictID === id);
    setForm((f) => ({
      ...f,
      district: d?.DistrictName ?? '',
      ward: '',
      ghn_district_id: d?.DistrictID,
      ghn_ward_code: undefined,
    }));
    setErrors((e) => ({ ...e, district: undefined }));
    setWards(d ? await ghnService.getWards(d.DistrictID).catch(() => []) : []);
  };

  const onWard = (code: string) => {
    const w = wards.find((x) => x.WardCode === code);
    setForm((f) => ({
      ...f,
      ward: w?.WardName ?? '',
      ghn_ward_code: w?.WardCode,
    }));
    setErrors((e) => ({ ...e, ward: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.recipient_name.trim()) e.recipient_name = t('errRecipient');
    const phone = form.phone_number.replace(/[\s.-]/g, '');
    if (!phone) e.phone_number = t('errPhone');
    else if (!/^\+?\d{9,11}$/.test(phone)) e.phone_number = t('errPhoneFormat');
    if (!form.ghn_province_id) e.province = t('errProvince');
    if (!form.ghn_district_id) e.district = t('errDistrict');
    if (!form.ghn_ward_code) e.ward = t('errWard');
    if (!form.street.trim()) e.street = t('errStreet');
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`addr-${first}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form);
      router.push('/addresses');
    } catch (err: any) {
      toast(err.response?.data?.message || t('saveFailed'), 'error');
      setSaving(false);
    }
  };

  const field = (bad?: string) =>
    `w-full rounded-control border bg-surface-card px-3 py-2.5 text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 ${
      bad
        ? 'border-price focus:border-price focus:ring-price/20'
        : 'border-ink/16 focus:border-brand focus:ring-brand/20'
    }`;
  const labelCls = 'mb-1.5 block text-small font-semibold text-ink';
  const errCls = 'mt-1.5 text-small text-price';

  return (
    <div className="max-w-[640px] rounded-card bg-surface-card">
      <div className="border-b border-ink/10 px-6 py-5">
        <h1 className="text-h2 text-ink">{title}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-6">
        <fieldset>
          <legend className={labelCls}>{t('nickname')}</legend>
          <div className="flex flex-wrap gap-2">
            {NICK_KEYS.map((k) => t(`nick_${k}`)).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set('label', n)}
                aria-pressed={form.label === n}
                className={`rounded-control border px-3 py-1.5 text-small transition-colors ${
                  form.label === n
                    ? 'border-brand bg-brand-tint font-semibold text-brand'
                    : 'border-ink/16 text-ink hover:bg-surface-sunken'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            id="addr-label"
            type="text"
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
            className={`${field()} mt-2`}
          />
          <p className="mt-1.5 text-small text-ink-muted">{t('nicknameHint')}</p>
        </fieldset>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="addr-recipient_name" className={labelCls}>
              {t('recipient')}
            </label>
            <input
              id="addr-recipient_name"
              type="text"
              value={form.recipient_name}
              onChange={(e) => set('recipient_name', e.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.recipient_name}
              className={field(errors.recipient_name)}
            />
            {errors.recipient_name && <p className={errCls}>{errors.recipient_name}</p>}
          </div>
          <div>
            <label htmlFor="addr-phone_number" className={labelCls}>
              {t('phone')}
            </label>
            <input
              id="addr-phone_number"
              type="tel"
              inputMode="tel"
              value={form.phone_number}
              onChange={(e) => set('phone_number', e.target.value)}
              autoComplete="tel"
              aria-invalid={!!errors.phone_number}
              aria-describedby="addr-phone-hint"
              className={`${field(errors.phone_number)} tabular-nums`}
            />
            {errors.phone_number ? (
              <p className={errCls}>{errors.phone_number}</p>
            ) : (
              <p id="addr-phone-hint" className="mt-1.5 text-small text-ink-muted">
                {t('phoneHint')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="addr-province" className={labelCls}>
              {t('province')}
            </label>
            <select
              id="addr-province"
              value={form.ghn_province_id ?? 0}
              onChange={(e) => onProvince(Number(e.target.value))}
              aria-invalid={!!errors.province}
              className={field(errors.province)}
            >
              <option value={0}>{t('choose')}</option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID}>
                  {p.ProvinceName}
                </option>
              ))}
            </select>
            {errors.province && <p className={errCls}>{errors.province}</p>}
          </div>
          <div>
            <label htmlFor="addr-district" className={labelCls}>
              {t('district')}
            </label>
            <select
              id="addr-district"
              value={form.ghn_district_id ?? 0}
              onChange={(e) => onDistrict(Number(e.target.value))}
              disabled={!form.ghn_province_id}
              aria-invalid={!!errors.district}
              className={`${field(errors.district)} disabled:bg-surface-sunken disabled:text-ink-faint`}
            >
              <option value={0}>{t('choose')}</option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
            {errors.district && <p className={errCls}>{errors.district}</p>}
          </div>
          <div>
            <label htmlFor="addr-ward" className={labelCls}>
              {t('ward')}
            </label>
            <select
              id="addr-ward"
              value={form.ghn_ward_code ?? ''}
              onChange={(e) => onWard(e.target.value)}
              disabled={!form.ghn_district_id}
              aria-invalid={!!errors.ward}
              className={`${field(errors.ward)} disabled:bg-surface-sunken disabled:text-ink-faint`}
            >
              <option value="">{t('choose')}</option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
            {errors.ward && <p className={errCls}>{errors.ward}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="addr-street" className={labelCls}>
            {t('street')}
          </label>
          <input
            id="addr-street"
            type="text"
            value={form.street}
            onChange={(e) => set('street', e.target.value)}
            placeholder={t('streetPlaceholder')}
            autoComplete="street-address"
            aria-invalid={!!errors.street}
            className={field(errors.street)}
          />
          {errors.street && <p className={errCls}>{errors.street}</p>}
        </div>

        <label className="flex items-center gap-2.5 text-small text-ink">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => set('is_default', e.target.checked)}
            className="h-4 w-4 rounded-control accent-brand"
          />
          {t('makeDefault')}
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-control bg-brand px-6 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint"
          >
            {saving ? t('saving') : t('save')}
          </button>
          <Link
            href="/addresses"
            className="rounded-control border border-ink/16 px-6 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
          >
            {tc('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
