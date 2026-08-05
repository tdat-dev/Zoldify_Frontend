'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { payosService } from '@/services/payos.service';

function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isTopup = searchParams.get('topup') === '1';
  const status = searchParams.get('status'); // PAID, CANCELLED
  const code = searchParams.get('code');

  const [phase, setPhase] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Đang xác nhận thanh toán...');
  const [finalOrder, setFinalOrder] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    // Nếu PayOS báo CANCELLED ngay từ returnUrl
    if (status === 'CANCELLED' || (code && code !== '00')) {
      setPhase('failed');
      setMessage('Thanh toán đã bị hủy');
      return;
    }

    // Nạp ví: thông báo thành công và chuyển về trang ví
    if (isTopup) {
      // Chờ vài giây cho webhook xử lý xong
      await new Promise((r) => setTimeout(r, 3000));
      setPhase('success');
      setMessage('Nạp ví thành công! Đang chuyển hướng...');
      setTimeout(() => router.push('/profile/wallet'), 2500);
      return;
    }

    // Đơn hàng: polling tối đa 30s
    if (!orderId) {
      setPhase('failed');
      setMessage('Không tìm thấy mã đơn hàng');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const interval = 3000;

    const poll = async () => {
      try {
        const res = await payosService.refresh(Number(orderId));
        const data = res.data?.data;
        if (res.data?.data?.is_paid) {
          setFinalOrder(data);
          setPhase('success');
          setMessage('Thanh toán thành công!');
          return;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
      attempts++;
      if (attempts < maxAttempts) {
        setMessage(`Đang xác nhận thanh toán... (${attempts}/${maxAttempts})`);
        setTimeout(poll, interval);
      } else {
        setPhase('failed');
        setMessage('Không nhận được xác nhận từ hệ thống. Vui lòng kiểm tra lại trong mục đơn hàng.');
      }
    };

    poll();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        {phase === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Đang xử lý</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {phase === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Thành công!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            {isTopup ? (
              <Link
                href="/profile/wallet"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Về trang ví <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/profile/orders/${orderId}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Xem đơn hàng <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-700">
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}
          </>
        )}

        {phase === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Không thành công</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-2">
              {orderId && !isTopup && (
                <Link
                  href={`/checkout?ids=${orderId}`}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thử thanh toán lại
                </Link>
              )}
              {isTopup ? (
                <Link href="/profile/wallet" className="text-sm text-gray-600 hover:text-gray-700">
                  Về trang ví
                </Link>
              ) : (
                <Link href="/cart" className="text-sm text-gray-600 hover:text-gray-700">
                  Quay lại giỏ hàng
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}
