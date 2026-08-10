"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, UserPlus, UserCheck, Star, Store, Check, Plus, MessageCircle, UserMinus, Loader2, Edit, Trash2 } from 'lucide-react';
import http from '@/lib/http';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { followService } from '@/services/follow.service';
import { chatService } from '@/services/chat.service';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/lib/format';
import StockControl from '@/components/StockControl';

interface ShopInfo {
  id: number;
  name: string;
  logo: string;
  description: string;
  slug: string;
  productCount: number;
  followerCount: number;
  rating?: number;
  user?: { id: number; full_name: string; avatar: string };
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  is_freeship: boolean;
}

export default function ShopPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetSellerId = searchParams.get('seller');
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        let shopData: any = null;
        let sellerId: number | null = null;

        if (targetSellerId) {
          // Xem shop của seller khác
          sellerId = Number(targetSellerId);
          try {
            const shopRes = await http.get(`/shop/${sellerId}`);
            shopData = shopRes.data?.data;
          } catch (err: any) {
            if (err?.response?.status === 404) {
              // User chưa tạo shop — vẫn hiện thông tin user + sản phẩm
              shopData = {
                id: sellerId,
                name: `Shop của ${sellerId}`,
                productCount: 0,
                followerCount: 0,
                user: { id: sellerId, full_name: `User #${sellerId}`, avatar: '' },
              };
            } else { throw err; }
          }
        } else {
          // Shop của tôi
          const shopRes = await http.get('/shop/me');
          shopData = shopRes.data?.data;
        }
        setShop(shopData);

        if (sellerId) {
          const prodRes = await http.get(`/shop/${sellerId}/products`);
          setProducts(prodRes.data?.data?.result || []);
        } else if (shopData?.id) {
          const sid = shopData.user?.id || shopData.id;
          const prodRes = await http.get(`/shop/${sid}/products`);
          setProducts(prodRes.data?.data?.result || []);
        }

        // Load follow status
        const sid = sellerId || shopData?.user?.id;
        if (sid) {
          try {
            const countRes = await followService.count(sid);
            setFollowerCount(countRes.data?.data?.follower || 0);
          } catch {}
        }
      } catch (err: any) {
        if (!targetSellerId && err?.response?.status === 404) {
          setError('Bạn chưa có shop. Hãy tạo shop để bắt đầu bán hàng.');
        } else {
          setError('Không thể tải thông tin shop.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function checkFollow() {
      const sid = Number(targetSellerId) || shop?.user?.id;
      if (!sid || !isAuthenticated) return;
      if (currentUser?.id === sid) return;
      try {
        const res = await followService.check(sid);
        setIsFollowing(!!res.data?.data?.followed);
      } catch {}
    }
    checkFollow();
  }, [targetSellerId, isAuthenticated, currentUser?.id, shop?.user?.id]);

  const handleToggleFollow = async () => {
    const sid = Number(targetSellerId) || shop?.user?.id;
    if (!sid) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (currentUser?.id === sid) {
      toast('Bạn không thể theo dõi chính mình', 'error');
      return;
    }
    setToggling(true);
    try {
      const res = await followService.toggle(sid);
      const followed = res.data?.data?.followed;
      setIsFollowing(!!followed);
      setFollowerCount((c) => c + (followed ? 1 : -1));
      toast(followed ? 'Đã theo dõi shop' : 'Đã hủy theo dõi', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Thao tác thất bại', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleChatShop = async () => {
    const sid = Number(targetSellerId) || shop?.user?.id;
    if (!sid) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      const res = await chatService.createConversation(sid, products[0]?.id || 0);
      const conv = res.data?.data;
      router.push(conv?.id ? `/chat?conversation=${conv.id}` : '/chat');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Không thể mở chat', 'error');
    }
  };

  const shopOwnerId = Number(targetSellerId) || shop?.user?.id;
  const isOwner = isAuthenticated && currentUser?.id === shopOwnerId;

  const updateLocalStock = (id: number, newStock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  const handleDeleteFromShop = async (id: number, name: string) => {
    if (!(await confirm(`Xoá tin “${name}”? Không lấy lại được.`))) return;
    try {
      await productService.remove(id);
      toast('Đã xóa sản phẩm', 'success');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi xóa sản phẩm';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-page min-h-screen flex items-center justify-center">
        <div className="text-ink-muted">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-ink-faint mx-auto mb-4" />
          <p className="text-ink-muted mb-4">{error}</p>
          <Link href="/product/create" className="px-6 py-2 bg-brand text-white rounded-sm hover:bg-brand-dark">
            Đăng bán ngay
          </Link>
        </div>
      </div>
    );
  }

  const shopName = shop?.name || shop?.user?.full_name || 'Shop của tôi';
  const shopLogo = shop?.logo || shop?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(shopName)}&background=2C67C8&color=fff`;

  return (
    <div className="bg-surface-page min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-6">

        {/* Shop Header */}
        <div className="bg-surface-card p-6 rounded-sm mb-6 flex items-center gap-6">
          <div className="relative">
            <img loading="lazy" decoding="async" src={shopLogo} alt={shopName} className="w-20 h-20 rounded-full border-2 border-ink/10 object-cover" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
              {shopName}
            </h1>
            <div className="flex gap-6 mt-2 text-small text-ink-muted">
              <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {shop?.productCount || products.length} Sản phẩm</span>
              <span className="flex items-center gap-1"><UserPlus className="w-4 h-4" /> {followerCount} Người theo dõi</span>
              {shop?.rating != null && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" /> Đánh giá: {shop.rating}/5.0
                </span>
              )}
            </div>
            {shop?.description && (
              <p className="text-small text-ink-muted mt-2">{shop.description}</p>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {targetSellerId && isAuthenticated && currentUser?.id !== Number(targetSellerId) && (
              <>
                <button
                  onClick={handleToggleFollow}
                  disabled={toggling}
                  className={`px-5 py-2 font-medium rounded-sm transition-colors flex items-center gap-2 disabled:opacity-70 ${
                    isFollowing
                      ? 'bg-surface-sunken text-ink border border-ink/16 hover:bg-gray-200'
                      : 'bg-brand text-white hover:bg-brand-dark'
                  }`}
                >
                  {isFollowing ? (
                    <><UserCheck className="w-4 h-4" /> Đang theo dõi</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Theo dõi</>
                  )}
                </button>
                <button
                  onClick={handleChatShop}
                  className="px-5 py-2 bg-surface-card border border-brand text-brand font-medium rounded-sm hover:bg-brand hover:text-white transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
              </>
            )}
            {(!targetSellerId || (isAuthenticated && currentUser?.id === Number(targetSellerId))) && (
              <Link href="/product/create" className="px-6 py-2 bg-brand text-white font-medium rounded-sm hover:bg-brand-dark transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm sản phẩm
              </Link>
            )}
          </div>
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="bg-surface-card p-12 rounded-sm text-center">
            <Package className="w-16 h-16 text-ink-faint mx-auto mb-4" />
            <p className="text-ink-muted mb-4">Chưa có sản phẩm nào</p>
            {(!targetSellerId || (isAuthenticated && currentUser?.id === Number(targetSellerId))) && (
              <Link href="/product/create" className="px-6 py-2 bg-brand text-white rounded-sm hover:bg-brand-dark">
                Đăng bán sản phẩm đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.map((item) => (
              <div key={item.id} className="group bg-surface-card border border-transparent hover:border-brand hover: transition-all duration-200 rounded-sm overflow-hidden relative">
                <Link href={`/product/${item.id}`} className="block">
                  {/* Image */}
                  <div className="relative pt-[100%] overflow-hidden bg-surface-sunken">
                    {item.image ? (
                      <img loading="lazy" decoding="async" src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-ink-faint w-12 h-12" />
                    )}
                    {!!item.is_freeship && (
                      <div className="absolute top-0 left-0 bg-[#00bfa5] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-sm z-10">
                        Freeship
                      </div>
                    )}
                    {item.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-caption font-bold uppercase tracking-wider z-10">
                        Hết hàng
                      </div>
                    )}
                    {isOwner && (
                      <div className="absolute top-1 right-1 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.preventDefault(); router.push(`/product/${item.id}/edit`); }}
                          className="w-7 h-7 bg-surface-card/90 hover:bg-blue-500 hover:text-white text-brand rounded-control flex items-center justify-center shadow"
                          title="Sửa sản phẩm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); handleDeleteFromShop(item.id, item.name); }}
                          className="w-7 h-7 bg-surface-card/90 hover:bg-red-500 hover:text-white text-red-600 rounded-control flex items-center justify-center shadow"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2 space-y-1">
                    <h3 className="text-caption text-ink font-normal line-clamp-2 leading-tight h-8 group-hover:text-brand transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-brand font-medium text-small">
                        {formatPrice(item.price)}
                      </div>
                      {isOwner ? (
                        <div onClick={(e) => e.preventDefault()}>
                          <ShopStockEditor
                            productId={item.id}
                            initialStock={item.stock || 0}
                            onLocalChange={(s) => updateLocalStock(item.id, s)}
                          />
                        </div>
                      ) : (
                        <div className="text-[10px] text-ink-muted">
                          Còn {item.stock}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function ShopStockEditor({
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
    <div className="flex items-center gap-1">
      <StockControl
        value={stock}
        onChange={update}
        min={0}
        max={99999}
        mini
        disabled={saving}
      />
      {saving && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
    </div>
  );
}
