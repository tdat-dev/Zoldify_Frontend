"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
import { ConditionBadge } from '@/components/ConditionBadge';
import { formatPrice } from '@/lib/format';

export default function ProductDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const t = useTranslations('product');
  const tc = useTranslations('common');
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
  const [loadFailed, setLoadFailed] = useState(false);
  const isOwnProduct = product && user && product.seller?.id === user.id;

  // Số cái còn lại và cờ hết hàng — dùng ở nhiều chỗ trong trang, tính một lần.
  // Bản trước không có cờ này nên nút "Mua ngay" vẫn bấm được trên món stock = 0.
  const stockLeft = Number(product?.stock ?? 0);
  const soldOut = !Number.isFinite(stockLeft) || stockLeft <= 0;
  const isBanned = product?.status === 'banned';

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
      if (prodRes.status === 'fulfilled') {
        setProduct(prodRes.value.data?.data || prodRes.value.data);
      } else {
        // Phân biệt "sản phẩm không tồn tại" (404) với "API hỏng" — trước đây
        // cả hai đều hiện cùng một dòng "Không tìm thấy sản phẩm".
        setLoadFailed((prodRes.reason as any)?.response?.status !== 404);
      }
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
    if (isBanned) return;
    setAddingCart(true);
    try {
      await cartService.add(Number(params.id), quantity);
      refreshCartCount();
      toast(t('addedToCart'), 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || t('addToCartFailed'), 'error');
    } finally {
      setAddingCart(false);
    }
  };


  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (isBanned) return;
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
      toast(err.response?.data?.message || t('buyNowFailed'), 'error');
    } finally {
      setAddingCart(false);
    }
  };

  const handleChatWithShop = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (isBanned) return;
    if (!product?.seller?.id) {
      toast(t('shopNotFound'), 'error');
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
      toast(err.response?.data?.message || t('chatFailed'), 'error');
    }
  };

  // Backend chưa có endpoint báo cáo, nên gửi qua email kèm sẵn ngữ cảnh sản phẩm.
  const handleReport = () => {
    if (!product) return;
    const subject = t('reportSubject', { id: product.id });
    const body = [
      t('reportItem', { name: product.name }),
      t('reportId', { id: product.id }),
      `Link: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      '',
      t('reportReason'),
      '',
    ].join('\n');
    window.location.href = `mailto:admin@zoldify.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast(t('reportOpening'), 'info');
  };

  const handleSubmitReview = async () => {
    if (!eligibleOrderId) return;
    if (!newComment.trim()) { toast(t('reviewNeedComment'), 'error'); return; }
    setSubmittingReview(true);
    try {
      await reviewService.create({
        product_id: product.id,
        order_id: eligibleOrderId,
        rating: newRating,
        comment: newComment,
      });
      toast(t('reviewDone'), 'success');
      setNewComment('');
      setNewRating(5);
      setEligibleOrderId(null);
      fetchData();
    } catch (err: any) {
      toast(err.response?.data?.message || t('reviewFailed'), 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : '0';

  if (loading) {
    return <div className="bg-surface-page min-h-screen flex items-center justify-center"><Loader className="w-6 h-6 animate-spin text-ink-muted" /></div>;
  }

  if (!product) {
    return (
      <div className="bg-surface-page min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {loadFailed ? (
            <>
              <p className="text-ink font-medium mb-2">{t('loadFailed')}</p>
              <p className="text-sm text-ink-muted mb-5">{t('loadFailedHint')}</p>
              <button
                onClick={() => { setLoading(true); setLoadFailed(false); fetchData(); }}
                className="px-5 py-2.5 bg-brand text-white rounded-control text-sm font-medium hover:bg-brand-dark transition-colors"
              >
                {tc('retry')}
              </button>
            </>
          ) : (
            <>
              <p className="text-ink font-medium mb-2">{t('notFound')}</p>
              <p className="text-sm text-ink-muted mb-5">{t('notFoundHint')}</p>
              <Link href="/search" className="px-5 py-2.5 bg-brand text-white rounded-control text-sm font-medium hover:bg-brand-dark transition-colors">
                {t('browseOthers')}
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-page min-h-screen pb-20 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 pt-4 space-y-6">
        <div className="text-sm text-ink-muted flex items-center gap-2">
          <Link href="/" className="hover:text-brand">{t('home')}</Link>
          <span>&gt;</span>
          <span className="text-ink truncate">{product.name}</span>
        </div>

        <div className="bg-surface-card rounded-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <div className="relative w-full aspect-square bg-surface-sunken rounded-control overflow-hidden border border-ink/10 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                ) : (
                  <Package className="w-20 h-20 text-ink-muted" />
                )}
              </div>
            </div>

            <div className="md:col-span-7 space-y-6">
              {isBanned && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-control flex flex-col items-center justify-center text-center">
                  <CheckCircle className="w-8 h-8 mb-2 text-red-500" aria-hidden="true" />
                  <span className="font-semibold text-lg mb-1">Sản phẩm này đã bị khóa</span>
                  <span className="text-sm">Do vi phạm chính sách của chúng tôi, bạn không thể thực hiện bất kỳ giao dịch nào với sản phẩm này.</span>
                </div>
              )}

              <h1 className="text-2xl font-medium text-ink leading-snug">{product.name}</h1>

              <div className="rounded-control bg-surface-sunken p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[28px] font-bold tabular-nums text-price">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {!!product.is_freeship && (
                    <span className="inline-flex items-center gap-1 rounded-control bg-state-success-bg px-2 py-1 text-caption text-state-success-fg">
                      <Truck className="h-3.5 w-3.5" aria-hidden="true" /> {t('freeLocal')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 text-body text-ink-muted">
                {/* Tình trạng đi qua ConditionBadge: bản trước dịch tay theo thang
                    new/used/refurbished, nên món lưu 'like_new' hiện nguyên chuỗi
                    'like_new' ra mặt trang cho người mua đọc. */}
                <div className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-ink-muted">{t('condition')}</span>
                  <ConditionBadge value={product.condition} />
                </div>

                {/* Bộ tăng giảm số lượng CHỈ hiện khi thật sự có nhiều hơn một
                    cái. Đồ cũ gần như luôn stock = 1; bày ra một cái +/- cho món
                    độc nhất là ngôn ngữ của sàn hàng mới, không phải của sàn này. */}
                <div className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-ink-muted">{t('stock')}</span>
                  {soldOut ? (
                    <span className="text-body font-semibold text-ink">{t('soldOut')}</span>
                  ) : stockLeft > 1 ? (
                    <>
                      <div className="flex items-center rounded-control border border-ink/16">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          aria-label={t('decrease')}
                          className="min-w-[36px] border-r border-ink/16 px-3 py-1.5 text-ink transition-colors hover:bg-surface-sunken"
                        >
                          −
                        </button>
                        <span className="w-14 text-center text-body font-semibold tabular-nums text-ink">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(stockLeft, quantity + 1))}
                          aria-label={t('increase')}
                          className="min-w-[36px] border-l border-ink/16 px-3 py-1.5 text-ink transition-colors hover:bg-surface-sunken"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-small text-ink-muted">{t('stockLeft', { count: stockLeft })}</span>
                    </>
                  ) : (
                    <span className="text-body text-ink">{t('onlyOne')}</span>
                  )}
                </div>
              </div>

              {/* Hết hàng thì KHÔNG dựng nút mua. Bản trước vẫn cho bấm "Mua ngay"
                  trên món stock = 0, người mua đi hết luồng rồi mới vỡ ở giỏ. */}
              <div className="flex flex-wrap gap-3 pt-4">
                {isBanned ? (
                   <p className="flex flex-1 items-center justify-center rounded-control bg-red-100 px-6 py-3 text-body font-medium text-red-700 cursor-not-allowed">
                     Sản phẩm bị khóa
                   </p>
                ) : isOwnProduct ? (
                  <p className="flex flex-1 items-center justify-center gap-2 rounded-control bg-state-pending-bg px-6 py-3 text-body font-medium text-state-pending-fg">
                    {t('yourListing')}{' '}
                    <Link href={`/product/${product.id}/edit`} className="underline">
                      {t('editListing')}
                    </Link>
                  </p>
                ) : soldOut ? (
                  <p className="flex flex-1 items-center justify-center rounded-control bg-surface-sunken px-6 py-3 text-body font-medium text-ink-muted">
                    {t('soldOutLong')}
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addingCart}
                      className="flex flex-1 items-center justify-center gap-2 rounded-control border border-brand px-6 py-3 text-body font-semibold text-brand transition-colors hover:bg-brand-tint disabled:opacity-70"
                    >
                      {addingCart ? (
                        t('adding')
                      ) : (
                        <>
                          <Package className="h-5 w-5" aria-hidden="true" /> {t('addToCart')}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="flex-1 rounded-control bg-brand px-8 py-3 text-body font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      Mua ngay
                    </button>
                  </>
                )}
              </div>

              <div className="border-t pt-6 mt-6 grid grid-cols-2 gap-4 text-sm text-ink-muted">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand flex-shrink-0" aria-hidden="true" />
                  <span>{t('marketplace')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand flex-shrink-0" aria-hidden="true" />
                  <span>{t('talkFirst')}</span>
                </div>
                <div className="col-span-2 pt-2 flex items-center gap-4 flex-wrap">
                  {!isOwnProduct && (
                    <button onClick={handleChatWithShop} className="flex items-center gap-2 py-1 hover:text-brand transition-colors">
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>{t('chatShop')}</span>
                    </button>
                  )}
                  <button onClick={handleReport} className="flex items-center gap-2 py-1 hover:text-price transition-colors">
                    <Flag className="w-4 h-4" aria-hidden="true" />
                    <span>{t('report')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Khối người bán.
            Bản trước bọc cả khối trong <Link> rồi nhét <button> vào trong. Nút
            nằm trong liên kết là HTML không hợp lệ: trình đọc màn hình đọc ra
            một phần tử lồng nhau khó hiểu, và phải preventDefault để chữa cháy.
            Nay khối là một <div>, bên trong có hai đích bấm riêng biệt. */}
        {!isOwnProduct && product.seller && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink/10 bg-surface-card p-4">
            <Link
              href={`/shop?seller=${product.seller.id}`}
              className="flex min-w-0 items-center gap-3 rounded-control focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <img
                src={
                  product.seller.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.full_name || 'S')}&background=2C67C8&color=fff&bold=true`
                }
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border border-ink/12 object-cover"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-body font-semibold text-ink">
                  <span className="truncate">{product.seller.full_name || t('seller')}</span>
                  <Store className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                </span>
                <span className="block text-small text-ink-muted">
                  {t('seeAllFromSeller')}
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={handleChatWithShop}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-brand px-4 py-2 text-small font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              {t('messageSeller')}
            </button>
          </div>
        )}

        <div className="bg-surface-card rounded-card p-6">
          <h2 className="text-lg font-medium text-ink bg-surface-sunken p-3 mb-4 rounded-control">{t('description')}</h2>
          <div className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">
            {product.description || t('noDescription')}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-surface-card rounded-card p-6">
          <h2 className="text-lg font-medium text-ink mb-4">{t('reviews', { count: reviews.length })}</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <span className="text-h1 tabular-nums text-ink">{avgRating}</span>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-state-pending-fg fill-amber-500' : 'text-ink/25'}`} />
                ))}
              </div>
              <span className="text-xs text-ink-muted ml-2">/ 5 sao</span>
            </div>
          )}

          {/* Form viết đánh giá - chỉ hiện khi user đã mua & nhận hàng & chưa review */}
          {isAuthenticated && !isOwnProduct && !myReview && eligibleOrderId && (
            <div className="mb-6 p-4 bg-brand-tint border border-brand/25 rounded-control">
              <h3 className="text-sm font-medium text-ink mb-3">{t('writeReview')}</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewRating(s)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-6 h-6 ${s <= newRating ? 'text-state-pending-fg fill-amber-500' : 'text-ink/25 hover:text-state-pending-fg'}`} />
                  </button>
                ))}
                <span className="text-sm text-ink-muted ml-2">{newRating}/5</span>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('reviewPlaceholder')}
                className="w-full px-3 py-2 border border-ink/16 rounded-control text-sm focus:outline-none focus:border-brand"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="px-4 py-2 bg-brand text-white text-sm rounded-control hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {submittingReview ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('submitReview')}
                </button>
              </div>
            </div>
          )}

          {isAuthenticated && myReview && (
            <div className="mb-4 p-3 bg-state-success-bg border border-state-success-fg/25 rounded-control text-small text-state-success-fg">
              {t('yourReview', { rating: myReview.rating, comment: myReview.comment })}
            </div>
          )}

          {isAuthenticated && !isOwnProduct && !myReview && !eligibleOrderId && (
            <div className="mb-4 p-3 bg-surface-sunken border border-ink/10 rounded-control text-sm text-ink-muted flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-ink-muted" />
              {t('reviewOnlyBuyers')}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-state-pending-bg border border-state-pending-fg/25 rounded-control text-sm text-ink-muted">
              <Link href="/login" className="text-brand font-medium hover:underline">{t('loginToReview')}</Link> {t('loginToReviewRest')}
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-ink-muted text-sm">{t('noReviews')}</p>
            ) : (
              reviews.map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="flex gap-3 pb-4 border-b last:border-0">
                  <img loading="lazy" decoding="async" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.full_name || 'U')}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{rev.user?.full_name || t('anonUser')}</p>
                    <div className="flex items-center gap-1 my-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= (rev.rating || 0) ? 'text-state-pending-fg fill-amber-500' : 'text-ink/25'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-ink-muted">{rev.comment || rev.content}</p>
                    <p className="text-xs text-ink-muted mt-1">{rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : ''}</p>
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
