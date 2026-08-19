"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Store, Loader2, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { shopService } from '@/services/shop.service';
import {
  ghnService,
  type GhnProvince,
  type GhnDistrict,
  type GhnWard,
} from '@/services/ghn.service';

interface PickupForm {
  pickup_name: string;
  pickup_phone: string;
  pickup_address: string;
  province_id: number;
  pickup_province_name: string;
  pickup_district_id: number;
  pickup_district_name: string;
  pickup_ward_code: string;
  pickup_ward_name: string;
}

const EMPTY: PickupForm = {
  pickup_name: '',
  pickup_phone: '',
  pickup_address: '',
  province_id: 0,
  pickup_province_name: '',
  pickup_district_id: 0,
  pickup_district_name: '',
  pickup_ward_code: '',
  pickup_ward_name: '',
};

export default function ShopPickupSettingsPage() {
  const t = useTranslations('shopPickup');
  const tc = useTranslations('common');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [noShop, setNoShop] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PickupForm>(EMPTY);

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    (async () => {
      try {
        const [shopRes, provinceList] = await Promise.all([
          shopService.getMyShop(),
          ghnService.getProvinces(),
        ]);
        setProvinces(provinceList);
        const shop = shopRes.data?.data;

        // Điền lại lựa chọn đã lưu. Chỉ lưu tên tỉnh (GHN tạo đơn cần tên), nên
        // dò ngược ProvinceID từ danh mục để select hiện đúng — rồi nạp tiếp
        // quận theo id đã lưu, phường theo mã đã lưu.
        if (shop?.pickup_province_name) {
          const prov = provinceList.find(
            (p) => p.ProvinceName === shop.pickup_province_name,
          );
          const next: PickupForm = {
            pickup_name: shop.pickup_name || '',
            pickup_phone: shop.pickup_phone || '',
            pickup_address: shop.pickup_address || '',
            province_id: prov?.ProvinceID || 0,
            pickup_province_name: shop.pickup_province_name || '',
            pickup_district_id: shop.pickup_district_id || 0,
            pickup_district_name: shop.pickup_district_name || '',
            pickup_ward_code: shop.pickup_ward_code || '',
            pickup_ward_name: shop.pickup_ward_name || '',
          };
          setForm(next);
          if (prov?.ProvinceID) {
            const ds = await ghnService.getDistricts(prov.ProvinceID);
            setDistricts(ds);
          }
          if (shop.pickup_district_id) {
            const ws = await ghnService.getWards(shop.pickup_district_id);
            setWards(ws);
          }
        } else if (shop) {
          // Shop có nhưng chưa khai pickup — mượn tên/SĐT shop làm gợi ý ban đầu.
          setForm((f) => ({
            ...f,
            pickup_name: shop.name || '',
            pickup_phone: shop.phone || '',
          }));
        }
      } catch (err: any) {
        if (err?.response?.status === 404) setNoShop(true);
        else setError(t('loadFailed'));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onProvinceChange = async (id: number) => {
    const name = provinces.find((p) => p.ProvinceID === id)?.ProvinceName || '';
    setForm((f) => ({
      ...f,
      province_id: id,
      pickup_province_name: name,
      pickup_district_id: 0,
      pickup_district_name: '',
      pickup_ward_code: '',
      pickup_ward_name: '',
    }));
    setDistricts(id ? await ghnService.getDistricts(id) : []);
    setWards([]);
  };

  const onDistrictChange = async (id: number) => {
    const name = districts.find((d) => d.DistrictID === id)?.DistrictName || '';
    setForm((f) => ({
      ...f,
      pickup_district_id: id,
      pickup_district_name: name,
      pickup_ward_code: '',
      pickup_ward_name: '',
    }));
    setWards(id ? await ghnService.getWards(id) : []);
  };

  const onWardChange = (code: string) => {
    const name = wards.find((w) => w.WardCode === code)?.WardName || '';
    setForm((f) => ({ ...f, pickup_ward_code: code, pickup_ward_name: name }));
  };

  const isComplete =
    form.pickup_name.trim() &&
    form.pickup_phone.trim() &&
    form.pickup_address.trim() &&
    form.pickup_province_name &&
    form.pickup_district_id &&
    form.pickup_ward_code;

  const handleSave = async () => {
    if (!isComplete) {
      toast(t('required'), 'error');
      return;
    }
    setSaving(true);
    try {
      await shopService.updatePickup({
        pickup_name: form.pickup_name.trim(),
        pickup_phone: form.pickup_phone.trim(),
        pickup_address: form.pickup_address.trim(),
        pickup_province_name: form.pickup_province_name,
        pickup_district_id: form.pickup_district_id,
        pickup_district_name: form.pickup_district_name,
        pickup_ward_code: form.pickup_ward_code,
        pickup_ward_name: form.pickup_ward_name,
      });
      toast(t('saved'), 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('saveFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-page min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-muted">
          <Loader2 className="w-4 h-4 animate-spin" /> {tc('loading')}
        </div>
      </div>
    );
  }

  if (noShop) {
    return (
      <div className="bg-surface-page min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Store className="w-16 h-16 text-ink-faint mx-auto mb-4" />
          <p className="text-ink-muted mb-4">{t('noShop')}</p>
          <Link
            href="/product/create"
            className="inline-block px-6 py-2 bg-brand text-white rounded-sm hover:bg-brand-dark transition-colors"
          >
            {t('createShop')}
          </Link>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none';
  const selectCls = `${inputCls} bg-white disabled:bg-surface-sunken disabled:text-ink-muted`;

  return (
    <div className="bg-surface-page min-h-screen pb-20 md:pb-10">
      <div className="max-w-[720px] mx-auto px-4 pt-6">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-brand mb-1">
            <Truck className="w-5 h-5" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-ink">{t('title')}</h1>
          </div>
          <p className="text-small text-ink-muted">{t('lead')}</p>
        </div>

        <div className="bg-surface-card rounded-sm p-5 md:p-6 space-y-4">
          {error && (
            <p className="text-small text-state-danger-fg bg-state-danger-bg rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Người gửi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pickup_name" className="text-small font-semibold text-ink">
                {t('name')} <span className="text-price">*</span>
              </label>
              <input
                id="pickup_name"
                type="text"
                value={form.pickup_name}
                onChange={(e) => setForm((f) => ({ ...f, pickup_name: e.target.value }))}
                className={inputCls}
                placeholder={t('namePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="pickup_phone" className="text-small font-semibold text-ink">
                {t('phone')} <span className="text-price">*</span>
              </label>
              <input
                id="pickup_phone"
                type="tel"
                inputMode="tel"
                value={form.pickup_phone}
                onChange={(e) => setForm((f) => ({ ...f, pickup_phone: e.target.value }))}
                className={inputCls}
                placeholder={t('phonePlaceholder')}
              />
            </div>
          </div>

          {/* Tỉnh / Quận / Phường */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="pickup_province" className="text-small font-semibold text-ink">
                {t('province')} <span className="text-price">*</span>
              </label>
              <select
                id="pickup_province"
                value={form.province_id}
                onChange={(e) => onProvinceChange(Number(e.target.value))}
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
              <label htmlFor="pickup_district" className="text-small font-semibold text-ink">
                {t('district')} <span className="text-price">*</span>
              </label>
              <select
                id="pickup_district"
                value={form.pickup_district_id}
                onChange={(e) => onDistrictChange(Number(e.target.value))}
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
              <label htmlFor="pickup_ward" className="text-small font-semibold text-ink">
                {t('ward')} <span className="text-price">*</span>
              </label>
              <select
                id="pickup_ward"
                value={form.pickup_ward_code}
                onChange={(e) => onWardChange(e.target.value)}
                disabled={!form.pickup_district_id}
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

          {/* Địa chỉ cụ thể */}
          <div>
            <label htmlFor="pickup_address" className="text-small font-semibold text-ink">
              {t('address')} <span className="text-price">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" aria-hidden="true" />
              <input
                id="pickup_address"
                type="text"
                value={form.pickup_address}
                onChange={(e) => setForm((f) => ({ ...f, pickup_address: e.target.value }))}
                className={`${inputCls} pl-9`}
                placeholder={t('addressPlaceholder')}
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isComplete}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white font-medium rounded-sm hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
