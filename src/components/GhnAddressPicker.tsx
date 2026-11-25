"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, X, Loader2 } from 'lucide-react';
import {
  ghnService,
  resolveGhnLocation,
  type GhnProvince,
  type GhnDistrict,
  type GhnWard,
} from '@/services/ghn.service';
import { addressService, type Address } from '@/services/address.service';
import { useToast } from '@/components/Toast';

export interface GhnAddressSelection {
  receiver_name: string;
  receiver_phone: string;
  shipping_address: string;
  province: string;
  district: string;
  ward?: string;
  street?: string;
  ghn_province_id?: number;
  /** Mã GHN — bắt buộc để tính phí và tạo vận đơn. */
  ghn_district_id: number;
  ghn_ward_code: string;
  from_saved?: boolean;
}

interface Props {
  onSelect: (address: GhnAddressSelection) => void;
}

interface InlineFormState {
  receiver_name: string;
  receiver_phone: string;
  street: string;
  province_id: number;
  province_name: string;
  district_id: number;
  district_name: string;
  ward_code: string;
  ward_name: string;
  is_default: boolean;
}

const EMPTY_FORM: InlineFormState = {
  receiver_name: '',
  receiver_phone: '',
  street: '',
  province_id: 0,
  province_name: '',
  district_id: 0,
  district_name: '',
  ward_code: '',
  ward_name: '',
  is_default: true,
};

/**
 * Bộ chọn địa chỉ nhận hàng kiểu Shopee trên trang checkout:
 * - Đã có địa chỉ trong sổ: hiện 1 dòng tóm tắt + nút "Thay đổi" mở modal chọn/thêm/sửa.
 * - Chưa có địa chỉ nào: hiện form GHN trực tiếp, bấm lưu (hoặc đặt hàng) tự lưu vào sổ.
 */
export default function GhnAddressPicker({ onSelect }: Props) {
  const t = useTranslations('addresses');
  const tc = useTranslations('common');
  const { toast } = useToast();

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);

  const [savedList, setSavedList] = useState<Address[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [activeSaved, setActiveSaved] = useState<Address | null>(null);
  const [activeGhnOk, setActiveGhnOk] = useState(true);

  // Modal chọn / thêm / sửa địa chỉ kiểu Shopee
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  const [form, setForm] = useState<InlineFormState>(EMPTY_FORM);

  useEffect(() => {
    ghnService.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  const emitFromForm = (f: InlineFormState, fromSaved: boolean) => {
    const shipping_address = [f.street, f.ward_name, f.district_name, f.province_name]
      .filter(Boolean)
      .join(', ');
    onSelect({
      receiver_name: f.receiver_name,
      receiver_phone: f.receiver_phone,
      shipping_address,
      province: f.province_name,
      district: f.district_name,
      ward: f.ward_name,
      street: f.street,
      ghn_province_id: f.province_id,
      ghn_district_id: f.district_id,
      ghn_ward_code: f.ward_code,
      from_saved: fromSaved,
    });
  };

  const selectSavedAddress = async (saved: Address, provList: GhnProvince[]) => {
    setActiveSaved(saved);
    const resolved = await resolveGhnLocation(provList, saved);
    const ok = !!(resolved.province && resolved.district && resolved.ward);
    setActiveGhnOk(ok);
    const shipping_address = [
      saved.street,
      resolved.ward?.WardName ?? saved.ward,
      resolved.district?.DistrictName ?? saved.district,
      resolved.province?.ProvinceName ?? saved.province,
    ]
      .filter(Boolean)
      .join(', ');
    onSelect({
      receiver_name: saved.recipient_name ?? '',
      receiver_phone: saved.phone_number ?? '',
      shipping_address,
      province: resolved.province?.ProvinceName ?? saved.province ?? '',
      district: resolved.district?.DistrictName ?? saved.district ?? '',
      ward: resolved.ward?.WardName ?? saved.ward ?? '',
      street: saved.street ?? '',
      ghn_province_id: resolved.province?.ProvinceID ?? 0,
      ghn_district_id: resolved.district?.DistrictID ?? 0,
      ghn_ward_code: resolved.ward?.WardCode ?? '',
      from_saved: true,
    });
  };

  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || provinces.length === 0) return;
    prefilled.current = true;
    (async () => {
      try {
        const res = await addressService.getAll();
        const list: Address[] = res.data?.data?.result ?? res.data?.data ?? [];
        setSavedList(list);
        if (list.length > 0) {
          const def = list.find((a) => a.is_default) ?? list[0];
          await selectSavedAddress(def, provinces);
        }
      } catch {
        setSavedList([]);
      } finally {
        setLoadingSaved(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces]);

  const patchInline = (partial: Partial<InlineFormState>, shouldEmit: boolean) => {
    const next = { ...form, ...partial };
    setForm(next);
    if (shouldEmit) emitFromForm(next, false);
  };

  const onProvince = async (id: number, shouldEmit: boolean) => {
    const name = provinces.find((p) => p.ProvinceID === id)?.ProvinceName || '';
    const next: InlineFormState = {
      ...form,
      province_id: id,
      province_name: name,
      district_id: 0,
      district_name: '',
      ward_code: '',
      ward_name: '',
    };
    setForm(next);
    if (shouldEmit) emitFromForm(next, false);
    setDistricts(id ? await ghnService.getDistricts(id).catch(() => []) : []);
    setWards([]);
  };

  const onDistrict = async (id: number, shouldEmit: boolean) => {
    const name = districts.find((d) => d.DistrictID === id)?.DistrictName || '';
    const next: InlineFormState = {
      ...form,
      district_id: id,
      district_name: name,
      ward_code: '',
      ward_name: '',
    };
    setForm(next);
    if (shouldEmit) emitFromForm(next, false);
    setWards(id ? await ghnService.getWards(id).catch(() => []) : []);
  };

  const onWard = (code: string, shouldEmit: boolean) => {
    const name = wards.find((w) => w.WardCode === code)?.WardName || '';
    patchInline({ ward_code: code, ward_name: name }, shouldEmit);
  };

  const openModalList = () => {
    setPendingId(activeSaved?.id ?? savedList[0]?.id ?? null);
    setModalMode('list');
    setEditingId(null);
    setModalOpen(true);
  };

  const openModalCreate = () => {
    setForm({ ...EMPTY_FORM, is_default: savedList.length === 0 });
    setDistricts([]);
    setWards([]);
    setEditingId(null);
    setModalMode('create');
  };

  const openModalEdit = async (addr: Address) => {
    setEditingId(addr.id);
    setModalMode('edit');
    const resolved = await resolveGhnLocation(provinces, addr);
    setDistricts(resolved.districts);
    setWards(resolved.wards);
    setForm({
      receiver_name: addr.recipient_name ?? '',
      receiver_phone: addr.phone_number ?? '',
      street: addr.street ?? '',
      province_id: resolved.province?.ProvinceID ?? 0,
      province_name: resolved.province?.ProvinceName ?? '',
      district_id: resolved.district?.DistrictID ?? 0,
      district_name: resolved.district?.DistrictName ?? '',
      ward_code: resolved.ward?.WardCode ?? '',
      ward_name: resolved.ward?.WardName ?? '',
      is_default: !!addr.is_default,
    });
  };

  const handleSaveAddress = async (mode: 'create' | 'edit') => {
    const phone = form.receiver_phone.replace(/[\s.-]/g, '');
    if (!form.receiver_name.trim()) {
      toast(t('errRecipient'), 'error');
      return;
    }
    if (!phone || !/^\+?\d{9,11}$/.test(phone)) {
      toast(phone ? t('errPhoneFormat') : t('errPhone'), 'error');
      return;
    }
    if (!form.province_id || !form.district_id || !form.ward_code) {
      toast(!form.province_id ? t('errProvince') : !form.district_id ? t('errDistrict') : t('errWard'), 'error');
      return;
    }
    if (!form.street.trim()) {
      toast(t('errStreet'), 'error');
      return;
    }

    setSavingForm(true);
    const payload = {
      recipient_name: form.receiver_name.trim(),
      phone_number: form.receiver_phone.trim(),
      province: form.province_name,
      district: form.district_name,
      ward: form.ward_name,
      street: form.street.trim(),
      ghn_province_id: form.province_id,
      ghn_district_id: form.district_id,
      ghn_ward_code: form.ward_code,
      is_default: form.is_default,
    };

    try {
      let savedId: number | undefined;
      if (mode === 'edit' && editingId) {
        const res = await addressService.update(editingId, payload);
        savedId = res.data?.data?.id ?? editingId;
      } else {
        const res = await addressService.create(payload);
        savedId = res.data?.data?.id;
      }
      const listRes = await addressService.getAll();
      const freshList: Address[] = listRes.data?.data?.result ?? listRes.data?.data ?? [];
      setSavedList(freshList);
      const picked =
        (savedId ? freshList.find((a) => a.id === savedId) : undefined) ??
        freshList.find((a) => a.is_default) ??
        freshList[0];
      if (picked) {
        await selectSavedAddress(picked, provinces);
      }
      setModalOpen(false);
      setModalMode('list');
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('saveFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSavingForm(false);
    }
  };

  const handleConfirmModal = async () => {
    const picked = savedList.find((a) => a.id === pendingId);
    if (picked) {
      await selectSavedAddress(picked, provinces);
    }
    setModalOpen(false);
  };

  const inputCls =
    'w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-surface-card text-ink';
  const selectCls = `${inputCls} bg-white disabled:bg-surface-sunken disabled:text-ink-muted`;

  const renderFormFields = (shouldEmitLive: boolean) => (
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
            onChange={(e) => patchInline({ receiver_name: e.target.value }, shouldEmitLive)}
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
            onChange={(e) => patchInline({ receiver_phone: e.target.value }, shouldEmitLive)}
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
            onChange={(e) => onProvince(Number(e.target.value), shouldEmitLive)}
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
            onChange={(e) => onDistrict(Number(e.target.value), shouldEmitLive)}
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
            onChange={(e) => onWard(e.target.value, shouldEmitLive)}
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
          onChange={(e) => patchInline({ street: e.target.value }, shouldEmitLive)}
          className={inputCls}
          placeholder={t('streetPlaceholder')}
        />
      </div>

      <label className="flex items-center gap-2 text-small text-ink">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => patchInline({ is_default: e.target.checked }, shouldEmitLive)}
          className="h-4 w-4 accent-brand"
        />
        {t('makeDefault')}
      </label>
    </div>
  );

  if (loadingSaved) {
    return <p className="text-small text-ink-muted">{tc('loading')}</p>;
  }

  // Chưa có địa chỉ nào: hiện form nhập trực tiếp + nút lưu (và vẫn tự lưu nếu bấm Đặt hàng luôn)
  if (!activeSaved) {
    return (
      <div className="space-y-3">
        {renderFormFields(true)}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-caption text-ink-muted">{t('autoSaveHint')}</p>
          <button
            type="button"
            onClick={() => handleSaveAddress('create')}
            disabled={savingForm}
            className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {savingForm && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {savingForm ? t('saving') : t('saveAndUse')}
          </button>
        </div>
      </div>
    );
  }

  // Đã có địa chỉ: hiển thị gọn 1 hàng kiểu Shopee + nút "Thay đổi" mở modal
  const fullLine = [activeSaved.street, activeSaved.ward, activeSaved.district, activeSaved.province]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-body font-semibold text-ink">{activeSaved.recipient_name}</span>
            <span className="text-body tabular-nums text-ink">{activeSaved.phone_number}</span>
            {activeSaved.is_default && (
              <span className="rounded-control border border-brand/40 bg-brand-tint px-2 py-0.5 text-caption font-semibold text-brand">
                {t('default')}
              </span>
            )}
          </div>
          <p className="mt-1 text-small leading-relaxed text-ink-muted">{fullLine}</p>
          {!activeGhnOk && (
            <p role="alert" className="mt-1.5 text-caption text-state-danger-fg">
              {t('missingGhnArea')}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={openModalList}
          className="shrink-0 rounded-control px-3 py-1.5 text-small font-semibold text-brand transition-colors hover:bg-brand-tint"
        >
          {t('change')}
        </button>
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <div className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card bg-surface-card shadow-xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h3 id="addr-modal-title" className="text-h3 text-ink">
                {modalMode === 'list'
                  ? t('myAddresses')
                  : modalMode === 'create'
                    ? t('addNew')
                    : t('editTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={tc('cancel')}
                className="rounded-control p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {modalMode === 'list' ? (
              <>
                <div className="flex-1 overflow-y-auto divide-y divide-ink/10 px-5">
                  {savedList.map((a) => {
                    const checked = a.id === pendingId;
                    const line = [a.street, a.ward, a.district, a.province].filter(Boolean).join(', ');
                    return (
                      <div key={a.id} className="flex items-start gap-3 py-4">
                        <input
                          type="radio"
                          name="checkout-saved-addr"
                          checked={checked}
                          onChange={() => setPendingId(a.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-brand"
                        />
                        <button
                          type="button"
                          onClick={() => setPendingId(a.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-body font-semibold text-ink">{a.recipient_name}</span>
                            <span className="text-small tabular-nums text-ink-muted">{a.phone_number}</span>
                            {a.is_default && (
                              <span className="rounded-control border border-brand/40 bg-brand-tint px-2 py-0.5 text-caption font-semibold text-brand">
                                {t('default')}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-small text-ink-muted">{line}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => openModalEdit(a)}
                          className="shrink-0 text-small font-semibold text-brand hover:underline"
                        >
                          {t('edit')}
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between py-4">
                    <button
                      type="button"
                      onClick={openModalCreate}
                      className="inline-flex items-center gap-1.5 rounded-control border border-ink/20 px-3.5 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {t('addNew')}
                    </button>
                    <Link href="/addresses" className="text-caption text-ink-muted hover:text-brand">
                      {t('manage')}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink hover:bg-surface-sunken"
                  >
                    {tc('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmModal}
                    className="rounded-control bg-brand px-5 py-2 text-small font-semibold text-white hover:bg-brand-dark"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">{renderFormFields(false)}</div>
                <div className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => setModalMode('list')}
                    className="rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink hover:bg-surface-sunken"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="button"
                    disabled={savingForm}
                    onClick={() => handleSaveAddress(modalMode)}
                    className="inline-flex items-center gap-2 rounded-control bg-brand px-5 py-2 text-small font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {savingForm && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {savingForm ? t('saving') : t('save')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
