import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Handshake, Wallet } from 'lucide-react';

/**
 * Khung chung cho bốn trang xác thực.
 *
 * Bốn thứ của bản trước đã gỡ:
 *
 * 1. ẢNH MINH HOẠ SAI THÔNG ĐIỆP. auth-art.webp là một hình 3D isometric mua
 *    sẵn, trong đó có chữ "Price: $29.99" — giá đô la, trên một sàn đồ cũ Việt
 *    Nam — kèm watermark "Đồ Cũ vẫn CHẤT" và mấy nhân vật 3D chung chung. Nay
 *    là ảnh chụp thật của năm món đồ cũ có vết dùng thật.
 *
 * 2. THẺ NỔI GIỮA BIỂN XÁM. `rounded-3xl shadow-2xl` trôi trong một vùng nền
 *    rộng. Nay ảnh tràn hết nửa trái tới mép màn, chính chỗ chia đôi tạo ra
 *    cấu trúc, không cần bóng đổ để tách khỏi nền.
 *
 * 3. LOGO TRÙNG. Bản trước đặt logo ngay trên tiêu đề — cộng với logo ở header
 *    thành hai lần Zoldify trong cùng một tầm nhìn. Nay chỉ còn ở header (xem
 *    AuthHeader), nơi người ta đã quen tìm nó.
 *
 * 4. CÂU SLOGAN VIẾT CỨNG TIẾNG VIỆT. Chuyển sang tiếng Anh thì cả header và
 *    biểu mẫu đổi theo, riêng dải chữ trên ảnh vẫn tiếng Việt — một trang hai
 *    thứ tiếng. Nay đi qua next-intl như mọi chuỗi khác.
 *
 * VÌ SAO KHÔNG LÀM CAROUSEL Ở CỘT ẢNH: trang này có đúng một việc phải xong là
 * đăng nhập. Thứ tự động đậy bên cạnh một biểu mẫu chỉ kéo mắt ra khỏi nó, và
 * còn phải gánh thêm nút điều hướng, trạng thái dừng khi hover, và
 * prefers-reduced-motion. Ba điểm giá trị đứng yên đọc được trong một lần nhìn
 * thì nói được đúng chừng ấy mà không lấy đi gì.
 *
 * KHÔNG có huy hiệu "N người dùng tin tưởng": con số đó phải có thật và phải
 * lấy được từ đâu đó. Bịa một con số trên trang đăng nhập của sàn giao dịch là
 * thứ tôi không làm.
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
  const t = useTranslations('authArt');

  const points = [
    { Icon: ShieldCheck, text: t('pointEscrow') },
    { Icon: Handshake, text: t('pointMeet') },
    { Icon: Wallet, text: t('pointFree') },
  ];

  return (
    // min-h trừ đúng chiều cao AuthHeader (h-16 = 4rem). Không có nó thì chiều
    // cao lưới do cột biểu mẫu quyết định, và trên màn hình cao sẽ thừa ra một
    // dải nền xám dưới đáy — ảnh dừng giữa chừng, trông như trang tải lỗi.
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      {/* --- Cột ảnh ---
          Ảnh đặt ABSOLUTE để nó KHÔNG quyết định chiều cao hàng. Với
          `h-full w-full` thường, `h-full` không có tác dụng vì ô lưới cao theo
          nội dung, nên ảnh 760×1643 giãn theo bề rộng cột và đẩy hàng lên
          1557px — biểu mẫu bị đẩy xuống dưới màn hình. */}
      <div className="relative hidden min-h-[640px] overflow-hidden bg-surface-sunken lg:block">
        <img
          src="/media/auth-flatlay.webp"
          alt=""
          width={760}
          height={1643}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Khối chữ nằm trên nền ĐẶC dần, không phải chữ trắng thả trực tiếp lên
            ảnh: ảnh này sáng tối lẫn lộn nên chữ đè lên sẽ có chỗ đọc được chỗ
            không. Dải chuyển từ trong suốt sang đặc giữ được ảnh ở phần trên mà
            vẫn cho chữ một nền cố định ở phần dưới. */}
        {/* via-ink/90 chứ không phải /92: 92 không nằm trong thang độ mờ của
            Tailwind nên lớp đó không sinh ra CSS nào cả — dải sẽ nhảy thẳng từ
            đặc sang trong suốt, chữ mất nền ở khúc giữa. Bộ soát token bắt
            được, mắt thì không. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent px-10 pb-9 pt-20">
          <p className="max-w-[34ch] text-h3 leading-snug text-white">{t('slogan')}</p>

          <ul className="mt-6 flex flex-col gap-3">
            {points.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-small text-white/85">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- Cột biểu mẫu ---
          pb-24 dưới lg: thanh điều hướng đáy trên mobile là position:fixed, nên
          nó nằm đè lên dòng cuối cùng nếu không chừa chỗ. */}
      <div className="flex items-center justify-center bg-surface-card px-5 pb-24 pt-12 sm:px-10 lg:pb-12">
        <div className="w-full max-w-[400px]">
          <h1 className="text-h1 text-ink">{title}</h1>
          {lead && <p className="mt-2 text-small leading-relaxed text-ink-muted">{lead}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-7 text-small text-ink-muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * Lớp dùng lại cho mọi ô nhập trong khu xác thực.
 *
 * Viền lúc nghỉ dày hơn bản trước (ink/16 -> ink/25) và lúc focus có vòng 3px
 * đặc thay vì 2px mờ 20%: trên nền trắng, một vòng mờ 20% gần như không thấy,
 * nên người đi bằng bàn phím không biết mình đang ở ô nào.
 */
export const authField =
  'w-full rounded-control border border-ink/25 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder:text-ink-faint transition-colors focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/30';

/** Ô đang có lỗi: viền đỏ để không phải đọc mới biết chỗ nào sai. */
export const authFieldError =
  'w-full rounded-control border border-state-danger-fg/60 bg-surface-card px-3.5 py-2.5 text-body text-ink placeholder:text-ink-faint transition-colors focus:border-state-danger-fg focus:outline-none focus:ring-[3px] focus:ring-state-danger-fg/25';

export const authLabel = 'mb-1.5 block text-small font-semibold text-ink';

export const authSubmit =
  'w-full rounded-control bg-brand px-5 py-3 text-small font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:bg-ink/16 disabled:text-ink-faint';

/** Nút phụ (Google): cùng chiều cao và bo góc với nút chính, khác ở nền. */
export const authSecondary =
  'flex w-full items-center justify-center gap-3 rounded-control border border-ink/25 bg-surface-card px-5 py-3 text-small font-semibold text-ink transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/40';
