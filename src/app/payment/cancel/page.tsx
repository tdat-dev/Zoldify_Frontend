'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isTopup = searchParams.get('topup') === '1';

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Đã hủy thanh toán</h1>
        <p className="text-gray-600 mb-6">
          {isTopup
            ? 'Bạn đã hủy giao dịch nạp ví. Số tiền chưa được cộng vào ví.'
            : 'Bạn đã hủy thanh toán đơn hàng. Đơn hàng vẫn được giữ ở trạng thái chờ thanh toán.'}
        </p>
        <div className="flex flex-col gap-2">
          {!isTopup && orderId && (
            <Link
              href={`/checkout?ids=${orderId}`}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử thanh toán lại
            </Link>
          )}
          {isTopup ? (
            <Link
              href="/profile/wallet"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại trang ví
            </Link>
          ) : (
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
