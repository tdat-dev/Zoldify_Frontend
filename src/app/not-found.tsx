import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-[#EE4D2D] opacity-20">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-[-40px] mb-4">Không tìm thấy trang</h2>
        <p className="text-gray-500 mb-8">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không thể truy cập.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-[#EE4D2D] text-white font-medium rounded-lg hover:bg-[#d73211] transition-colors"
        >
          Trở về Trang chủ
        </Link>
      </div>
    </div>
  );
}
