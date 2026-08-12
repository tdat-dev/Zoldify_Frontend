'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, Trash2, X } from 'lucide-react';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { ConditionPicker } from '@/components/ConditionPicker';
import { normalizeCondition, type ConditionValue } from '@/lib/product-condition';

/**
 * Sửa một tin đã đăng. Cùng khuôn với trang đăng bán, dùng chung
 * `ConditionPicker` và `normalizeCondition` để hai trang không lệch nhau nữa.
 *
 * Ba lỗi của bản trước:
 *   · `setCondition(p.condition || 'used')` — `used` không nằm trong thang của
 *     backend (`new | like_new | good | fair`). Tin có tình trạng `like_new` mở
 *     ra thì select không có mục đó, lưu lại là GHI ĐÈ MẤT tình trạng thật.
 *     Nay đi qua `normalizeCondition`.
 *   · mọi `<label>` thiếu `htmlFor` nên không input nào có tên truy cập được.
 *   · xoá tin dùng `window.confirm` — hộp thoại của trình duyệt chặn mọi thứ và
 *     không đọc được tên món trong ngữ cảnh. Nay là một bước xác nhận ngay trên
 *     trang, nêu rõ xoá cái gì.
 *
 * KHÔNG gửi `slug` khi sửa: đổi slug là đổi đường dẫn của tin, làm hỏng mọi liên
 * kết người bán đã chia sẻ.
 */
export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('sell');
  const tc = useTranslations('common');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ConditionValue>('good');
  const [images, setImages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId) return;
    Promise.all([
      productService.getOne(productId),
      categoryService.getAll().catch(() => ({ data: { data: { result: [] } } })),
    ])
      .then(([prodRes, catRes]: any[]) => {
        const p = prodRes.data?.data || prodRes.data;
        if (!p) throw new Error('not found');
        setName(p.name || '');
        setDescription(p.description || '');
        setBrand(p.brand || '');
        setPrice(String(p.price ?? ''));
        setStock(p.stock ?? 1);
        setCategoryId(p.category?.id ? String(p.category.id) : '');
        setCondition(normalizeCondition(p.condition));
        setImages(p.images?.length ? p.images : p.image ? [p.image] : []);
        setCategories(catRes.data?.data?.result || []);

        if (user && p.seller?.id && p.seller.id !== user.id && user.role !== 'admin') {
          toast(t('errNotYours'), 'error');
          router.push(`/product/${productId}`);
        }
      })
      .catch(() => {
        toast(t('errLoad'), 'error');
        router.push('/');
      })
      .finally(() => setLoading(false));
    // user cố tình không nằm trong mảng phụ thuộc: nạp lại toàn bộ form khi
    // context auth vừa tỉnh sẽ xoá mất những gì người dùng đang gõ dở.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res: any = await uploadService.upload(file, 'products');
        const url = res.data?.data?.url || res.data?.url;
        if (url) urls.push(url);
      }
      if (urls.length === 0) throw new Error('no url');
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast(t('uploadFailed'), 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (images.length === 0) errs.images = t('errNoPhoto');
    if (!name.trim()) errs.name = t('errNoName');
    if (!categoryId) errs.category = t('errNoCategory');
    const p = Number(price);
    if (!price.trim() || !Number.isFinite(p) || p <= 0) errs.price = t('errBadPrice');
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = ['images', 'name', 'category', 'price'].find((k) => errs[k]);
      document.getElementById(first === 'images' ? 'add-photo' : `field-${first}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await productService.update(productId, {
        name: name.trim(),
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        price: Number(price),
        stock,
        category_id: Number(categoryId),
        condition,
        image: images[0],
        images,
      } as any);
      toast(t('savedOk'), 'success');
      router.push(`/product/${productId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || t('errUpdate');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.remove(productId);
      toast(t('deletedOk'), 'success');
      router.push('/profile/products');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('errDelete');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
      setDeleting(false);
    }
  };

  const label = 'mb-1.5 block text-small font-semibold text-ink';
  const control =
    'w-full rounded-control border border-ink/16 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';
  const errText = 'mt-1.5 text-small text-state-danger-fg';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface-page">
        <Loader2 className="h-7 w-7 animate-spin text-ink-muted" aria-hidden="true" />
        <span className="sr-only">{tc('loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page pb-16">
      <div className="mx-auto max-w-[820px] px-4 py-6 md:py-8">
        <h1 className="text-h1 text-ink">{t('titleEdit')}</h1>
        <p className="mt-1.5 text-body text-ink-muted">{t('leadEdit')}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-3">
          {/* ---------- Ảnh ---------- */}
          <section aria-labelledby="sec-photo" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-photo" className="text-h3 text-ink">
              {t('photos')} <span className="text-price">*</span>
            </h2>
            <p className="mt-1 text-small text-ink-muted">{t('photosHint')}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={`${url}-${i}`} className="relative h-24 w-24 shrink-0">
                  <img
                    src={url}
                    alt={i === 0 ? t('cover') : `${t('photos')} ${i + 1}`}
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
              multiple
              onChange={handleUpload}
              className="hidden"
              tabIndex={-1}
            />
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
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Tình trạng ---------- */}
          <section aria-labelledby="sec-cond" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-cond" className="text-h3 text-ink">
              {t('conditionTitle')} <span className="text-price">*</span>
            </h2>
            <p className="mt-1 text-small text-ink-muted">{t('conditionHint')}</p>
            <div className="mt-4">
              <ConditionPicker value={condition} onChange={setCondition} />
            </div>
          </section>

          {/* ---------- Giá & còn mấy cái ---------- */}
          <section aria-labelledby="sec-price" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-price" className="mb-4 text-h3 text-ink">
              {t('priceAndShipping')}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="field-price" className={label}>
                  {t('price')} <span className="text-price">*</span>
                </label>
                <div
                  className={`flex items-center overflow-hidden rounded-control border bg-surface-card transition-colors focus-within:ring-2 focus-within:ring-brand/20 ${
                    fieldErrors.price
                      ? 'border-state-danger-fg'
                      : 'border-ink/16 focus-within:border-brand'
                  }`}
                >
                  <input
                    id="field-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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

              <div>
                <label htmlFor="field-stock" className={label}>
                  {t('stock')}
                </label>
                <input
                  id="field-stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={99}
                  value={stock}
                  onChange={(e) => setStock(Math.max(0, Number(e.target.value) || 0))}
                  className={control}
                />
                <p className="mt-1.5 text-caption font-normal text-ink-muted">
                  {t('stockZeroHint')}
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Mô tả ---------- */}
          <section aria-labelledby="sec-desc" className="rounded-card bg-surface-card p-5">
            <h2 id="sec-desc" className="text-h3 text-ink">
              {t('describe')}
            </h2>
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
          </section>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-control bg-brand px-6 py-3 text-body font-semibold text-white transition-colors hover:bg-brand-dark disabled:bg-ink-faint"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? t('submitEditing') : t('submitEdit')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/product/${productId}`)}
              className="rounded-control px-4 py-3 text-body text-ink-muted transition-colors hover:text-ink"
            >
              {tc('cancel')}
            </button>
          </div>
        </form>

        {/* ---------- Xoá tin ----------------------------------------------------
            Xác nhận NGAY TRÊN TRANG thay vì window.confirm: hộp thoại của trình
            duyệt chặn mọi tương tác khác, không đọc được tên món trong ngữ cảnh,
            và không tạo kiểu được. Ở đây nói rõ xoá cái gì trước khi bấm. */}
        <section
          aria-labelledby="sec-danger"
          className="mt-8 rounded-card border border-state-danger-fg/25 bg-surface-card p-5"
        >
          <h2 id="sec-danger" className="text-h3 text-ink">
            {t('deleteTitle')}
          </h2>
          <p className="mt-1 text-small text-ink-muted">
            {t('deleteLead')}
          </p>

          {confirmDelete ? (
            <div className="mt-4">
              <p className="text-small text-ink">
                {t.rich('deleteAsk', {
                name: () => <span className="font-semibold">{name || t('thisListing')}</span>,
              })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-control bg-state-danger-fg px-4 py-2.5 text-small font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {deleting ? t('deleting') : t('deleteConfirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-control border border-ink/16 px-4 py-2.5 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken"
                >
                  {t('deleteKeep')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-control border border-state-danger-fg/40 px-4 py-2.5 text-small font-semibold text-state-danger-fg transition-colors hover:bg-state-danger-bg"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('deleteButton')}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
