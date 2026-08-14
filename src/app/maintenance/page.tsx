import React from 'react';
import { useTranslations } from 'next-intl';
import { Wrench } from 'lucide-react';

/**
 * Trang bảo trì.
 *
 * Đây là màn TỐI DUY NHẤT của site, và đó là có chủ đích: người dùng phải nhận
 * ra ngay là mình không ở trong ứng dụng bình thường. Nhưng tối thì phải dùng
 * `bg-chrome` — màu navy thương hiệu đã có sẵn — chứ không phải một dải gradient
 * xám riêng, và chữ phải là trắng theo độ mờ, KHÔNG phải token `ink`.
 *
 * `ink` là màu chữ trên nền SÁNG (--ink: 0.24, gần đen). Đặt text-ink-muted lên
 * nền tối là chữ tàng hình. Bản trước dính đúng lỗi này khi tôi quét đổi màu
 * hàng loạt: bản đồ chuyển đổi giả định mọi nền đều sáng, và trang này là ngoại
 * lệ duy nhất nên không ai để ý.
 */
export default function MaintenancePage() {
  const t = useTranslations('errors');

  return (
    <div className="flex min-h-screen items-center justify-center bg-chrome px-6 py-20">
      <div className="text-center">
        <Wrench className="mx-auto mb-8 h-16 w-16 text-white/60" aria-hidden="true" />

        <h1 className="text-h1 text-white md:text-[40px]">{t('maintenanceTitle')}</h1>

        <p className="mx-auto mt-4 max-w-md text-body leading-relaxed text-white/70">
          {t('maintenanceLead')}
        </p>

        <p className="mt-8 text-small text-white/50">
          {t('maintenanceContact')}{' '}
          <a href="mailto:admin@zoldify.com" className="text-white/80 underline hover:text-white">
            admin@zoldify.com
          </a>
        </p>
      </div>
    </div>
  );
}
