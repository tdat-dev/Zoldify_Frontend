"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { ItemTile } from './ItemTile';

/**
 * Lưới hàng dàn xuống — không còn cuộn ngang. Các ô rải thành nhiều hàng theo
 * bề rộng màn, mắt đọc từ trái sang phải rồi xuống dòng như một trang danh sách
 * thật, thay vì phải kéo ngang mới thấy hết.
 *
 * Cổng theo đăng nhập (khi `gateAuth`): KHÁCH CHƯA ĐĂNG NHẬP chỉ thấy đúng một
 * hàng đầu — một lát cắt mời gọi — kèm lối đăng nhập để mở hết. NGƯỜI ĐÃ ĐĂNG
 * NHẬP thấy toàn bộ. Việc thu về một hàng làm THUẦN bằng CSS theo breakpoint để
 * số ô ẩn luôn khớp số cột, không nhảy layout sau khi JS chạy.
 */

// Số cột mỗi breakpoint: base 2 · sm 3 · md 4 · lg 5 · xl 6. Chuỗi lớp phải khớp
// grid bên dưới, và viết ĐẦY ĐỦ chứ không ghép động — Tailwind quét văn bản, tên
// lớp ghép `sm:block`+biến không sinh ra CSS.
const GRID_COLS =
  'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

// Ô thứ i chỉ hiện khi hàng đầu ở breakpoint đó còn chỗ cho nó. Ô 0–1 luôn hiện
// (base đã 2 cột); từ ô 6 trở đi không hàng-đầu nào chứa nổi nên ẩn hẳn.
const ROW_ONE_GATE = ['', '', 'hidden sm:block', 'hidden md:block', 'hidden lg:block', 'hidden xl:block'];

function gateClass(i: number): string {
  return i < ROW_ONE_GATE.length ? ROW_ONE_GATE[i] : 'hidden';
}

export function ItemStrip({
  id,
  title,
  items,
  href,
  linkText,
  gateAuth = false,
}: {
  id: string;
  title: string;
  items: any[];
  href?: string;
  /** Bo trong thi dung nhan chung. */
  linkText?: string;
  /** Bật cổng đăng nhập: khách chỉ thấy hàng đầu, đăng nhập mới thấy hết. */
  gateAuth?: boolean;
}) {
  const t = useTranslations('home');
  const { isAuthenticated, authReady } = useAuth();

  // Trước khi đọc xong localStorage, coi như chưa đăng nhập để không lộ trọn
  // lưới rồi thu lại. Người đã đăng nhập chỉ thoáng một hàng trước khi mở hết.
  const collapsed = gateAuth && !isAuthenticated;
  const showLoginCta = gateAuth && authReady && !isAuthenticated;

  return (
    <section aria-labelledby={id} className="rounded-card bg-surface-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-[19px] font-bold text-ink md:text-[21px]">
          {title}
        </h2>
        {href && (
          <Link href={href} className="shrink-0 text-small text-brand hover:text-brand-dark hover:underline">
            {linkText || t('seeAll')}
          </Link>
        )}
      </div>

      <ul className={`grid gap-x-4 gap-y-5 ${GRID_COLS}`}>
        {items.map((item, i) => (
          <li key={item.id} className={collapsed ? gateClass(i) : undefined}>
            <ItemTile item={item} size="md" />
          </li>
        ))}
      </ul>

      {showLoginCta && (
        <div className="mt-5 flex justify-center border-t border-hairline pt-4">
          <Link
            href="/login"
            className="text-small font-semibold text-brand hover:text-brand-dark hover:underline"
          >
            {t('newestLoginMore')}
          </Link>
        </div>
      )}
    </section>
  );
}
