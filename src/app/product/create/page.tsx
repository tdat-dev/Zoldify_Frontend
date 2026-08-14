"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, Loader2, Info } from 'lucide-react';
import { uploadService } from '@/services/upload.service';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { useTranslations } from 'next-intl';
import { DEFAULT_CONDITION, type ConditionValue } from '@/lib/product-condition';
import { ConditionPicker } from '@/components/ConditionPicker';
import { toSlug } from '@/lib/slug';

/**
 * Đăng bán một món đồ cũ.
 *
 * Vì sao form này KHÔNG giống form đăng bán của Shopee/Lazada/Amazon: ở đó người
 * bán niêm yết một MẶT HÀNG — có tồn kho, biến thể, mã hàng, thương hiệu, và
 * "tình trạng" gần như luôn là mới. Ở đây mỗi tin là MỘT VẬT THỂ đã qua tay: chỉ
 * có một cái, và thứ người mua cần biết nhất là nó cũ tới mức nào.
 *
 * Nên trang này khác ba chỗ:
 *   · TÌNH TRẠNG là trường lớn nhất, bốn mức có mô tả rõ ràng, không phải một
 *     dropdown nằm lẫn giữa các trường khác.
 *   · KHÔNG có ô "số lượng" ở mặc định. Một tin là một món. Ai bán nhiều cái
 *     giống nhau thì mở thêm, nhưng đó là ngoại lệ chứ không phải mặc định.
 *   · Hướng dẫn chụp ảnh nói về chuyện CHỤP CẢ CHỖ XƯỚC, không phải chụp sao cho
 *     đẹp — vì bán đồ cũ mà giấu vết dùng thì người mua nhận hàng sẽ trả lại.
 *
 * Bốn mức tình trạng lấy từ DTO backend (src/catalog/products/dto/
 * create-product.dto.ts): `new | like_new | good | fair`. Bản trước gửi
 * `used` và `refurbished` — hai giá trị backend không hề biết.
 */
export default function CreateProductPage() {
  const t = useTranslations('sell');
  const tc = useTranslations('common');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ConditionValue>(DEFAULT_CONDITION);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [freeship, setFreeship] = useState(false);

  const [manyCopies, setManyCopies] = useState(false);
  const [stock, setStock] = useState(1);

  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => setCategories(res.data?.data?.result || []))
      .catch(() => setCategories([]));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const res = await uploadService.upload(file, 'products');
      const url = res.data?.data?.url || res.data?.url;
      if (!url) throw new Error('no url');
      setImages((prev) => [...prev, url]);
    } catch {
      // Bản trước chỉ console.error, nên người dùng bấm thêm ảnh mà không có gì
      // xảy ra và không biết vì sao.
      setUploadError(t('uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (images.length === 0) next.images = t('errNoPhoto');
    if (!name.trim()) next.name = t('errNoName');
    if (!categoryId) next.category = t('errNoCategory');
    const p = Number(price);
    if (!price.trim() || !Number.isFinite(p) || p <= 0) next.price = t('errBadPrice');
    setFieldErrors(next);
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      // Đưa con trỏ tới trường hỏng đầu tiên thay vì để người dùng tự đi tìm.
      const first = ['images', 'name', 'category', 'price'].find((k) => errs[k]);
      document.getElementById(first === 'images' ? 'add-photo' : `field-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    productService
      .create({
        name: name.trim(),
        price: Number(price),
        image: images[0],
        images,
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        condition,
        category_id: Number(categoryId),
        stock: manyCopies ? stock : 1,
        is_freeship: freeship,
        slug: toSlug(name),
      } as any)
      .then((res) => router.push(`/product/${res.data.data.id}`))
      .catch((err) =>
        setError(err.response?.data?.message || t('errCreate')),
      )
      .finally(() => setSubmitting(false));
  };

  const label = 'mb-1.5 block text-small font-semibold text-ink';
  const control =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
  const errText = 'mt-1.5 text-small text-state-danger-fg';

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[820px] px-4 py-6 md:py-8">
        <h1 className="text-h1 text-ink">{t('titleCreate')}</h1>
        <p className="mt-1.5 text-body text-ink-muted">
          {t('leadCreate')}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-control border border-state-danger-fg/30 bg-state-danger-bg px-4 py-3 text-body text-state-danger-fg"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-3">
          {/* ---------- Ảnh ---------- */}
          <section aria-labelledby="sec-photo" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-photo" className="text-h3 text-ink">
              {t('photos')} <span className="text-price">*</span>
            </h2>
            <p className="mt-1 text-small text-ink-muted">
              {t('photosHint')}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={url} className="relative h-24 w-24 shrink-0">
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full rounded-control border border-ink/12 object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute inset-x-0 bottom-0 rounded-b-control bg-ink/75 py-0.5 text-center text-caption text-white">
                      {t('cover')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, x) => x !== i))}
                    aria-label={t('removePhoto', { index: i + 1 })}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-price"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {images.length < 9 && (
                <button
                  id="add-photo"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-control border border-dashed border-ink/25 text-ink-muted transition-colors hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5" aria-hidden="true" />
                      <span className="text-caption font-normal">{t('addPhoto')}</span>
                      <span className="text-caption font-normal text-ink-faint">
                        {images.length}/9
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              tabIndex={-1}
            />
            {uploadError && <p className={errText}>{uploadError}</p>}
            {fieldErrors.images && <p className={errText}>{fieldErrors.images}</p>}
          </section>

          {/* ---------- Món gì ---------- */}
          <section aria-labelledby="sec-what" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-what" className="mb-4 text-h3 text-ink">
              {t('whatIsIt')}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="field-name" className={label}>
                  {t('name')} <span className="text-price">*</span>
                </label>
                <input
                  id="field-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                  className={control}
                />
                {fieldErrors.name && (
                  <p id="err-name" className={errText}>
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="field-category" className={label}>
                    {t('category')} <span className="text-price">*</span>
                  </label>
                  <select
                    id="field-category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    aria-invalid={!!fieldErrors.category}
                    aria-describedby={fieldErrors.category ? 'err-category' : undefined}
                    className={control}
                  >
                    <option value="">{t('categoryPlaceholder')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && (
                    <p id="err-category" className={errText}>
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="field-brand" className={label}>
                    {t('brand')}{' '}
              <span className="font-normal text-ink-faint">({tc('optional')})</span>
                  </label>
                  <input
                    id="field-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder={t('brandPlaceholder')}
                    className={control}
                  />
                  <p className="mt-1.5 text-caption font-normal text-ink-muted">
                    {t('brandHint')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Tình trạng: trường lớn nhất của trang ---------- */}
          <section aria-labelledby="sec-cond" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-cond" className="text-h3 text-ink">
              {t('conditionTitle')} <span className="text-price">*</span>
            </h2>
            <p className="mt-1 text-small text-ink-muted">
              {t('conditionHint')}
            </p>

            <div className="mt-4">
              <ConditionPicker value={condition} onChange={setCondition} />
            </div>
          </section>

          {/* ---------- Giá & giao hàng ---------- */}
          <section aria-labelledby="sec-price" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-price" className="mb-4 text-h3 text-ink">
              {t('priceAndShipping')}
            </h2>

            <div className="max-w-[280px]">
              <label htmlFor="field-price" className={label}>
                {t('price')} <span className="text-price">*</span>
              </label>
              <div
                className={`flex items-center overflow-hidden rounded-control border bg-surface-card transition-colors focus-within:ring-2 focus-within:ring-brand/20 ${
                  fieldErrors.price ? 'border-state-danger-fg' : 'border-ink/16 focus-within:border-brand'
                }`}
              >
                <input
                  id="field-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  aria-invalid={!!fieldErrors.price}
                  aria-describedby={fieldErrors.price ? 'err-price' : undefined}
                  className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-[17px] font-bold tabular-nums text-ink focus:outline-none"
                />
                <span className="px-3.5 text-body text-ink-muted" aria-hidden="true">
                  ₫
                </span>
              </div>
              {fieldErrors.price && (
                <p id="err-price" className={errText}>
                  {fieldErrors.price}
                </p>
              )}
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={freeship}
                onChange={(e) => setFreeship(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="text-small text-ink">
                {t('freeship')}
                <span className="mt-0.5 block text-caption font-normal text-ink-muted">
                  {t('freeshipHint')}
                </span>
              </span>
            </label>

            {/* Số lượng nằm sau một công tắc, không phải trường mặc định: một tin
                là một món. Đây là chỗ khác rõ nhất so với form của các sàn kia. */}
            <label className="mt-4 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={manyCopies}
                onChange={(e) => {
                  setManyCopies(e.target.checked);
                  if (!e.target.checked) setStock(1);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="text-small text-ink">
                {t('manyCopies')}
                <span className="mt-0.5 block text-caption font-normal text-ink-muted">
                  {t('manyCopiesHint')}
                </span>
              </span>
            </label>

            {manyCopies && (
              <div className="mt-3 max-w-[160px]">
                <label htmlFor="field-stock" className={label}>
                  {t('stock')}
                </label>
                <input
                  id="field-stock"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={stock}
                  onChange={(e) => setStock(Math.max(1, Number(e.target.value) || 1))}
                  className={control}
                />
              </div>
            )}
          </section>

          {/* ---------- Mô tả ---------- */}
          <section aria-labelledby="sec-desc" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-desc" className="text-h3 text-ink">
              {t('describe')}
            </h2>
            <p className="mt-1 text-small text-ink-muted">
              {t('describeHint')}
            </p>

            <label htmlFor="field-desc" className="sr-only">
              {t('describeLabel')}
            </label>
            <textarea
              id="field-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('describePlaceholder')}
              className={`${control} mt-4 resize-y`}
            />

            <p className="mt-3 flex items-start gap-2 text-caption font-normal text-ink-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t('describeTip')}
            </p>
          </section>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-control bg-brand px-6 py-3 text-body font-semibold text-white transition-colors hover:bg-brand-dark disabled:bg-ink-faint"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? t('submitCreating') : t('submitCreate')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-control px-4 py-3 text-body text-ink-muted transition-colors hover:text-ink"
            >
              {tc('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
