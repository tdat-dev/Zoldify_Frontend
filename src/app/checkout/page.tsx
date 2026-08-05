"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Truck, QrCode, Loader, CreditCard } from 'lucide-react';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { payosService } from '@/services/payos.service';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressPicker from '@/components/AddressPicker';

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshCartCount } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [addressInfo, setAddressInfo] = useState({
    receiver_name: '',
    receiver_phone: '',
    shipping_address: '',
    province: '',
    district: '',
  });

  const SHIPPING_FEE: number = 0;
  const selectedIds = (searchParams.get('ids') || '').split(',').filter(Boolean).map(Number);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await cartService.getAll();
      const items = res.data.data.result || [];
      let mapped = items.map((item: any) => ({
        id: item.id,
        name: item.product?.name || 'Sản phẩm',
        price: Number(item.product?.price || 0),
        quantity: item.quantity,
        image: item.product?.image || '/images/default-product.png',
        product_id: item.product?.id,
      }));
      if (selectedIds.length > 0) {
        mapped = mapped.filter((it: any) => selectedIds.includes(it.id));
      }
      setCartItems(mapped);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const grandTotal = subtotal + SHIPPING_FEE;

  const handleOrder = async () => {
    if (!addressInfo.receiver_name || !addressInfo.receiver_phone || !addressInfo.shipping_address) {
      toast('Vui lòng nhập đầy đủ thông tin giao hàng', 'error');
      return;
    }
    if (cartItems.length === 0) {
      toast('Chưa có sản phẩm nào được chọn', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Bước 1: Tạo order trước (PENDING)
      const orderRes = await orderService.create({
        receiver_name: addressInfo.receiver_name,
        receiver_phone: addressInfo.receiver_phone,
        shipping_address: addressInfo.shipping_address,
        province: addressInfo.province,
        district: addressInfo.district,
        note,
        payment_method: paymentMethod,
        cart_item_ids: cartItems.map((it) => it.id),
      });
      const order = orderRes.data?.data || orderRes.data;
      const orderId = order?.id;

      // Bước 2: Nếu là PayOS → tạo link thanh toán và redirect
      if (paymentMethod === 'payos') {
        if (!orderId) {
          toast('Không lấy được mã đơn hàng', 'error');
          setSubmitting(false);
          return;
        }
        const payosRes = await payosService.createLink({ type: 'order', order_id: orderId });
        const checkoutUrl = payosRes.data?.data?.checkoutUrl;
        if (!checkoutUrl) {
          toast('Không lấy được link thanh toán PayOS', 'error');
          setSubmitting(false);
          return;
        }
        refreshCartCount();
        // Redirect sang PayOS
        window.location.href = checkoutUrl;
        return;
      }

      // COD / Wallet → success page
      refreshCartCount();
      router.push('/cart/success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đặt hàng thất bại';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><p className="text-gray-600">Đang tải...</p></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <span>&gt;</span>
          <Link href="/cart" className="hover:text-brand">Giỏ hàng</Link>
          <span>&gt;</span>
          <span className="text-gray-800">Thanh toán</span>
        </div>

        <h1 className="text-2xl font-medium text-gray-800 mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {/* Shipping Info */}
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h3 className="text-base font-medium text-brand flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" /> Thông tin giao hàng
              </h3>
              <AddressPicker onSelect={setAddressInfo} />
            </div>

            {/* Note */}
            <div className="bg-white rounded-sm shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ghi chú đơn hàng</h3>
              <textarea
                placeholder="Ghi chú cho người bán (không bắt buộc)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                rows={2}
              />
            </div>

            {/* Products */}
            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 text-sm font-medium text-gray-600">
                Sản phẩm ({cartItems.length})
              </div>
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border-b last:border-0 items-center">
                  <div className="w-16 h-16 border rounded-sm overflow-hidden flex-shrink-0 bg-gray-100">
                    <img loading="lazy" decoding="async" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')}đ</span>
                    <div className="text-sm text-gray-600">x {item.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-brand w-32 text-right">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-sm shadow-sm p-6 sticky top-4">
              <h3 className="text-base font-medium text-gray-800 mb-4 pb-4 border-b">Chi tiết thanh toán</h3>

              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Phí vận chuyển</span>
                {SHIPPING_FEE === 0 ? (
                  <span className="font-medium text-green-700">Miễn phí</span>
                ) : (
                  <span className="font-medium">{SHIPPING_FEE.toLocaleString('vi-VN')}đ</span>
                )}
              </div>
              <div className="flex justify-between items-center mb-6 pt-4 border-t">
                <span className="text-base font-medium text-gray-800">Tổng thanh toán</span>
                <span className="text-xl font-bold text-brand">{grandTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</h4>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand bg-[#EFF6FF]' : 'hover:border-brand'}`}>
                  <input type="radio" name="payment_method" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-brand focus:ring-brand w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <Truck className="w-5 h-5 text-gray-600" />
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-brand bg-[#EFF6FF]' : 'hover:border-brand'}`}>
                  <input type="radio" name="payment_method" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="text-brand focus:ring-brand w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Ví Zoldify</span>
                  </div>
                  <QrCode className="w-5 h-5 text-gray-600" />
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'payos' ? 'border-brand bg-[#EFF6FF]' : 'hover:border-brand'}`}>
                  <input type="radio" name="payment_method" value="payos" checked={paymentMethod === 'payos'} onChange={() => setPaymentMethod('payos')} className="text-brand focus:ring-brand w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Thẻ ATM / Visa / Master / JCB</span>
                    <p className="text-xs text-gray-600 mt-0.5">Quét QR hoặc nhập thẻ qua PayOS</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </label>
              </div>

              <button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full mt-6 py-3 bg-brand text-white font-bold rounded-sm hover:bg-brand-dark transition-transform active:scale-[0.98] shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader className="w-4 h-4 animate-spin" /> ĐANG XỬ LÝ...</> : 'ĐẶT HÀNG'}
              </button>

              <div className="mt-4 text-center">
                <Link href="/cart" className="text-sm text-gray-600 hover:text-brand">Quay lại giỏ hàng</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
