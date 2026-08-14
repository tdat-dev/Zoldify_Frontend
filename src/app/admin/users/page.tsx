'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Edit, Mail, Lock, Unlock, CheckCircle, Clock, Loader2, Search, Trash2, X, Save, Shield } from 'lucide-react';
import http from '@/lib/http';
import { useToast } from '@/components/Toast';
import BackButton from '@/components/BackButton';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  role: 'buyer' | 'seller' | 'admin' | 'moderator';
  email_verified?: boolean;
  is_verified?: boolean;
  is_locked?: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [meta, setMeta] = useState({ current: 1, pageSize: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [lockFilter, setLockFilter] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [savingRole, setSavingRole] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmText: string;
    confirmStyle: 'danger' | 'primary';
    onConfirm: () => void;
  } | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.q = search;
      if (roleFilter) params.role = roleFilter;
      if (lockFilter) params.is_locked = lockFilter;
      const res = await http.get('/admin/users', { params });
      const data = res.data?.data || res.data;
      setUsers(data?.result || []);
      setMeta(data?.meta || { current: 1, pageSize: 20, total: 0, pages: 0 });
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || t('usrLoadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, lockFilter, toast]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleToggleLock = (user: User) => {
    if (user.role === 'admin') {
      toast(t('cannotLockAdmin'), 'error');
      return;
    }
    const willLock = !user.is_locked;
    setConfirmAction({
      title: willLock ? t('lockTitle') : t('unlockTitle'),
      message: willLock
        ? `${t('lockAsk', { name: user.full_name })} ${t('lockHint')}`
        : `${t('unlockAsk', { name: user.full_name })} ${t('unlockHint')}`,
      confirmText: willLock ? t('lockConfirm') : t('unlockConfirm'),
      confirmStyle: willLock ? 'danger' : 'primary',
      onConfirm: () => doToggleLock(user),
    });
  };

  const doToggleLock = async (user: User) => {
    setConfirmAction(null);
    setTogglingId(user.id);
    try {
      const res = await http.patch(`/admin/users/${user.id}/toggle-lock`);
      const updated = res.data?.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_locked: updated?.is_locked ?? !u.is_locked } : u))
      );
      toast(res.data?.data?.message || t('updated'), 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('updateFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (user: User) => {
    setConfirmAction({
      title: t('delUserTitle'),
      message: t('delUserAsk', { name: user.full_name }),
      confirmText: t('delUserConfirm'),
      confirmStyle: 'danger',
      onConfirm: () => doDelete(user),
    });
  };

  const doDelete = async (user: User) => {
    setConfirmAction(null);
    setDeletingId(user.id);
    try {
      await http.delete(`/admin/users/${user.id}`);
      toast(t('userDeleted'), 'success');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setMeta((m) => ({ ...m, total: m.total - 1 }));
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));
    } catch (err: any) {
      const msg = err.response?.data?.message || t('userDeleteFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditRole = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser || newRole === editingUser.role) {
      setEditingUser(null);
      return;
    }
    setSavingRole(true);
    try {
      await http.patch(`/admin/users/${editingUser.id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, role: newRole as User['role'] } : u))
      );
      toast(t('roleUpdated'), 'success');
      setEditingUser(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || t('roleUpdateFailed');
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('vi-VN');
    } catch {
      return d;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-surface-page min-h-screen">
      <BackButton />
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('usrTitle')}</h1>
          <p className="text-ink-muted text-small mt-1">
            {loading ? tc('loading') : t('usrCount', { count: meta.total })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-2xl justify-end flex-wrap">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder={t('usrSearch')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-ink/16 rounded-control text-small focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </form>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-ink/16 rounded-control text-small focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface-card"
          >
            <option value="">{t('usrAllRoles')}</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <select
            value={lockFilter}
            onChange={(e) => setLockFilter(e.target.value)}
            className="px-3 py-2 border border-ink/16 rounded-control text-small focus:outline-none focus:ring-2 focus:ring-brand/40 bg-surface-card"
          >
            <option value="">{t('usrAllStatus')}</option>
            <option value="false">{t('usrActive')}</option>
            <option value="true">{t('usrLocked')}</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-card rounded-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink-muted">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>{t('usrLoading')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-page border-b">
              <tr>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colId')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colName')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colEmail')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colRole')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colVerified')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colStatus')}</th>
                <th className="text-left py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colCreated')}</th>
                <th className="text-center py-4 px-6 text-caption font-semibold text-ink-muted uppercase">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <Users className="w-12 h-12 mx-auto text-ink-faint mb-3" />
                    <p>{t('usrEmpty')}</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-page transition">
                    <td className="py-4 px-6 text-small text-ink-muted">#{user.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {/* Chữ cái đầu trên nền phẳng màu thương hiệu. Trước là
                            gradient xanh→tím — một màu không có ở đâu khác trong
                            site, đặt cạnh nhau thành một cột tròn tím giữa bảng
                            quản trị. */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-tint font-semibold text-brand">
                          {user.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink line-clamp-1">{user.full_name}</div>
                          <div className="text-caption text-ink-muted">{user.phone_number || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-small text-ink-muted">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                        user.role === 'admin' ? 'bg-state-danger-bg text-state-danger-fg' :
                        user.role === 'seller' ? 'bg-state-progress-bg text-brand' :
                        user.role === 'moderator' ? 'bg-state-progress-bg text-state-progress-fg' :
                        'bg-surface-sunken text-ink'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-small">
                      {user.email_verified || user.is_verified ? (
                        <span className="text-state-success-fg flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {t('verified')}
                        </span>
                      ) : (
                        <span className="text-state-pending-fg flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {t('notVerified')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {user.is_locked ? (
                        <span className="px-2 py-1 rounded-full text-caption font-medium bg-state-danger-bg text-state-danger-fg flex items-center gap-1 w-max">
                          <Lock className="w-3 h-3" /> {t('usrLocked')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-caption font-medium bg-state-success-bg text-state-success-fg flex items-center gap-1 w-max">
                          <Unlock className="w-3 h-3" /> {t('usrActive')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-small text-ink-muted whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditRole(user)}
                          className="p-2 text-brand hover:bg-brand-tint rounded-control transition"
                          title={t('editRole')}
                          disabled={user.role === 'admin'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleLock(user)}
                          disabled={togglingId === user.id || user.role === 'admin'}
                          className={`p-2 rounded-control transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.is_locked
                              ? 'text-state-success-fg hover:bg-state-success-bg'
                              : 'text-state-danger-fg hover:bg-state-danger-bg'
                          }`}
                          title={user.role === 'admin' ? t('cannotLockTitle') : user.is_locked ? t('unlockConfirm') : t('lockTitle')}
                        >
                          {togglingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.is_locked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id || user.role === 'admin'}
                          className="p-2 text-state-danger-fg hover:bg-state-danger-bg rounded-control transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={user.role === 'admin' ? t('cannotDeleteTitle') : t('delUserTitle')}
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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
              onClick={() => fetchUsers(p)}
              className={`w-9 h-9 rounded-control text-small font-medium ${
                p === meta.current
                  ? 'bg-brand text-white'
                  : 'bg-surface-card text-ink-muted hover:bg-surface-sunken border'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div
            className="bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand" />
                {t('editRole')}
              </h2>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-surface-sunken rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-surface-page rounded-control">
              <p className="text-small text-ink-muted">{t('user')}</p>
              <p className="font-medium text-ink">{editingUser.full_name}</p>
              <p className="text-caption text-ink-muted">{editingUser.email}</p>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-small font-medium text-ink block">{t('newRole')}</label>
              {(['buyer', 'seller', 'moderator', 'admin'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 p-3 border rounded-control cursor-pointer transition-colors ${
                    newRole === r
                      ? 'border-brand bg-brand-tint'
                      : 'border-ink/10 hover:border-ink/16'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={newRole === r}
                    onChange={() => setNewRole(r)}
                    className="w-4 h-4 text-brand"
                  />
                  <div className="flex-1">
                    <p className="text-small font-medium text-ink capitalize">
                      {r === 'buyer'
                        ? t('roleBuyer')
                        : r === 'seller'
                          ? t('roleSeller')
                          : r === 'moderator'
                            ? t('roleModerator')
                            : t('roleAdmin')}
                    </p>
                    <p className="text-caption text-ink-muted">
                      {r === 'buyer' && t('roleBuyerHint')}
                      {r === 'seller' && t('roleSellerHint')}
                      {r === 'moderator' && t('roleModeratorHint')}
                      {r === 'admin' && t('roleAdminHint')}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2.5 border border-ink/16 text-ink rounded-control hover:bg-surface-page font-medium"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleSaveRole}
                disabled={savingRole || newRole === editingUser.role}
                className="flex-1 px-4 py-2.5 bg-brand text-white rounded-control hover:bg-brand-dark font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingRole ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {t('save')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog (in-screen) */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <div
            className="bg-surface-card rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                confirmAction.confirmStyle === 'danger' ? 'bg-state-danger-bg' : 'bg-state-progress-bg'
              }`}>
                {confirmAction.confirmStyle === 'danger' ? (
                  <Trash2 className="w-6 h-6 text-state-danger-fg" />
                ) : (
                  <Lock className="w-6 h-6 text-brand" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <h2 className="text-lg font-bold text-ink">{confirmAction.title}</h2>
                <p className="text-small text-ink-muted mt-2 whitespace-pre-line">{confirmAction.message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 border border-ink/16 text-ink rounded-control hover:bg-surface-page font-medium"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className={`flex-1 px-4 py-2.5 text-white rounded-control font-medium ${
                  confirmAction.confirmStyle === 'danger'
                    ? 'bg-price hover:bg-state-danger-fg'
                    : 'bg-brand hover:bg-brand-dark'
                }`}
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
