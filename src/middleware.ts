import { NextResponse, type NextRequest } from 'next/server';
import { API_URL } from '@/lib/config';

/**
 * Chuyển hướng sang trang bảo trì khi admin bật cờ.
 *
 * Đây là tầng GIAO DIỆN. Nó chỉ lo việc người dùng nhìn thấy gì; việc chặn thật
 * nằm ở backend (common/guards/maintenance.guard.ts). Có middleware mà không có
 * guard thì ai gọi thẳng API vẫn đặt hàng được — mà "bảo trì" thường có nghĩa
 * là đang chạy migration, tức là đúng lúc không được có ai ghi vào database.
 *
 * BỐN LỐI LUÔN MỞ:
 *  - /maintenance — không thì chuyển hướng vòng tròn vô tận.
 *  - /login       — admin phải đăng nhập được để vào tắt công tắc.
 *  - tệp tĩnh, _next, ảnh — trang bảo trì cũng cần CSS và logo của nó.
 *
 * NHỚ TẠM 15 GIÂY: middleware chạy trước MỌI request trang. Gọi backend mỗi lần
 * là cộng một round-trip vào từng lượt tải trang, kể cả lúc site chạy bình
 * thường — tức là trả giá suốt ngày cho một tính năng dùng vài lần một năm.
 */
const ALLOW_EXACT = ['/maintenance', '/login'];
const ALLOW_PREFIX = ['/_next', '/media', '/images', '/favicon'];

let cache: { maintenance: boolean; expiresAt: number } = { maintenance: false, expiresAt: 0 };

/**
 * Đưa đường dẫn chuẩn xuống layout để dựng thẻ canonical: server component
 * không đọc được URL đang xem, chỉ đọc được header.
 *
 * Bỏ query để URL có utm_, sort hay bộ lọc gộp về một trang.
 */
function diTiep(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set('x-canonical-path', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

/**
 * MỘT lượt hỏi backend cho mỗi lần hết hạn, dù bao nhiêu trang đang chờ.
 *
 * Bản trước chỉ có biến `cache`, nên lúc cache vừa hết hạn mà nhiều người mở
 * trang cùng lúc thì MỖI request tự gọi backend (cache chỉ được ghi sau khi
 * lượt gọi đầu xong). Mọi lượt gọi đó đi từ máy chủ web, tức là cùng MỘT IP
 * (VPS) trong mắt ThrottlerGuard, giới hạn 10 request/giây. Đo trên staging
 * 03/11: 100 lượt tải trang song song sinh 43 lượt gọi /settings/public, 31
 * lượt bị 429. Giữ chung một promise thì 100 lượt tải trang = 1 lượt gọi.
 */
let dangHoi: Promise<boolean> | null = null;

async function hoiBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      // Next mặc định cache fetch trong middleware; ở đây cần số liệu thật,
      // việc nhớ tạm đã do biến `cache` phía trên lo với thời hạn tự đặt.
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    // 429, 5xx: GIỮ giá trị cũ. Bản trước đọc thẳng body lỗi, không thấy
    // maintenance_mode nên coi là "tắt" và nhớ luôn 15 giây: đang bảo trì mà
    // một lượt 429 là cả site mở lại cho mọi người (đo bằng backend giả có
    // giới hạn 10/s: 80/100 trang lọt qua, rồi 30/30 trang kế tiếp cũng lọt).
    if (!res.ok) return cache.maintenance;
    const json = await res.json();
    return (json?.data?.maintenance_mode ?? json?.maintenance_mode) === 'true';
  } catch {
    // Backend chết hoặc quá hạn 2 giây thì KHÔNG đóng site. Nếu backend chết
    // thật thì các trang sẽ tự báo lỗi tải dữ liệu, còn đá mọi người sang
    // "đang bảo trì" là nói sai nguyên nhân — và tệ hơn, nó che mất sự cố.
    return cache.maintenance;
  }
}

async function isMaintenanceOn(): Promise<boolean> {
  if (Date.now() < cache.expiresAt) return cache.maintenance;

  if (!dangHoi) {
    dangHoi = hoiBackend()
      .then((maintenance) => {
        // Hỏng cũng nhớ 15 giây: backend đang 429 hay đang chết thì hỏi dồn
        // chỉ làm nặng thêm.
        cache = { maintenance, expiresAt: Date.now() + 15_000 };
        return maintenance;
      })
      .finally(() => {
        dangHoi = null;
      });
  }
  return dangHoi;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (ALLOW_EXACT.includes(pathname)) return diTiep(req);
  if (ALLOW_PREFIX.some((p) => pathname.startsWith(p))) return diTiep(req);

  if (!(await isMaintenanceOn())) return diTiep(req);

  const url = req.nextUrl.clone();
  url.pathname = '/maintenance';
  // rewrite chứ không redirect: người dùng giữ nguyên đường dẫn họ đang ở, nên
  // khi site mở lại chỉ cần tải lại trang là về đúng chỗ. Redirect sẽ ghi
  // /maintenance vào thanh địa chỉ và xoá mất nơi họ định đến.
  return NextResponse.rewrite(url);
}

export const config = {
  /**
   * Bỏ qua mọi thứ có dấu chấm trong tên (tệp tĩnh) và các đường nội bộ của
   * Next. Không có bộ lọc này thì middleware chạy cả cho từng ảnh, từng tệp
   * JS — mỗi tệp một lần kiểm cờ.
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
