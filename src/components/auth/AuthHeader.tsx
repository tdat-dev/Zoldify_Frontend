"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { LocaleSwitch } from '@/components/LocaleSwitch';

/**
 * Header rút gọn cho bốn trang xác thực.
 *
 * Header đầy đủ có ô tìm kiếm, giỏ hàng, chuông thông báo, menu tài khoản và
 * nút "Đăng bán". Trên trang đăng nhập thì gần như toàn bộ chỗ đó là đường cụt:
 * chưa đăng nhập nên giỏ trống, thông báo trống, menu tài khoản chỉ trỏ ngược
 * về chính trang này, còn "Đăng bán" thì bấm vào sẽ bị đá về đây. Bày ra một
 * hàng lựa chọn mà quá nửa dẫn tới hư không, ngay lúc người dùng chỉ có đúng
 * một việc phải làm.
 *
 * Còn lại ba thứ, và cả ba đều dùng được ngay: logo để về trang chủ, đổi ngôn
 * ngữ (bỏ đi thì người đọc tiếng Anh mắc kẹt ở trang tiếng Việt trước cả khi
 * vào được bên trong), và một đường thoát rõ ràng.
 */
export function AuthHeader() {
  const t = useTranslations('auth');

  return (
    <header className="border-b border-ink/10 bg-surface-card">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Zoldify" className="shrink-0">
          <img
            src="/images/logo.webp"
            alt="Zoldify"
            width={480}
            height={147}
            className="h-7 w-auto"
          />
        </Link>

        <div className="flex items-center gap-5">
          <LocaleSwitch className="text-ink-muted" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-small font-semibold text-ink-muted transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('backHome')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
