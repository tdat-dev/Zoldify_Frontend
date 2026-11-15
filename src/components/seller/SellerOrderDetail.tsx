'use client';

import { X, Package, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ShipmentPanel } from '@/components/seller/ShipmentPanel';
import { formatPrice, imageUrl } from '@/lib/format';
import { orderStatusTone } from '@/lib/order-status';
import { TONE_CLASS } from '@/lib/status-tone';
import {
  formatDate,
  isMultiSeller,
  orderCode,
  orderDiscount,
  sellerSubtotal,
  type Order,
} from './seller-order';

/** Hộp chi tiết một đơn bán (tách khỏi app/shop/orders/page.tsx khi trang vượt 600 dòng). */
export function SellerOrderDetail({
  order,
  onClose,
  onRefresh,
}: {
  order: Order;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const t = useTranslations('shop');
  const tStatus = useTranslations('orderStatus');

  return (
      <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4" onClick={() => onClose()}>
        <div
          className="bg-surface-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-surface-card border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">{t('orderDetail')}</h2>
              <p className="text-small text-ink-muted font-mono">{orderCode(order)}</p>
            </div>
            <button onClick={() => onClose()} className="p-1 hover:bg-surface-sunken rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1.5 rounded-full text-small font-medium ${TONE_CLASS[orderStatusTone(order.status)]}`}>
                {tStatus(order.status)}
              </span>
              <div className="text-right">
                <div className="text-caption text-ink-muted">{t('placedAt')}</div>
                <div className="text-small text-ink">{formatDate(order.created_at)}</div>
              </div>
            </div>
    
            <ShipmentPanel
              key={order.id}
              orderId={order.id}
              onChanged={onRefresh}
            />
    
            <div className="bg-surface-page rounded-control p-4">
              <h3 className="text-small font-semibold text-ink mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> {t('customer')}
              </h3>
              <div className="text-small space-y-1">
                <div className="font-medium">{order.user?.full_name || '—'}</div>
                <div className="text-caption text-ink-muted">{order.user?.email || ''}</div>
              </div>
            </div>
    
            <div className="bg-surface-page rounded-control p-4">
              <h3 className="text-small font-semibold text-ink mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t('shipTo')}
              </h3>
              <div className="space-y-2 text-small">
                <div className="flex items-start gap-2">
                  <UserIcon className="w-4 h-4 text-ink-muted mt-0.5" />
                  <div>
                    <div className="font-medium">{order.receiver_name}</div>
                    <div className="text-caption text-ink-muted flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.receiver_phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-ink-muted mt-0.5" />
                  <div className="text-ink">
                    {order.shipping_address}
                    {(order.district || order.province) && (
                      <div className="text-caption text-ink-muted">
                        {[order.district, order.province].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                {order.note && (
                  <div className="text-caption text-ink-muted italic border-l-2 border-ink/16 pl-2">
                    {t('note', { note: order.note })}
                  </div>
                )}
              </div>
            </div>
    
            <div>
              <h3 className="text-small font-semibold text-ink mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> {t('itemsIn', { count: order.items?.length || 0 })}
              </h3>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-control">
                    <div className="w-14 h-14 rounded-control bg-surface-sunken overflow-hidden flex-shrink-0">
                      {imageUrl(item.product?.image || item.product_image) ? (
                        <img
                          src={imageUrl(item.product?.image || item.product_image)!}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-muted">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-small font-medium text-ink line-clamp-1">{item.product_name}</div>
                      <div className="text-caption text-ink-muted">SL: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                    <div className="text-small font-semibold text-ink">{formatPrice(item.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>
    
            {isMultiSeller(order) ? (
              // Đơn có hàng của người bán khác: tổng, phí giao của đơn không phải
              // tiền của riêng người này (test staging 12/11).
              <div className="border-t pt-4 space-y-2 text-small">
                <div className="flex justify-between text-base font-bold text-ink">
                  <span>{t('yourSubtotal')}</span>
                  <span className="text-state-danger-fg">{formatPrice(sellerSubtotal(order))}</span>
                </div>
                <p className="text-caption text-ink-muted">{t('multiSellerNote')}</p>
              </div>
            ) : (
            <div className="border-t pt-4 space-y-2 text-small">
              <div className="flex justify-between text-ink-muted">
                <span>{t('subtotal')}</span><span>{formatPrice(order.total_amount)}</span>
              </div>
              {Number(orderDiscount(order)) > 0 && (
                <div className="flex justify-between text-ink-muted">
                  <span>{t('discount')}</span><span className="text-state-success-fg">-{formatPrice(orderDiscount(order))}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-muted">
                <span>{t('shippingFee')}</span>
                <span>{Number(order.shipping_fee) > 0 ? formatPrice(order.shipping_fee) : t('free')}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink pt-2 border-t">
                <span>{t('total')}</span>
                <span className="text-state-danger-fg">{formatPrice(order.final_amount)}</span>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
  );
}
