"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { addressService } from '@/services/address.service';
import { provinceService } from '@/services/province.service';

interface Props {
  onSelect: (address: {
    receiver_name: string;
    receiver_phone: string;
    shipping_address: string;
    province: string;
    district: string;
  }) => void;
}

export default function AddressPicker({ onSelect }: Props) {
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const t = useTranslations('addresses');
  const [useNew, setUseNew] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [form, setForm] = useState({
    recipient_name: '',
    phone_number: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    provinceCode: 0,
    districtCode: 0,
  });

  useEffect(() => {
    fetchAddresses();
    provinceService.getProvinces().then(setProvinces);
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAll();
      const list = res.data?.data || [];
      setSavedAddresses(list);
      const defaultAddr = list.find((a: any) => a.is_default) || list[0];
      if (defaultAddr) {
        setSelectedId(defaultAddr.id);
        emitSelection(defaultAddr);
      }
    } catch {}
  };

  const emitSelection = (addr: any) => {
    onSelect({
      receiver_name: addr.recipient_name,
      receiver_phone: addr.phone_number,
      shipping_address: addr.street + (addr.ward ? `, ${addr.ward}` : '') + `, ${addr.district}, ${addr.province}`,
      province: addr.province,
      district: addr.district,
    });
  };

  const handleSelectSaved = (addr: any) => {
    setSelectedId(addr.id);
    setUseNew(false);
    emitSelection(addr);
  };

  const handleProvinceChange = async (code: number) => {
    const name = provinces.find(p => p.code === code)?.name || '';
    setForm({ ...form, province: name, provinceCode: code, district: '', districtCode: 0, ward: '' });
    setDistricts(code ? await provinceService.getDistricts(code) : []);
    setWards([]);
  };

  const handleDistrictChange = async (code: number) => {
    const name = districts.find(d => d.code === code)?.name || '';
    setForm({ ...form, district: name, districtCode: code, ward: '' });
    setWards(code ? await provinceService.getWards(code) : []);
  };

  const handleWardChange = (name: string) => {
    const newForm = { ...form, ward: name };
    setForm(newForm);
    const fullAddr = newForm.street + (newForm.ward ? `, ${newForm.ward}` : '') + `, ${newForm.district}, ${newForm.province}`;
    onSelect({
      receiver_name: newForm.recipient_name,
      receiver_phone: newForm.phone_number,
      shipping_address: fullAddr,
      province: newForm.province,
      district: newForm.district,
    });
  };

  const handleNewFormChange = (field: string, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    if (field === 'recipient_name' || field === 'phone_number' || field === 'street') {
      const fullAddr = newForm.street + (newForm.ward ? `, ${newForm.ward}` : '') + `, ${newForm.district}, ${newForm.province}`;
      onSelect({
        receiver_name: newForm.recipient_name,
        receiver_phone: newForm.phone_number,
        shipping_address: fullAddr,
        province: newForm.province,
        district: newForm.district,
      });
    }
  };

  return (
    <div className="space-y-4">
      {savedAddresses.length > 0 && !useNew && (
        <div className="space-y-2">
          <label className="text-small font-semibold text-ink">{t('saved')}</label>
          {savedAddresses.map((addr: any) => (
            <div
              key={addr.id}
              onClick={() => handleSelectSaved(addr)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedId === addr.id ? 'border-brand bg-state-pending-bg' : 'border-ink/10 hover:border-ink/16'}`}
            >
              <div className="flex items-center gap-2">
                <input type="radio" checked={selectedId === addr.id} readOnly className="accent-brand" />
                <div>
                  <span className="font-medium text-ink">{addr.recipient_name}</span>
                  <span className="text-ink-muted mx-1">|</span>
                  <span className="text-ink-muted">{addr.phone_number}</span>
                  {addr.is_default && <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-brand text-white rounded">{t('default')}</span>}
                  <p className="text-sm text-ink-muted mt-0.5">{addr.street}{addr.ward ? `, ${addr.ward}` : ''}, {addr.district}, {addr.province}</p>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setUseNew(true)} className="text-small font-semibold text-brand hover:underline">{t('useAnother')}</button>
        </div>
      )}

      {(useNew || savedAddresses.length === 0) && (
        <div className="space-y-3">
          {savedAddresses.length > 0 && (
            <button type="button" onClick={() => { setUseNew(false); if (savedAddresses.length) emitSelection(savedAddresses[0]); }} className="text-sm text-brand hover:underline">
              &larr; {t('pickSaved')}
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-small font-semibold text-ink">{t('recipient')} <span className="text-price">*</span></label>
              <input type="text" value={form.recipient_name} onChange={(e) => handleNewFormChange('recipient_name', e.target.value)} className="w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder={t('recipientPlaceholder')} />
            </div>
            <div>
              <label className="text-small font-semibold text-ink">{t('phone')} <span className="text-price">*</span></label>
              <input type="tel" value={form.phone_number} onChange={(e) => handleNewFormChange('phone_number', e.target.value)} className="w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder="090..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-small font-semibold text-ink">{t('province')} <span className="text-price">*</span></label>
              <select value={form.provinceCode} onChange={(e) => handleProvinceChange(Number(e.target.value))} className="w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white">
                <option value={0}>{t('choose')}</option>
                {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-small font-semibold text-ink">{t('district')} <span className="text-price">*</span></label>
              <select value={form.districtCode} onChange={(e) => handleDistrictChange(Number(e.target.value))} disabled={!form.provinceCode} className="w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white disabled:bg-surface-sunken">
                <option value={0}>{t('choose')}</option>
                {districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-small font-semibold text-ink">{t('ward')}</label>
              <select value={form.ward} onChange={(e) => handleWardChange(e.target.value)} disabled={!form.districtCode} className="w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white disabled:bg-surface-sunken">
                <option value="">{t('choose')}</option>
                {wards.map((w: any) => <option key={w.code} value={w.name}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-small font-semibold text-ink">{t('street')} <span className="text-price">*</span></label>
            <input type="text" value={form.street} onChange={(e) => handleNewFormChange('street', e.target.value)} className="w-full mt-1 px-3 py-2 border border-ink/16 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder={t('streetPlaceholder')} />
          </div>
        </div>
      )}
    </div>
  );
}
