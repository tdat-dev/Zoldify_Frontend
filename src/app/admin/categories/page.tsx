"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, Save, FolderOpen, Image as ImageIcon, Box, Loader2 } from 'lucide-react';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/components/Toast';
import BackButton from '@/components/BackButton';

type Category = {
  id: number;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  product_count: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast, confirm } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data.result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setIconFile(null);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIconFile(null);
  };

  const handleDelete = async (id: number) => {
    // confirm cua useToast, khong phai window.confirm: hop thoai native chan
    // toan bo su kien trinh duyet va khong theo duoc giao dien cua app.
    if (!(await confirm(t('catDeleteAsk')))) return;
    try {
      await categoryService.remove(id);
      setCategories(categories.filter(c => c.id !== id));
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));
    } catch (err: any) {
      toast(err.response?.data?.message || t('catDeleteFailed'), 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = editingCategory?.image || '';
      if (iconFile) {
        const uploadRes = await uploadService.upload(iconFile, 'categories');
        imageUrl = uploadRes.data?.data?.url || uploadRes.data?.url || '';
      }
      const payload: any = { name, description, image: imageUrl };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
      } else {
        await categoryService.create(payload);
      }

      await loadCategories();
      handleCancel();
    } catch (err: any) {
      toast(err.response?.data?.message || t('catSaveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-ink-muted" />
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('catTitle')}</h1>
          <p className="text-ink-muted text-small mt-1">{t('catCount', { count: categories.length })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add/Edit */}
        <div className="lg:col-span-1">
          <div className="bg-surface-card rounded-card border p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">
              {editingCategory ? t('catEdit') : t('catAdd')}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-small font-medium text-ink mb-2">{t('catName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-ink/16 rounded-control focus:ring-2 focus:ring-brand/40 focus:border-transparent outline-none"
                  placeholder={t('catNamePlaceholder')}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-small font-medium text-ink mb-2">{t('catIcon')}</label>
                {editingCategory?.image && (
                  <div className="mb-2 flex items-center gap-2">
                    <img loading="lazy" decoding="async" src={editingCategory.image} alt="icon" className="w-10 h-10 object-contain rounded border" />
                    <span className="text-caption text-ink-muted">{t('catCurrentImage')}</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-ink/16 rounded-control text-small outline-none"
                />
                <p className="text-caption text-ink-muted mt-1">
                  {editingCategory ? t('catKeepImage') : t('catFormats')}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-small font-medium text-ink mb-2">{t('catDesc')}</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-ink/16 rounded-control outline-none"
                  placeholder={t('catDescPlaceholder')}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-brand text-white rounded-control hover:bg-brand-dark transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingCategory ? t('catUpdate') : t('catCreate')}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-surface-sunken text-ink rounded-control hover:bg-ink/10 transition"
                  >
                    {tc('cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-surface-card rounded-card border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-page border-b">
                  <tr>
                    <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colIcon')}</th>
                    <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colCatName')}</th>
                    <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colCatCount')}</th>
                    <th className="text-center py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {categories.map((cat) => (
                    <tr key={cat.id} className={`hover:bg-surface-page transition ${editingCategory?.id === cat.id ? 'bg-brand-tint' : ''}`}>
                      <td className="py-4 px-6">
                        {cat.image ? (
                          <img loading="lazy" decoding="async" src={cat.image} alt={cat.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <div className="w-10 h-10 bg-surface-sunken rounded-control flex items-center justify-center text-ink-muted">
                            <Box className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-ink">{cat.name}</div>
                        <div className="text-caption text-ink-muted">ID: #{cat.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-full text-caption font-medium bg-surface-sunken text-ink">
                          {t('catItems', { count: cat.product_count || 0 })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(cat)} className="p-2 text-brand hover:bg-state-progress-bg rounded-control transition" title={t('edit')}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="p-2 text-state-danger-fg hover:bg-state-danger-bg rounded-control transition" title={t('del')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-ink-muted">
                        <FolderOpen className="w-10 h-10 text-ink-faint mx-auto mb-3" />
                        <p>{t('catEmpty')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}