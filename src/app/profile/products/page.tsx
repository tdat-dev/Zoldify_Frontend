'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Wallet, Loader, Edit, Eye, Trash2, Box, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { productService } from '@/services/product.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import StockControl from '@/components/StockControl';

export default function MyProductsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });

  const fetchProducts = useCallback(async (page = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await productService.getBySeller(user.id, page, 20);
      const data = res.data?.data || res.data;
      setProducts(data?.result || []);
      setMeta(data?.meta || { current: 1, pageSize: 20, total: 0, pages: 0 });
    } catch (err) {
      console.error(err);
      toast('Lỗi tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) fetchProducts(1);
  }, [isAuthenticated, user, fetchProducts]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?\nHành động này không thể hoàn tác.`)) return;
    try {
      await productService.remove(id);
      toast('Đã xóa sản phẩm', 'success');
      fetchProducts(meta.current);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi xóa sản phẩm';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    }
  };

  const updateLocalStock = (id: number, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  return (
    // Khung trang nay do AccountShell lo.
    // TODO: phần thân dưới đây vẫn dùng lớp Tailwind cũ, chưa đưa về token.
    <div>
      <div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sản phẩm của tôi</h1>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? 'Đang tải...' : `Tổng cộng ${meta.total} sản phẩm`}
            </p>
          </div>
          <Link
            href="/product/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Đăng sản phẩm mới
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              <Box className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-medium">Bạn chưa có sản phẩm nào</p>
              <p className="text-sm mt-1 mb-4">Hãy đăng sản phẩm đầu tiên của bạn</p>
              <Link
                href="/product/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Đăng sản phẩm
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Giá</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Số lượng</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || '/images/default-product.png'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border bg-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 line-clamp-1 max-w-xs">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-600">ID: #{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                        {product.category?.name || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-red-600 whitespace-nowrap">
                        {Number(product.price).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-3 px-4">
                        <StockInlineEditor
                          productId={product.id}
                          initialStock={product.stock || 0}
                          onLocalChange={(s) => updateLocalStock(product.id, s)}
                        />
                      </td>
                      <td className="py-3 px-4">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchProducts(p)}
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
    </div>
  );
}

function StockInlineEditor({
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
