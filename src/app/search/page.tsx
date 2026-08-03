"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, Search } from 'lucide-react';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ current: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>(['Laptop', 'Sách', 'Điện thoại', 'Tai nghe', 'Áo thun', 'Giày']);

  const fetchProducts = useCallback(async (page: number) => {
    const params: any = {};
    if (q) params.q = q;
    if (selectedCat) params.category_id = parseInt(selectedCat);
    if (sort) params.sort = sort;

    const res = await productService.getAll(page, 20, params);
    setProducts(res.data?.data?.result || []);
    setMeta(res.data?.data?.meta || { current: 1, pages: 1, total: 0 });
  }, [q, selectedCat, sort]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      setCategories(res.data?.data?.result || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    productService.getAll(1, 8, { sort: 'most_viewed' })
      .then((res) => {
        const list = res.data?.data?.result || [];
        const words = list
          .map((p: any) => (p.name || '').split(' ').slice(0, 2).join(' '))
          .filter((w: string) => w.length >= 3)
          .slice(0, 6);
        if (words.length > 0) setTrendingKeywords(words);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, selectedCat, sort]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const keyword = formData.get('q') as string;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const paginate = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">

        <div className="flex gap-4">
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-sm p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-4 pb-2 border-b">BỘ LỌC TÌM KIẾM</h3>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Danh mục</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={selectedCat === ''} onChange={() => setSelectedCat('')} className="text-[#2C67C8]" />
                    <span>Tất cả</span>
                  </label>
                  {categories.map((cat: any) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cat" checked={selectedCat === String(cat.id)} onChange={() => setSelectedCat(String(cat.id))} className="text-[#2C67C8]" />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sắp xếp</h4>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none">
                  <option value="">Mặc định</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-sm shadow-sm p-5 mb-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input name="q" defaultValue={q} placeholder="Tìm kiếm sản phẩm..." className="flex-1 px-4 py-2 border border-gray-300 rounded-sm outline-none focus:border-[#2C67C8] text-sm" />
                <button type="submit" className="px-6 py-2 bg-[#2C67C8] text-white rounded-sm hover:bg-blue-700 text-sm">Tìm</button>
              </form>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                <span className="font-medium text-gray-600">Phổ biến:</span>
                {trendingKeywords.map((kw) => (
                  <Link
                    key={kw}
                    href={`/search?q=${encodeURIComponent(kw)}`}
                    className="hover:text-[#2C67C8] cursor-pointer"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </div>

            {q && (
              <div className="bg-white rounded-sm shadow-sm p-5 mb-4">
                <h1 className="text-xl font-medium text-gray-800 border-l-4 border-[#2C67C8] pl-3">
                  Kết quả tìm kiếm: &ldquo;{q}&rdquo;
                  <span className="text-sm font-normal text-gray-500 ml-2">({meta.total} sản phẩm)</span>
                </h1>
              </div>
            )}

            {products.length === 0 ? (
              <div className="bg-white rounded p-10 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
                <p className="text-sm text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-3">Từ khóa phổ biến:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {trendingKeywords.map((kw) => (
                      <Link
                        key={kw}
                        href={`/search?q=${encodeURIComponent(kw)}`}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-[#2C67C8] hover:text-white text-gray-700 rounded-sm transition-colors"
                      >
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {products.map((item) => (
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
                        <div className="text-xs text-gray-500">Còn: {item.stock}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {meta.pages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: meta.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 border rounded-sm text-sm ${
                      page === meta.current
                        ? 'bg-[#2C67C8] border-[#2C67C8] text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
