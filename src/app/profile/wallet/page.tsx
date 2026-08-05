"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Package, Wallet, Clock, ArrowDown, ArrowUp, Loader, Plus, CreditCard, ShoppingBag } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { payosService } from '@/services/payos.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.allSettled([
        paymentService.getBalance(),
        paymentService.getAll(1, 20),
      ]);
      if (balanceRes.status === 'fulfilled') setBalance(balanceRes.value.data?.balance || 0);
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data?.data?.result || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTopup = async () => {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 10000) { toast('Số tiền nạp tối thiểu 10,000đ', 'error'); return; }
    setSubmitting(true);
    try {
      // Tạo payment link PayOS → redirect
      const res = await payosService.createLink({ type: 'topup', amount });
      const checkoutUrl = res.data?.data?.checkoutUrl;
      if (!checkoutUrl) {
        toast('Không lấy được link thanh toán', 'error');
        setSubmitting(false);
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err: any) {
      toast(err.response?.data?.message || 'Tạo link nạp ví thất bại', 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="bg-gray-50 min-h-screen flex items-center justify-center"><Loader className="w-6 h-6 animate-spin text-gray-600" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between overflow-x-auto">
           <div className="flex gap-4">
             <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
               <User className="w-4 h-4" /> Thông tin cá nhân
             </Link>
             <Link href="/profile/orders" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
               <Package className="w-4 h-4" /> Đơn hàng
             </Link>
             <Link href="/profile/wallet" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md whitespace-nowrap">
                <Wallet className="w-4 h-4" /> Ví & Thanh toán
              </Link>
              <Link href="/profile/products" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md whitespace-nowrap">
                <ShoppingBag className="w-4 h-4" /> Sản phẩm của tôi
              </Link>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                <div>
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wider">Số dư khả dụng</p>
                  <h3 className="text-4xl font-extrabold mt-2 tracking-tight text-white">
                    {balance.toLocaleString('vi-VN')} <span className="text-lg font-normal text-white/70">VNĐ</span>
                  </h3>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowTopup(!showTopup)} className="w-full bg-transparent hover:bg-white/5 border border-white/20 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" /> Nạp tiền
                  </button>
                </div>
              </div>
            </div>

            {showTopup && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Nạp tiền vào ví</h4>
                <input
                  type="number"
                  placeholder="Số tiền (tối thiểu 10,000đ)"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Thanh toán qua PayOS: ATM, Visa, Master, JCB hoặc QR</span>
                </div>
                <button
                  onClick={handleTopup}
                  disabled={submitting}
                  className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Đang tạo link...</> : 'Nạp tiền ngay'}
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Lịch sử giao dịch</h3>
              </div>
              <div className="p-0">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                      <Clock className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Chưa có giao dịch nào.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {transactions.map((t: any) => (
                      <li key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {t.type === 'deposit' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t.type === 'deposit' ? 'Nạp tiền vào ví' : 'Thanh toán đơn hàng'}
                            </p>
                            <p className="text-xs text-gray-600">{t.created_at ? new Date(t.created_at).toLocaleString('vi-VN') : ''}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm ${t.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                          {t.type === 'deposit' ? '+' : '-'}{Number(t.amount).toLocaleString('vi-VN')}đ
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
