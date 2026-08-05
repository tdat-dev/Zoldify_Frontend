"use client";

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function CartSuccessPage() {
  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:py-10">
      <div className="max-w-[600px] mx-auto px-4">
        <div className="bg-white rounded-sm shadow-sm p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
          <p className="text-gray-600 mb-8">Cảm ơn bạn đã mua hàng tại Zoldify. Đơn hàng của bạn đang được xử lý.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="px-6 py-2.5 bg-[#EE4D2D] text-white font-medium rounded-sm hover:bg-[#d73211] transition-colors shadow-sm">
              Về trang chủ
            </Link>
            <Link href="/profile/orders" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-sm hover:bg-gray-50 transition-colors">
              Xem đơn hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
