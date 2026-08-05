"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, ArrowLeft, Loader, Trash2 } from 'lucide-react';
import { addressService } from '@/services/address.service';
import { useAuth } from '@/context/AuthContext';

export default function AddressesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const res = await addressService.getAll();
      setAddresses(res.data?.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefault(id);
      fetchAddresses();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    try {
      await addressService.delete(id);
      fetchAddresses();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[800px] mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-[#2C67C8]">Trang chủ</Link>
          <span>&gt;</span>
          <Link href="/profile" className="hover:text-[#2C67C8]">Tài khoản</Link>
          <span>&gt;</span>
          <span className="text-gray-800">Địa chỉ giao hàng</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-800">Địa chỉ giao hàng</h1>
          <Link href="/addresses/create" className="inline-flex items-center gap-2 px-4 py-2 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#d73211] transition-colors">
            <Plus className="w-4 h-4" />
            <span>Thêm địa chỉ</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-600" /></div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có địa chỉ nào</h3>
            <p className="text-gray-600 mb-4">Thêm địa chỉ giao hàng để đặt hàng nhanh hơn</p>
            <Link href="/addresses/create" className="inline-flex items-center gap-2 px-6 py-3 bg-[#EE4D2D] text-white rounded-lg hover:bg-[#d73211] transition-colors">
              <Plus className="w-4 h-4" />
              <span>Thêm địa chỉ đầu tiên</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address: any) => (
              <div key={address.id} className={`bg-white rounded-lg shadow-sm p-5 border-l-4 ${address.is_default ? 'border-[#EE4D2D]' : 'border-transparent'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">{address.recipient_name}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-gray-600">{address.phone_number}</span>
                      {address.is_default && (
                        <span className="px-2 py-0.5 text-xs bg-[#EE4D2D] text-white rounded">Mặc định</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {address.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {address.street}, {address.ward && `${address.ward}, `}{address.district}, {address.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/addresses/${address.id}/edit`} className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">Sửa</Link>
                    {!address.is_default && (
                      <>
                        <button onClick={() => handleSetDefault(address.id)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">Đặt mặc định</button>
                        <button onClick={() => handleDelete(address.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/profile" className="text-gray-600 hover:text-[#EE4D2D] transition-colors inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang cá nhân
          </Link>
        </div>
      </div>
    </div>
  );
}
