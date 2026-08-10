"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { addressService } from '@/services/address.service';
import { provinceService } from '@/services/province.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';

export default function EditAddressPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = Number(params.id);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [form, setForm] = useState({
    recipient_name: '',
    phone_number: '',
    label: 'Nhà riêng',
    province: '',
    district: '',
    ward: '',
    street: '',
    provinceCode: 0,
    districtCode: 0,
    is_default: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const labels = ['Nhà riêng', 'Công ty', 'Trường học', 'Nhà bạn'];

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([
      provinceService.getProvinces(),
      addressService.getById(id),
    ]).then(([provs, addrRes]) => {
      setProvinces(provs);
      const addr = addrRes.data?.data;
      if (addr) {
        const p = provs.find((x: any) => x.name === addr.province);
        const provinceCode = p?.code || 0;
        const d = p?.districts.find((x: any) => x.name === addr.district);
        const districtCode = d?.code || 0;
        setForm({
          recipient_name: addr.recipient_name || '',
          phone_number: addr.phone_number || '',
          label: addr.label || 'Nhà riêng',
          province: addr.province || '',
          district: addr.district || '',
          ward: addr.ward || '',
          street: addr.street || '',
          provinceCode,
          districtCode,
          is_default: addr.is_default || false,
        });
        if (d) setWards(d.wards);
        if (p) setDistricts(p.districts);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient_name || !form.phone_number || !form.province || !form.district || !form.street) {
      toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }
    setSaving(true);
    try {
      await addressService.update(id, {
        recipient_name: form.recipient_name,
        phone_number: form.phone_number,
        label: form.label,
        province: form.province,
        district: form.district,
        ward: form.ward,
        street: form.street,
        is_default: form.is_default,
      });
      router.push('/addresses');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi khi cập nhật địa chỉ', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    // Khung trang nay do AccountShell lo.
    // TODO: phần thân dưới đây vẫn dùng lớp Tailwind cũ, chưa đưa về token.
    <div>
      <div className="max-w-[600px]">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <span>&gt;</span>
          <Link href="/addresses" className="hover:text-brand">Địa chỉ</Link>
          <span>&gt;</span>
          <span className="text-gray-800">Chỉnh sửa</span>
        </div>

        <h1 className="text-2xl font-medium text-gray-800 mb-6">Chỉnh sửa địa chỉ</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên gợi nhớ <span className="text-red-600">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {labels.map((l) => (
                <button key={l} type="button" onClick={() => setForm({ ...form, label: l })}
                  className={`px-3 py-1.5 text-sm border rounded-full transition-colors ${form.label === l ? 'bg-brand text-white border-brand' : 'hover:border-brand hover:text-brand'}`}
                >{l}</button>
              ))}
            </div>
            <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder="Hoặc nhập tên khác..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-600">*</span></label>
              <input type="text" value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder="Nhập họ tên" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-600">*</span></label>
              <input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder="VD: 0901234567" />
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-600">*</span></label>
              <select value={form.provinceCode} onChange={(e) => handleProvinceChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white">
                <option value={0}>-- Chọn Tỉnh/TP --</option>
                {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-600">*</span></label>
              <select value={form.districtCode} onChange={(e) => handleDistrictChange(Number(e.target.value))} disabled={!form.provinceCode}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white disabled:bg-gray-100">
                <option value={0}>-- Chọn Quận/Huyện --</option>
                {districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <select value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} disabled={!form.districtCode}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white disabled:bg-gray-100">
                <option value="">-- Chọn Phường/Xã --</option>
                {wards.map((w: any) => <option key={w.code} value={w.name}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết <span className="text-red-600">*</span></label>
            <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none" placeholder="Số nhà, tên đường, tòa nhà..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand" />
            <label htmlFor="is_default" className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/addresses" className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 transition-colors">Hủy</Link>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
