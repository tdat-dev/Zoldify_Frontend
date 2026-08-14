import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * Ngôn ngữ đọc từ cookie `locale`, KHÔNG từ tiền tố URL.
 *
 * Vì sao chưa dùng tiền tố URL (/vi/..., /en/...): cách đó là chuẩn cho SEO đa
 * thị trường, nhưng nó bắt phải dời cả 40 file trong src/app vào src/app/[locale]/.
 * Việc đó nên làm khi thật sự mở thị trường thứ hai. Phần nặng nhất của i18n là
 * TÁCH CHUỖI, và tách rồi thì thêm tiền tố URL sau không phải làm lại.
 *
 * Mặc định tiếng Việt: đây vẫn là thị trường duy nhất đang chạy thật (PayOS,
 * GHN, địa chỉ tỉnh/huyện/xã đều là hạ tầng trong nước).
 */
export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'vi';

export default getRequestConfig(async () => {
  const raw = cookies().get('locale')?.value;
  const locale: Locale = (LOCALES as readonly string[]).includes(raw ?? '')
    ? (raw as Locale)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
