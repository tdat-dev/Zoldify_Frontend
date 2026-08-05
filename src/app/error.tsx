"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Trang này đang gặp sự cố</h1>
        <p className="text-sm text-gray-700 mb-6">
          Lỗi xảy ra khi tải nội dung. Bạn thử lại, hoặc quay về trang chủ rồi vào lại sau.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#2C67C8] text-white rounded-sm text-sm font-medium hover:bg-[#22539f] transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
