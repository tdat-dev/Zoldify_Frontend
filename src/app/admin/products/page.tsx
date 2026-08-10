'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Box, Loader2, Eye, Search, Package } from 'lucide-react';
import { productService } from '@/services/product.service';
import StockControl from '@/components/StockControl';
import { useToast } from '@/components/Toast';
import BackButton from '@/components/BackButton';

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast, confirm } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });

  const fetchProducts = useCallback(async (page = 1, q = '') => {
    setLoading(true);
    try {
      const res = await productService.getAll(page, 20, q ? { q } : undefined);
      const data = res.data?.data || res.data;
      setProducts(data?.result || []);
      setMeta(data?.meta || { current: 1, pageSize: 20, total: 0, pages: 0 });
    } catch (err) {
      console.error(err);
      toast('Lỗi tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1, '');
  }, [fetchProducts]);

  const handleDelete = async (id: number, name: string) => {
    // PHẢI await: confirm của useToast trả về Promise, còn window.confirm trả
    // về boolean. Đổi nguồn mà quên await thì `!Promise` luôn là false và lệnh
    // xoá chạy thẳng, không hỏi ai cả.
    if (!(await confirm(`Xoá tin “${name}”? Không lấy lại được.`))) return;
    try {
      await productService.remove(id);
      toast('Đã xóa sản phẩm', 'success');
      fetchProducts(meta.current, search);
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi xóa sản phẩm';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, search);
  };

  const updateLocalStock = (id: number, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <BackButton />
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-gray-600 text-sm mt-1">
            Tổng cộng {meta.total} sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <Link
            href="/product/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Đang tải...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Giá</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Số lượng</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Người bán</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-600">
                    <Box className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Chưa có sản phẩm nào</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {/* /images/default-product.png KHÔNG tồn tại trong
                            public/images — trỏ vào nó thì mọi tin không ảnh
                            hiện icon ảnh vỡ. Vẽ ô xám có icon thay vì vậy. */}
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          )}
                        </span>
                        <div>
                          <div className="font-medium text-gray-800 line-clamp-1 max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-600">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {product.category?.name || '—'}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-red-600 whitespace-nowrap">
                      {Number(product.price).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-4 px-6">
                      <StockEditor
                        productId={product.id}
                        initialStock={product.stock || 0}
                        onLocalChange={(s) => updateLocalStock(product.id, s)}
                      />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {product.seller?.full_name || `User #${product.seller?.id}` || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/product/${product.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Xem"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => router.push(`/product/${product.id}/edit`)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchProducts(p, search)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                p === meta.current
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StockEditor({
  productId,
  initialStock,
  onLocalChange,
}: {
  productId: number;
  initialStock: number;
  onLocalChange: (newStock: number) => void;
}) {
  const { toast } = useToast();
  const [stock, setStock] = useState(initialStock);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  const update = async (newStock: number) => {
    const prev = stock;
    setStock(newStock);
    onLocalChange(newStock);
    setSaving(true);
    try {
      await productService.updateStock(productId, newStock);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi cập nhật số lượng';
      setStock(prev);
      onLocalChange(prev);
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <StockControl
        value={stock}
        onChange={update}
        min={0}
        max={99999}
        compact
        disabled={saving}
      />
      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
    </div>
  );
}
