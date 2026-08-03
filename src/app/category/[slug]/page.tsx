"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, Package } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { productService } from '@/services/product.service';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');

  useEffect(() => {
    setLoading(true);
    categoryService.getBySlug(params.slug)
      .then((res) => {
        const cat = res.data?.data || res.data;
        setCategory(cat);
        return productService.getAll(1, 20, { category_id: cat.id, sort: sort || undefined });
      })
      .then((res) => {
        setProducts(res.data?.data?.result || []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [params.slug, sort]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc' || val === 'price_desc') {
      setSort(val);
    } else {
      setSort('');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">

        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#2C67C8]">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{category?.name || params.slug}</span>
        </nav>

        <div className="flex gap-4">

          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-sm shadow-sm p-4 mb-4">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> BỘ LỌC TÌM KIẾM
              </h2>
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Theo Danh Mục</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2 text-[#EE4D2D] font-medium">
                    <div className="w-2 h-2 rounded-full bg-[#EE4D2D]"></div> {category?.name}
                  </li>
                </ul>
              </div>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Khoảng Giá</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input type="number" placeholder="Từ" className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-[#EE4D2D]" />
                  <span className="text-gray-400">-</span>
                  <input type="number" placeholder="Đến" className="w-full px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-[#EE4D2D]" />
                </div>
                <button className="w-full py-1.5 bg-[#EE4D2D] text-white text-sm rounded hover:bg-[#d73211] transition">ÁP DỤNG</button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-200 rounded-sm px-4 py-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Sắp xếp theo</span>
                <button onClick={() => setSort('')} className={`px-4 py-1.5 text-sm rounded shadow-sm ${!sort ? 'bg-[#EE4D2D] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Mới nhất</button>
                <div className="relative">
                  <select onChange={handleSortChange} value={sort} className="px-4 py-1.5 bg-white text-gray-700 text-sm rounded shadow-sm outline-none appearance-none pr-8">
                    <option value="">Giá</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded p-10 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Chưa có sản phẩm nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {products.map((item) => (
                  <Link key={item.id} href={`/product/${item.id}`} className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="relative pt-[100%]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      {item.status === 'active' && (
                        <div className="absolute top-0 right-0 bg-[#EE4D2D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-sm">Mới</div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-sm text-gray-800 line-clamp-2 min-h-[40px] leading-tight mb-2 group-hover:text-[#EE4D2D] transition-colors">{item.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-[#EE4D2D] text-sm font-semibold underline decoration-1 underline-offset-2">đ</span>
                        <span className="text-[#EE4D2D] text-lg font-medium">{Number(item.price).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="text-xs text-gray-500">Còn: {item.stock}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
