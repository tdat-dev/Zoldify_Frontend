"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await categoryService.remove(id);
      setCategories(categories.filter(c => c.id !== id));
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Xóa thất bại', 'error');
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
      toast(err.response?.data?.message || 'Thao tác thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <p className="text-gray-600 text-sm mt-1">Tổng cộng {categories.length} danh mục</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add/Edit */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="VD: Điện tử"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon danh mục</label>
                {editingCategory?.image && (
                  <div className="mb-2 flex items-center gap-2">
                    <img loading="lazy" decoding="async" src={editingCategory.image} alt="icon" className="w-10 h-10 object-contain rounded border" />
                    <span className="text-xs text-gray-600">Ảnh hiện tại</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {editingCategory ? 'Để trống nếu không muốn thay đổi' : 'Hỗ trợ: JPG, PNG, GIF, SVG'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>

                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Icon</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Tên danh mục</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Số SP</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className={`hover:bg-gray-50 transition ${editingCategory?.id === cat.id ? 'bg-blue-50' : ''}`}>
                      <td className="py-4 px-6">
                        {cat.image ? (
                          <img loading="lazy" decoding="async" src={cat.image} alt={cat.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                            <Box className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-800">{cat.name}</div>
                        <div className="text-xs text-gray-600">ID: #{cat.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {cat.product_count || 0} sản phẩm
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Sửa">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-600">
                        <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p>Chưa có danh mục nào</p>
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