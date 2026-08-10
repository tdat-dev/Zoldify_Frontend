import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Khung chung cho bốn trang xác thực.
 *
 * Bốn thứ của bản trước đã gỡ:
 *
 * 1. ẢNH MINH HOẠ SAI THÔNG ĐIỆP. auth-art.webp là một hình 3D isometric mua
 *    sẵn, trong đó có chữ "Price: $29.99" — giá đô la, trên một sàn đồ cũ Việt
 *    Nam — kèm watermark "Đồ Cũ vẫn CHẤT" và mấy nhân vật 3D chung chung. Nó
 *    không nói được Zoldify bán gì. Nay là ảnh chụp thật của năm món đồ cũ có
 *    vết dùng thật: máy ảnh phim, áo denim bạc, tai nghe sờn đệm, sách ố gáy,
 *    mũ bảo hiểm xanh. Người chưa biết Zoldify nhìn một giây là hiểu.
 *
 * 2. THẺ NỔI GIỮA BIỂN XÁM. `rounded-3xl shadow-2xl` trôi trong một vùng nền
 *    rộng, phần lớn màn hình là khoảng trống không làm gì. Nay ảnh tràn hết
 *    nửa trái tới mép màn, form chiếm nửa phải — chính chỗ chia đôi tạo ra cấu
 *    trúc, không cần bóng đổ để tách khỏi nền.
 *
 * 3. LOGO KHÔNG CÓ MẶT. Trang đăng nhập là nơi nhiều người gặp Zoldify đầu
 *    tiên, mà không có gì trên trang nói đây là Zoldify ngoài dòng chữ nhỏ ở
 *    header. Nay logo đứng trên tiêu đề, và bấm được về trang chủ.
 *
 * 4. Bo góc 24px (`rounded-3xl`) trong khi cả site đã về 4px.
 *
 * Ảnh ẩn dưới lg: trên điện thoại, đẩy biểu mẫu xuống dưới một tấm ảnh cao là
 * bắt người ta cuộn để làm đúng việc họ vào đây để làm.
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
    <div className="grid grid-cols-1 bg-surface-card lg:grid-cols-2">
      {/* --- Cột ảnh ---
          Ảnh đặt ABSOLUTE để nó KHÔNG quyết định chiều cao hàng. Với
          `h-full w-full` thường, `h-full` không có tác dụng vì ô lưới cao theo
          nội dung, nên ảnh 760×1643 giãn theo bề rộng cột và đẩy hàng lên
          1557px — biểu mẫu bị đẩy xuống dưới màn hình. Nay chiều cao do cột
          biểu mẫu quyết định, ảnh chỉ lấp đầy phần còn lại. */}
      <div className="relative hidden min-h-[600px] overflow-hidden bg-surface-sunken lg:block">
        <img
          src="/media/auth-flatlay.webp"
          alt=""
          width={760}
          height={1643}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Dải chữ nằm trên nền đặc, KHÔNG phải chữ trắng đè lên ảnh: ảnh này
            sáng và có vùng đậm nhạt lẫn lộn, chữ đè lên sẽ có chỗ đọc được chỗ
            không. Dải đặc thì tương phản cố định. */}
        <p className="absolute inset-x-0 bottom-0 bg-ink/85 px-8 py-5 text-body leading-relaxed text-white">
          Đồ cũ của người này là thứ người kia đang tìm.
        </p>
      </div>

      {/* --- Cột biểu mẫu ---
          pb-24 dưới lg: thanh điều hướng đáy trên mobile là position:fixed, nên
          nó nằm đè lên dòng cuối cùng ("Chưa có tài khoản? Đăng ký") nếu không
          chừa chỗ. */}
      <div className="flex items-center justify-center px-5 pb-24 pt-12 sm:px-10 lg:pb-12">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="mb-8 inline-block">
            <img
              src="/images/logo.webp"
              alt="Zoldify"
              width={480}
              height={147}
              className="h-7 w-auto"
            />
          </Link>

          <h1 className="text-h1 text-ink">{title}</h1>
          {lead && <p className="mt-2 text-small leading-relaxed text-ink-muted">{lead}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-7 text-small text-ink-muted">{footer}</div>}
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

/** Nút phụ (Google): cùng chiều cao và bo góc với nút chính, khác ở nền. */
export const authSecondary =
  'flex w-full items-center justify-center gap-3 rounded-control border border-ink/16 bg-surface-card px-5 py-3 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:text-ink-faint';
