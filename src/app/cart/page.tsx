"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Trash2, MapPin } from 'lucide-react';
import { cartService } from '@/services/cart.service';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { refreshCartCount } = useCart();
  const { confirm } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await cartService.getAll();
      setCartItems(res.data.data.result?.map((item: any) => ({
        id: item.id,
        name: item.product?.name || 'Sản phẩm',
        price: Number(item.product?.price || 0),
        quantity: item.quantity,
        stock: item.product?.stock || 0,
        image: item.product?.image || '/images/default-product.png',
        selected: true,
        product_id: item.product?.id,
      })) || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCartItems(cartItems.map(item => ({ ...item, selected: e.target.checked })));
  };

  const toggleItem = (id: number) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const updateQuantity = async (id: number, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
    try {
      await cartService.update(id, newQty);
      setCartItems(cartItems.map(i => i.id === id ? { ...i, quantity: newQty } : i));
      refreshCartCount();
    } catch (err) { console.error(err); }
  };

  const removeItem = async (id: number) => {
    const ok = await confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?');
    if (!ok) return;
    try {
      await cartService.remove(id);
      setCartItems(cartItems.filter(item => item.id !== id));
      refreshCartCount();
    } catch (err) { console.error(err); }
  };

  const selectedItems = cartItems.filter(i => i.selected);
  const grandTotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const allSelected = cartItems.length > 0 && cartItems.every(i => i.selected);

  if (loading) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><p className="text-gray-600">Đang tải...</p></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
        <div className="max-w-[1200px] mx-auto px-4 pt-4">
          <div className="bg-white rounded-sm shadow-sm p-10 text-center mt-6">
            <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Giỏ hàng của bạn còn trống</p>
            <Link href="/" className="inline-block px-6 py-2 bg-brand text-white rounded-sm hover:bg-brand-dark transition-colors">
              Mua ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <span>&gt;</span>
          <span className="text-gray-800">Giỏ hàng</span>
        </div>

        <h1 className="text-2xl font-medium text-gray-800 mb-6">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm text-gray-600 font-medium items-center">
                <div className="col-span-1 flex justify-center">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand" />
                </div>
                <div className="col-span-5">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-1 flex justify-center">
                    <input type="checkbox" checked={item.selected} onChange={() => toggleItem(item.id)} className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand" />
                  </div>
                  <div className="col-span-5 flex gap-3">
                    <div className="w-20 h-20 border rounded-sm overflow-hidden flex-shrink-0 bg-gray-100">
                       <img loading="lazy" decoding="async" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <Link href={`/product/${item.product_id}`} className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-brand">
                        {item.name}
                      </Link>
                      <span className="text-xs text-gray-600 mt-1">Còn {item.stock} sản phẩm</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm font-medium text-gray-600">
                    {item.price.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="col-span-2 flex justify-center items-center">
                    <div className="flex items-center border border-gray-300 rounded-sm">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 focus:outline-none">
                        <Minus className="w-3 h-3" />
                      </button>
                      <input type="text" value={item.quantity} readOnly className="w-10 h-8 text-center text-sm border-l border-r border-gray-300 focus:outline-none text-gray-800" />
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 focus:outline-none">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center items-center gap-3">
                    <span className="text-sm font-bold text-brand">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-sm shadow-sm p-6 sticky top-4">
              <h3 className="text-base font-medium text-gray-800 mb-4 pb-4 border-b">Tóm tắt đơn hàng</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{grandTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center mb-6 pt-4 border-t">
                <span className="text-base font-medium text-gray-800">Tổng cộng</span>
                <span className="text-xl font-bold text-brand">{grandTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <Link
                href={selectedItems.length > 0 ? `/checkout?ids=${selectedItems.map(i => i.id).join(',')}` : "#"}
                className={`block text-center w-full py-3 text-white font-bold rounded-sm transition-transform active:scale-[0.98] shadow-md ${selectedItems.length > 0 ? 'bg-brand hover:bg-brand-dark' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                MUA HÀNG ({selectedItems.length})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
