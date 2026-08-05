"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Truck, Globe, Flag, MessageSquare, Store, CheckCircle, Package, Loader, Star, Send } from 'lucide-react';
import { productService } from '@/services/product.service';
import { reviewService } from '@/services/review.service';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';

export default function ProductDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const { refreshCartCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<number | null>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const isOwnProduct = product && user && product.seller?.id === user.id;

  useEffect(() => {
    if (params.id) fetchData();
  }, [params.id]);

  useEffect(() => {
    if (isAuthenticated && product && !isOwnProduct) {
      checkReviewEligibility();
    }
  }, [isAuthenticated, product]);

  const fetchData = async () => {
    try {
      const [prodRes, revRes] = await Promise.allSettled([
        productService.getOne(Number(params.id)),
        reviewService.getByProduct(Number(params.id)),
      ]);
      if (prodRes.status === 'fulfilled') setProduct(prodRes.value.data?.data || prodRes.value.data);
      if (revRes.status === 'fulfilled') {
        const list = revRes.value.data?.data?.result || [];
        setReviews(list);
        if (user) {
          const mine = list.find((r: any) => r.user?.id === user.id);
          setMyReview(mine);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const checkReviewEligibility = async () => {
    try {
      const res = await orderService.getAll(1, 50, 'delivered');
      const orders = res.data?.data?.result || [];
      const eligible = orders.find((o: any) =>
        o.items?.some((it: any) => it.product?.id === product.id)
      );
      if (eligible) setEligibleOrderId(eligible.id);
    } catch (err) { console.error(err); }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setAddingCart(true);
    try {
      await cartService.add(Number(params.id), quantity);
      refreshCartCount();
      toast('Đã thêm vào giỏ hàng', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Thêm giỏ hàng thất bại', 'error');
    } finally {
      setAddingCart(false);
    }
  };


  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setAddingCart(true);
    try {
      const res = await cartService.add(Number(params.id), quantity);
      refreshCartCount();
      const newCartId = res.data?.data?.id;
      if (newCartId) {
        router.push(`/checkout?ids=${newCartId}`);
      } else {
        router.push('/cart');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Mua ngay thất bại', 'error');
    } finally {
      setAddingCart(false);
    }
  };

  const handleChatWithShop = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!product?.seller?.id) {
      toast('Không tìm thấy thông tin shop', 'error');
      return;
    }
    try {
      const res = await chatService.createConversation(product.seller.id, product.id);
      const conv = res.data?.data;
      if (conv?.id) {
        router.push(`/chat?conversation=${conv.id}`);
      } else {
        router.push('/chat');
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Không thể mở chat', 'error');
    }
  };

  // Backend chưa có endpoint báo cáo, nên gửi qua email kèm sẵn ngữ cảnh sản phẩm.
  const handleReport = () => {
    if (!product) return;
    const subject = `Báo cáo sản phẩm #${product.id}`;
    const body = [
      `Sản phẩm: ${product.name}`,
      `Mã sản phẩm: ${product.id}`,
      `Link: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      '',
      'Lý do báo cáo:',
      '',
    ].join('\n');
    window.location.href = `mailto:admin@zoldify.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('Đang mở email để gửi báo cáo', 'info');
  };

  const handleSubmitReview = async () => {
    if (!eligibleOrderId) return;
    if (!newComment.trim()) { toast('Vui lòng nhập nhận xét', 'error'); return; }
    setSubmittingReview(true);
    try {
      await reviewService.create({
        product_id: product.id,
        order_id: eligibleOrderId,
        rating: newRating,
        comment: newComment,
      });
      toast('Đánh giá thành công!', 'success');
      setNewComment('');
      setNewRating(5);
      setEligibleOrderId(null);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Đánh giá thất bại', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : '0';

  if (loading) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><Loader className="w-6 h-6 animate-spin text-gray-600" /></div>;
  }

  if (!product) {
    return <div className="bg-gray-100 min-h-screen flex items-center justify-center"><p className="text-gray-600">Không tìm thấy sản phẩm</p></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-4 space-y-6">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <span>&gt;</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </div>

        <div className="bg-white rounded-sm shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <div className="relative w-full aspect-square bg-gray-100 rounded-sm overflow-hidden border border-gray-200 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                ) : (
                  <Package className="w-20 h-20 text-gray-600" />
                )}
              </div>
            </div>

            <div className="md:col-span-7 space-y-6">
              <h1 className="text-2xl font-medium text-gray-800 leading-snug">{product.name}</h1>

              <div className="bg-gray-50 p-4 rounded-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-brand">
                    {Number(product.price).toLocaleString('vi-VN')}đ
                  </span>
                  {!!product.is_freeship && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Freeship
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="w-32 text-gray-600">Tình trạng:</span>
                  <span className="text-blue-600 font-medium">
                    {product.condition === 'new' ? 'Mới' : product.condition === 'used' ? 'Đã qua sử dụng' : product.condition === 'refurbished' ? 'Đã tân trang' : product.condition || 'Mới'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-32 text-gray-600">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 border-r border-gray-300 hover:bg-gray-50 min-w-[32px]">-</button>
                    <input type="number" value={quantity} readOnly className="w-14 text-center outline-none bg-white font-medium" />
                    <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="px-3 py-1 border-l border-gray-300 hover:bg-gray-50 min-w-[32px]">+</button>
                  </div>
                  <span className="ml-3 text-gray-600">{product.stock || 0} sản phẩm có sẵn</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {isOwnProduct ? (
                  <div className="flex-1 px-6 py-3 bg-orange-50 border border-orange-300 text-orange-800 font-medium rounded-sm flex items-center justify-center gap-2">
                    <Flag className="w-5 h-5" aria-hidden="true" />
                    Đây là sản phẩm của bạn, bạn không thể tự mua
                  </div>
                ) : (
                  <>
                    <button onClick={handleAddToCart} disabled={addingCart} className="flex-1 px-6 py-3 bg-white border border-brand text-brand font-medium rounded-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                      {addingCart ? 'Đang thêm...' : <><Package className="w-5 h-5" aria-hidden="true" /> Thêm vào giỏ hàng</>}
                    </button>
                    <button onClick={handleBuyNow} className="flex-1 px-8 py-3 bg-brand text-white font-medium rounded-sm hover:bg-brand-dark transition-colors shadow-sm text-center">
                      Mua ngay
                    </button>
                  </>
                )}
              </div>

              <div className="border-t pt-6 mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand flex-shrink-0" aria-hidden="true" />
                  <span>Sàn mua bán đồ cũ dành cho sinh viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand flex-shrink-0" aria-hidden="true" />
                  <span>Trao đổi trực tiếp với người bán trước khi mua</span>
                </div>
                <div className="col-span-2 pt-2 flex items-center gap-4 flex-wrap">
                  {!isOwnProduct && (
                    <button onClick={handleChatWithShop} className="flex items-center gap-2 py-1 hover:text-brand transition-colors">
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>Chat với shop</span>
                    </button>
                  )}
                  <button onClick={handleReport} className="flex items-center gap-2 py-1 hover:text-red-600 transition-colors">
                    <Flag className="w-4 h-4" aria-hidden="true" />
                    <span>Báo cáo sản phẩm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller info - đặt giữa phần SP và mô tả */}
        {!isOwnProduct && product.seller && (
          <Link
            href={`/shop?seller=${product.seller.id}`}
            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-sm p-4 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={product.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.full_name || 'S')}&background=2C67C8&color=fff&bold=true`}
                alt={product.seller.full_name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
              <div className="text-sm">
                <div className="text-gray-800 font-medium flex items-center gap-1">
                  {product.seller.full_name || 'Shop'}
                  <Store className="w-3.5 h-3.5 text-brand" />
                </div>
                <div className="text-xs text-gray-600">Xem tất cả sản phẩm của shop →</div>
              </div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleChatWithShop(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-brand text-brand text-sm font-medium rounded-sm hover:bg-brand hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Chat ngay
            </button>
          </Link>
        )}

        <div className="bg-white rounded-sm shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 bg-gray-50 p-3 mb-4 rounded-sm">Mô tả sản phẩm</h2>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description || 'Chưa có mô tả'}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-sm shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Đánh giá ({reviews.length})</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <span className="text-2xl font-bold text-yellow-500">{avgRating}</span>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-2">/ 5 sao</span>
            </div>
          )}

          {/* Form viết đánh giá - chỉ hiện khi user đã mua & nhận hàng & chưa review */}
          {isAuthenticated && !isOwnProduct && !myReview && eligibleOrderId && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Viết đánh giá của bạn</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${s <= newRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`} />
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-2">{newRating}/5</span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-brand"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-4 py-2 bg-brand text-white text-sm rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {submittingReview ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Gửi đánh giá
                </button>
              </div>
            </div>
          )}

          {isAuthenticated && myReview && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700">
              Bạn đã đánh giá sản phẩm này {myReview.rating}★ — {myReview.comment}
            </div>
          )}

          {isAuthenticated && !isOwnProduct && !myReview && !eligibleOrderId && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              Chỉ người đã mua và nhận hàng thành công mới có thể đánh giá sản phẩm này.
            </div>
          )}

          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-sm text-sm text-gray-700">
              <Link href="/login" className="text-brand font-medium hover:underline">Đăng nhập</Link> để đánh giá và xem lịch sử mua hàng.
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-600 text-sm">Chưa có đánh giá nào.</p>
            ) : (
              reviews.map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="flex gap-3 pb-4 border-b last:border-0">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.full_name || 'U')}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{rev.user?.full_name || 'Người dùng'}</p>
                    <div className="flex items-center gap-1 my-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= (rev.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{rev.comment || rev.content}</p>
                    <p className="text-xs text-gray-600 mt-1">{rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
