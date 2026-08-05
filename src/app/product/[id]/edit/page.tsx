'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Loader2, Save, Trash2, X, XCircle } from 'lucide-react';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import StockControl from '@/components/StockControl';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('used');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      productService.getOne(productId),
      categoryService.getAll().catch(() => ({ data: { data: { result: [] } } })),
    ])
      .then(([prodRes, catRes]) => {
        const p = prodRes.data?.data || prodRes.data;
        if (!p) throw new Error('Product not found');
        setProduct(p);
        setName(p.name || '');
        setDescription(p.description || '');
        setBrand(p.brand || '');
        setPrice(String(p.price ?? ''));
        setStock(p.stock ?? 1);
        setCategoryId(p.category?.id ? String(p.category.id) : '');
        setCondition(p.condition || 'used');
        setImages(p.images?.length ? p.images : p.image ? [p.image] : []);
        setCategories(catRes.data?.data?.result || catRes.data?.result || []);

        if (user && p.seller?.id && p.seller.id !== user.id && user.role !== 'admin') {
          toast('Bạn không có quyền sửa sản phẩm này', 'error');
          router.push(`/product/${productId}`);
        }
      })
      .catch((err) => {
        console.error(err);
        toast('Không tải được sản phẩm', 'error');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadService.upload(file);
        const url = res.data?.url || res.data?.data?.url || res.data;
        if (url) newUrls.push(url);
      }
      setImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      toast('Upload ảnh thất bại', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await productService.update(productId, {
        name,
        description,
        brand,
        price: Number(price),
        stock,
        category_id: Number(categoryId),
        condition,
        image: images[0],
        images,
      });
      toast('Cập nhật sản phẩm thành công', 'success');
      router.push(`/product/${productId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi cập nhật sản phẩm';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Xóa sản phẩm "${name}"?\nHành động này không thể hoàn tác.`)) return;
    try {
      await productService.remove(productId);
      toast('Đã xóa sản phẩm', 'success');
      router.push('/profile/products');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi xóa sản phẩm';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/product/${productId}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Quay lại sản phẩm
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" /> Xóa sản phẩm
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa sản phẩm</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Hình ảnh sản phẩm</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                  <img loading="lazy" decoding="async" src={url} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Ảnh bìa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">Thêm ảnh</span>
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-600 mt-2">Ảnh đầu tiên sẽ là ảnh bìa. Tối đa 8 ảnh.</p>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Thông tin cơ bản</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tên sản phẩm <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Danh mục <span className="text-red-600">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Thương hiệu</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tình trạng</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="new">Mới</option>
                <option value="used">Đã qua sử dụng</option>
                <option value="refurbished">Đã tân trang</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mô tả chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Price + Stock */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Giá bán & Số lượng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Số lượng <span className="text-red-600">*</span>
                </label>
                <StockControl value={stock} onChange={setStock} min={0} max={99999} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Giá bán (VND) <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-gray-300 overflow-hidden focus-within:border-blue-500 transition-all bg-white">
                  <div className="w-12 h-11 flex items-center justify-center bg-gray-50 border-r border-gray-200 text-gray-600 font-bold">₫</div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1 h-11 px-4 border-none outline-none text-lg font-bold text-gray-800 bg-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 sticky bottom-0 bg-gray-50 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Lưu thay đổi
                </>
              )}
            </button>
            <Link
              href={`/product/${productId}`}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
