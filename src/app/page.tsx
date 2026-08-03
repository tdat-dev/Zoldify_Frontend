"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Flame } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      setCategories(res.data?.data?.result || []);
    }).catch(() => {});

    productService.getAll(1, 6, { sort: 'featured' }).then((res) => {
      setTopProducts(res.data?.data?.result || []);
    }).catch(() => {});

    productService.getAll(1, 12, { sort: 'newest' }).then((res) => {
      setLatestProducts(res.data?.data?.result || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-8 space-y-6">

        {/* DANH MỤC */}
        <div className="bg-white rounded-sm shadow-sm">
          {/* Header - Ẩn trên mobile để compact hơn */}
          <div className="hidden md:flex h-[60px] px-5 items-center border-b border-gray-100">
            <h2 className="text-gray-500 font-medium uppercase text-base">DANH MỤC</h2>
          </div>

          {/* Mobile: Horizontal Scroll Carousel */}
          <div className="md:hidden overflow-x-auto scrollbar-none py-3 px-2">
            <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug || cat.id}`} className="flex flex-col items-center w-[70px] flex-shrink-0 py-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden mb-1.5 bg-indigo-50 flex items-center justify-center">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-700 text-center leading-tight line-clamp-2 px-0.5">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:block p-0 relative group">
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-0">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug || cat.id}`} className="flex flex-col items-center justify-center h-[150px] border-r border-b border-gray-50 hover:shadow-md transition-shadow group/item">
                  <div className="w-[70%] aspect-square rounded-full overflow-hidden mb-2 transition-transform group-hover/item:-translate-y-1 bg-indigo-50 flex items-center justify-center">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <span className="text-[13px] text-gray-800 text-center px-2 leading-4">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* SẢN PHẨM NỔI BẬT */}
        <div className="bg-white rounded-sm shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#2C67C8] font-medium uppercase text-base">SẢN PHẨM NỔI BẬT</h2>
            <Link href="/search" className="text-[#2C67C8] text-sm flex items-center gap-1">
              Xem Tất Cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {topProducts.map((prod) => (
              <Link key={prod.id} href={`/product/${prod.id}`} className="block relative group">
                <div className="relative aspect-square bg-gray-100 mb-3 overflow-hidden">
                  <div className="absolute top-0 left-0 z-10 w-8 h-10 bg-gradient-to-b from-yellow-400 to-red-600 flex flex-col items-center justify-start pt-1" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}>
                    <span className="text-white font-bold text-[10px] leading-3">HOT</span>
                    <Flame className="w-3 h-3 text-white" />
                  </div>

                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <Package className="w-10 h-10" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 w-full bg-gray-400/80 py-1">
                    <p className="text-white text-center text-xs font-medium">Còn {prod.stock || prod.quantity}</p>
                  </div>
                </div>
                <h3 className="text-gray-800 text-base font-medium capitalize line-clamp-2">
                  {prod.name}
                </h3>
                <p className="text-red-500 text-sm font-semibold mt-1">
                  {Number(prod.price).toLocaleString('vi-VN')}đ
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* SẢN PHẨM MỚI NHẤT */}
        <div className="bg-white rounded-sm shadow-sm p-5">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-[#2C67C8] font-medium uppercase text-base">SẢN PHẨM MỚI NHẤT</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {latestProducts.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="block bg-white rounded-sm shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#2C67C8]/30 overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs text-gray-800 line-clamp-2 mb-2 min-h-[32px]">
                    {item.name}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-red-500 text-base font-medium">
                      <span className="text-xs underline">đ</span>{Number(item.price).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">Còn: {item.stock || item.quantity}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* GỢI Ý HÔM NAY */}
        <div className="mt-6">
          <div className="bg-white z-40 border-b border-gray-200 sticky top-[60px] md:top-[80px]">
            <div className="flex justify-center">
              <div className="py-4 px-10 border-b-4 border-[#2C67C8] cursor-pointer">
                <h2 className="text-[#2C67C8] font-medium uppercase text-base">GỢI Ý HÔM NAY</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {latestProducts.map((item) => (
              <Link key={`suggest-${item.id}`} href={`/product/${item.id}`} className="block bg-white rounded-sm shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#2C67C8]/30 overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="p-2">
                  <div className="text-xs text-gray-800 line-clamp-2 mb-2 min-h-[32px]">
                    {item.name}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-red-500 text-base font-medium">
                      <span className="text-xs underline">đ</span>{Number(item.price).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">Còn: {item.stock || item.quantity}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-8 pb-10">
            <Link href="/search" className="bg-white border border-gray-300 text-gray-600 px-10 py-2 hover:bg-gray-50 transition-colors rounded-sm text-sm">
              Xem Thêm
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
