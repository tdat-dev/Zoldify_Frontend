import type { ReactNode } from 'react';

/**
 * Khung chung cho bốn trang xác thực (đăng nhập, đăng ký, quên mật khẩu, đặt
 * lại mật khẩu). Trước đây mỗi trang tự dựng lại cùng một bố cục hai cột và
 * cùng một thẻ trắng, với các con số khác nhau (rounded-3xl / rounded-xl,
 * shadow-2xl / shadow-xl, max-w-md / max-w-[450px]).
 *
 * Ảnh minh hoạ ẩn dưới lg và có alt rỗng: nó là trang trí, đọc mô tả nó ra cho
 * người dùng trình đọc màn hình chỉ làm họ mất thời gian trước khi tới được
 * biểu mẫu.
 */
export function AuthShell({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-page">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-10 px-4 py-10 lg:flex-row lg:py-16">
        <div className="hidden w-[52%] items-center justify-center lg:flex">
          <img
            src="/images/auth-art.webp"
            alt=""
            width={1400}
            height={989}
            className="h-auto w-full"
            draggable={false}
          />
        </div>

        <div className="w-full max-w-[440px] rounded-card bg-surface-card p-8">
          <div className="mb-6">
            <h1 className="text-h1 text-ink">{title}</h1>
            {lead && <p className="mt-1.5 text-small leading-relaxed text-ink-muted">{lead}</p>}
          </div>
          {children}
          {footer && <div className="mt-6 text-small text-ink-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/** Lớp dùng lại cho mọi ô nhập trong khu xác thực. */
export const authField =
  'w-full rounded-control border border-ink/16 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

export const authLabel = 'mb-1.5 block text-small font-semibold text-ink';

export const authSubmit =
  'w-full rounded-control bg-brand px-5 py-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint';
