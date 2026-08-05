"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronRight, Image as ImageIcon, XCircle, ChevronDown, Check, Lightbulb, MapPin, Plus, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { uploadService } from '@/services/upload.service';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import StockControl from '@/components/StockControl';

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('new');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  // Step 2 fields
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [shippingPayer, setShippingPayer] = useState(0);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      setCategories(res.data?.data?.result || res.data?.result || []);
    }).catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.upload(file, 'products');
      setImages((prev) => [...prev, (res.data?.data?.url || res.data?.url)]);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen pb-32 font-sans">
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6">

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${step === 2 ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-indigo-500/30'}`}>
                {step === 2 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`ml-3 text-sm hidden sm:block ${step === 2 ? 'text-green-700 font-medium' : 'text-indigo-600 font-semibold'}`}>
                Thông tin sản phẩm
              </span>
            </div>

            {/* Arrow */}
            <div className="mx-4 sm:mx-8 flex items-center text-slate-300">
              <div className={`w-12 sm:w-24 h-0.5 ${step === 2 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
              <ChevronRight className="w-4 h-4 ml-2" />
            </div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span className={`ml-3 text-sm hidden sm:block ${step === 2 ? 'text-indigo-600 font-semibold' : 'text-slate-400 font-medium'}`}>
                Chi tiết bán hàng
              </span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {step === 1 ? 'Thông tin sản phẩm' : 'Chi tiết bán hàng'}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {step === 1 ? 'Điền thông tin cơ bản về sản phẩm của bạn' : 'Đặt giá và thông tin vận chuyển'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); setError(''); setSubmitting(true); productService.create({ name, price: Number(price), image: images[0] || '', images: images.length > 0 ? images : undefined, description, brand, condition, category_id: Number(categoryId), stock: quantity, slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }).then((res) => { router.push(`/product/${(res.data?.data?.id || res.data?.id)}`); }).catch((err) => { setError(err.response?.data?.message || 'Đăng sản phẩm thất bại'); }).finally(() => setSubmitting(false)); }}>
          {/* STEP 1 */}
          <div className={`${step === 1 ? 'block' : 'hidden'} bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100`}>
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" /> Hình ảnh sản phẩm <span className="text-red-600">*</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Tối đa 9 ảnh. Ảnh đầu tiên sẽ là ảnh bìa.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 group">
                    <img loading="lazy" decoding="async" src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 9 && (
                  <div onClick={() => fileInputRef.current?.click()} className="relative group w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 cursor-pointer">
                    <div className="border-2 border-dashed border-red-300 rounded-lg w-full h-full flex flex-col items-center justify-center bg-red-50/10 hover:bg-red-50 hover:border-red-500 transition-all text-red-400 hover:text-red-600">
                      {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Camera className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">Thêm ảnh</span></>}
                      <span className="text-[9px] opacity-70">({images.length}/9)</span>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="p-6 sm:p-8 border-b border-slate-100">
              <label className="text-sm font-bold text-slate-700 mb-2">Tên sản phẩm <span className="text-red-600">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: iPhone 14 Pro Max 256GB" className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium placeholder-slate-400 transition-all" required />
            </div>

            <div className="p-6 sm:p-8 border-b border-slate-100">
              <label className="text-sm font-bold text-slate-700 mb-2">Danh mục <span className="text-red-600">*</span></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-12 px-4 border border-slate-200 rounded-xl outline-none text-sm" required>
                <option value="">Chọn danh mục</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="p-6 sm:p-8 border-b border-slate-100">
              <label className="text-sm font-bold text-slate-700 mb-2">Thương hiệu</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="VD: Apple, Samsung..." className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm" />
            </div>

            <div className="p-6 sm:p-8 border-b border-slate-100">
              <label className="text-sm font-bold text-slate-700 mb-2">Tình trạng</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full h-12 px-4 border border-slate-200 rounded-xl outline-none text-sm">
                <option value="new">Mới</option>
                <option value="used">Đã qua sử dụng</option>
                <option value="refurbished">Đã tân trang</option>
              </select>
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-100 flex items-center justify-between">
              <button type="button" onClick={() => router.push('/')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"><ArrowLeft className="w-4 h-4 inline mr-1" /> Hủy</button>
              <button type="button" onClick={() => { if (!name || !categoryId) { setError('Vui lòng nhập tên và chọn danh mục'); return; } setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-all flex items-center gap-2">Tiếp tục <ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={`${step === 2 ? 'block' : 'hidden'} bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100`}>
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="text-indigo-500 text-xl font-bold">₫</span> Giá bán & Số lượng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative z-10">
                  <label className="text-sm font-bold text-slate-700 mb-2">Số lượng <span className="text-red-600">*</span></label>
                  <StockControl value={quantity} onChange={setQuantity} min={1} max={99999} />
                </div>
                <div className="relative z-10">
                  <label className="text-sm font-bold text-slate-700 mb-2">Giá bán <span className="text-red-600">*</span></label>
                  <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-indigo-500 transition-all bg-white">
                    <div className="w-12 h-11 flex items-center justify-center bg-slate-50 border-r border-slate-200 text-slate-500 font-bold">₫</div>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="flex-1 h-11 px-4 border-none outline-none text-lg font-bold text-slate-800 bg-transparent" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">Mô tả sản phẩm</label>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-slate-700 placeholder-slate-400 resize-none" placeholder="Mô tả chi tiết về sản phẩm của bạn..."></textarea>
                </div>
                <div className="bg-indigo-50/50 rounded-xl p-4 text-xs text-indigo-700 leading-relaxed">
                  <p className="font-bold mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Mô tả nên có:</p>
                  <ul className="space-y-1 text-indigo-600"><li>• Loại sản phẩm, tên sản phẩm</li><li>• Thương hiệu, xuất xứ</li><li>• Tình trạng chi tiết</li></ul>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex items-center justify-between">
              <button type="button" onClick={handlePrevStep} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Quay lại</button>
              <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} {submitting ? 'Đang đăng...' : 'Đăng bán ngay'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
