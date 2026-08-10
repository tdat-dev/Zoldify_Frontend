'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Package, Plus, Pencil, Eye, Trash2, Minus } from 'lucide-react';
import { productService } from '@/services/product.service';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/Toast';
import { formatPrice } from '@/lib/format';
import { productStatusTone, isProductStatus } from '@/lib/product-status';
import { TONE_CLASS } from '@/lib/status-tone';
import { EmptyState } from '@/components/EmptyState';

/**
 * Tin đã đăng của người bán.
 *
 * Sáu thứ của bản trước đã gỡ:
 *
 * 1. KHÔNG HIỆN TRẠNG THÁI TIN. Backend có 5 trạng thái (draft, pending,
 *    active, sold, rejected). Người bán có tin bị TỪ CHỐI DUYỆT hoặc còn đang
 *    chờ duyệt không thấy gì khác biệt — họ tưởng tin đang được rao. Đây là
 *    thông tin quan trọng nhất trên màn hình này.
 *
 * 2. ẢNH DỰ PHÒNG TRỎ VÀO FILE KHÔNG TỒN TẠI. `/images/default-product.png`
 *    không có trong public/images, nên mọi tin không ảnh hiện icon ảnh vỡ.
 *
 * 3. window.confirm() cho việc xoá, trong khi cả app dùng confirm của useToast.
 *
 * 4. LỖI TẢI HIỆN THÀNH "BẠN CHƯA CÓ SẢN PHẨM NÀO".
 *
 * 5. PHÂN TRANG VẼ HẾT MỌI SỐ TRANG. 50 trang là 50 nút.
 *
 * 6. Giá nhân tay `toLocaleString('vi-VN')}đ`.
 */
export default function MyProductsPage() {
  const { user } = useAuth();
  const { allowed } = useRequireAuth();
  const { toast, confirm } = useToast();
  const t = useTranslations('myProducts');
  const tStatus = useTranslations('productStatus');
  const tc = useTranslations('common');

  const [products, setProducts] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });

  const fetchProducts = useCallback(
    async (page = 1) => {
      if (!user) return;
      setState('loading');
      try {
        const res = await productService.getBySeller(user.id, page, 20);
        const data = res.data?.data || res.data;
        setProducts(data?.result || []);
        setMeta(data?.meta || { current: 1, pageSize: 20, total: 0, pages: 0 });
        setState('ready');
      } catch {
        setState('error');
      }
    },
    [user],
  );

  useEffect(() => {
    if (allowed && user) fetchProducts(1);
  }, [allowed, user, fetchProducts]);

  const handleDelete = async (id: number, name: string) => {
    if (!(await confirm(t('deleteAsk', { name })))) return;
    try {
      await productService.remove(id);
      toast(t('deleted'), 'success');
      fetchProducts(meta.current);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast(Array.isArray(msg) ? msg[0] : msg || t('deleteFailed'), 'error');
    }
  };

  const updateLocalStock = (id: number, newStock: number) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));

  const card = 'rounded-card bg-surface-card';
  const newButton =
    'inline-flex items-center gap-2 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark';

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-6 py-5">
        <div>
          <h1 className="text-h2 text-ink">{t('title')}</h1>
          {state === 'ready' && (
            <p className="mt-1 text-small tabular-nums text-ink-muted">
              {t('count', { count: meta.total })}
            </p>
          )}
        </div>
        <Link href="/product/create" className={newButton}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('new')}
        </Link>
      </div>

      {state === 'loading' ? (
        <p className="px-6 py-16 text-center text-body text-ink-muted">{tc('loading')}</p>
      ) : state === 'error' ? (
        <div className="px-6 py-16 text-center">
          <p className="text-body font-semibold text-ink">{t('loadFailed')}</p>
          <button
            type="button"
            onClick={() => fetchProducts(meta.current)}
            className="mt-5 rounded-control bg-brand px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {tc('retry')}
          </button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title={t('empty')}
          hint={t('emptyHint')}
          action={
            <Link href="/product/create" className={newButton}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('new')}
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <caption className="sr-only">{t('title')}</caption>
              <thead>
                <tr className="border-b border-ink/10">
                  <th scope="col" className="px-6 py-3 text-left text-caption uppercase tracking-wide text-ink-faint">
                    {t('colItem')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-caption uppercase tracking-wide text-ink-faint">
                    {t('colCategory')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-caption uppercase tracking-wide text-ink-faint">
                    {t('colPrice')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-caption uppercase tracking-wide text-ink-faint">
                    {t('colStock')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-caption uppercase tracking-wide text-ink-faint">
                    {t('colStatus')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-caption uppercase tracking-wide text-ink-faint">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {/* Không có ảnh thì vẽ icon, KHÔNG trỏ vào một file dự
                            phòng không tồn tại — icon ảnh vỡ trông như tin hỏng. */}
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-control bg-surface-sunken">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-ink-faint" aria-hidden="true" />
                          )}
                        </span>
                        <Link
                          href={`/product/${product.id}`}
                          className="clamp-2 max-w-[26ch] text-small text-ink hover:text-brand"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-small text-ink-muted">
                      {product.category?.name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-small font-bold tabular-nums text-price">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <StockStepper
                        productId={product.id}
                        initialStock={Number(product.stock || 0)}
                        onLocalChange={(s) => updateLocalStock(product.id, s)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block whitespace-nowrap rounded-control px-2 py-0.5 text-caption font-semibold ${
                          TONE_CLASS[productStatusTone(product.status)]
                        }`}
                      >
                        {isProductStatus(product.status)
                          ? tStatus(product.status)
                          : String(product.status ?? '—')}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/product/${product.id}`}
                          aria-label={`${t('view')} — ${product.name}`}
                          className="rounded-control p-2 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                          href={`/product/${product.id}/edit`}
                          aria-label={`${t('edit')} — ${product.name}`}
                          className="rounded-control p-2 text-brand transition-colors hover:bg-brand-tint"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          aria-label={`${t('delete')} — ${product.name}`}
                          className="rounded-control p-2 text-ink-muted transition-colors hover:bg-price-bg hover:text-price"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trước / sau + vị trí hiện tại, thay cho một nút mỗi trang: người
              bán có 50 trang thì bản cũ vẽ ra 50 nút. */}
          {meta.pages > 1 && (
            <div className="flex items-center justify-center gap-4 border-t border-ink/10 px-6 py-4">
              <button
                type="button"
                onClick={() => fetchProducts(meta.current - 1)}
                disabled={meta.current <= 1}
                className="rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-faint"
              >
                {t('pagePrev')}
              </button>
              <span className="text-small tabular-nums text-ink-muted">
                {t('pageOf', { current: meta.current, total: meta.pages })}
              </span>
              <button
                type="button"
                onClick={() => fetchProducts(meta.current + 1)}
                disabled={meta.current >= meta.pages}
                className="rounded-control border border-ink/16 px-4 py-2 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-faint"
              >
                {t('pageNext')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Chỉnh số lượng ngay tại dòng. Cập nhật lạc quan rồi trả về giá trị cũ nếu
 * server từ chối — đồ cũ hay chỉ có một cái nên thao tác này thường là 1 → 0.
 */
function StockStepper({
  productId,
  initialStock,
  onLocalChange,
}: {
  productId: number;
  initialStock: number;
  onLocalChange: (newStock: number) => void;
}) {
  const { toast } = useToast();
  const t = useTranslations('myProducts');
  const [stock, setStock] = useState(initialStock);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  const update = async (newStock: number) => {
    if (newStock < 0 || saving) return;
    const prev = stock;
    setStock(newStock);
    onLocalChange(newStock);
    setSaving(true);
    try {
      await productService.updateStock(productId, newStock);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setStock(prev);
      onLocalChange(prev);
      toast(Array.isArray(msg) ? msg[0] : msg || t('stockFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const btn =
    'flex h-7 w-7 items-center justify-center rounded-control border border-ink/16 text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-faint';

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => update(stock - 1)}
        disabled={stock <= 0 || saving}
        aria-label="Giảm một"
        className={btn}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span className="w-8 text-center text-small font-semibold tabular-nums text-ink">{stock}</span>
      <button
        type="button"
        onClick={() => update(stock + 1)}
        disabled={saving}
        aria-label="Tăng một"
        className={btn}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
