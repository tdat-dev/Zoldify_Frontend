"use client";

import React, { useState, useEffect } from 'react';
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
          <label className="text-sm font-medium text-gray-700">Địa chỉ đã lưu</label>
          {savedAddresses.map((addr: any) => (
            <div
              key={addr.id}
              onClick={() => handleSelectSaved(addr)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedId === addr.id ? 'border-[#EE4D2D] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-2">
                <input type="radio" checked={selectedId === addr.id} readOnly className="accent-[#EE4D2D]" />
                <div>
                  <span className="font-medium text-gray-800">{addr.recipient_name}</span>
                  <span className="text-gray-400 mx-1">|</span>
                  <span className="text-gray-600">{addr.phone_number}</span>
                  {addr.is_default && <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#EE4D2D] text-white rounded">Mặc định</span>}
                  <p className="text-sm text-gray-500 mt-0.5">{addr.street}{addr.ward ? `, ${addr.ward}` : ''}, {addr.district}, {addr.province}</p>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setUseNew(true)} className="text-sm text-blue-600 hover:underline">+ Dùng địa chỉ khác</button>
        </div>
      )}

      {(useNew || savedAddresses.length === 0) && (
        <div className="space-y-3">
          {savedAddresses.length > 0 && (
            <button type="button" onClick={() => { setUseNew(false); if (savedAddresses.length) emitSelection(savedAddresses[0]); }} className="text-sm text-blue-600 hover:underline">
              &larr; Chọn địa chỉ đã lưu
            </button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Người nhận <span className="text-red-500">*</span></label>
              <input type="text" value={form.recipient_name} onChange={(e) => handleNewFormChange('recipient_name', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none" placeholder="Họ tên" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
              <input type="tel" value={form.phone_number} onChange={(e) => handleNewFormChange('phone_number', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none" placeholder="090..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Tỉnh/TP <span className="text-red-500">*</span></label>
              <select value={form.provinceCode} onChange={(e) => handleProvinceChange(Number(e.target.value))} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none bg-white">
                <option value={0}>-- Chọn --</option>
                {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Quận/Huyện <span className="text-red-500">*</span></label>
              <select value={form.districtCode} onChange={(e) => handleDistrictChange(Number(e.target.value))} disabled={!form.provinceCode} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none bg-white disabled:bg-gray-100">
                <option value={0}>-- Chọn --</option>
                {districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phường/Xã</label>
              <select value={form.ward} onChange={(e) => handleWardChange(e.target.value)} disabled={!form.districtCode} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none bg-white disabled:bg-gray-100">
                <option value="">-- Chọn --</option>
                {wards.map((w: any) => <option key={w.code} value={w.name}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
            <input type="text" value={form.street} onChange={(e) => handleNewFormChange('street', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none" placeholder="Số nhà, tên đường" />
          </div>
        </div>
      )}
    </div>
  );
}
