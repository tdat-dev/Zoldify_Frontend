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

async function isMaintenanceOn(): Promise<boolean> {
  const now = Date.now();
  if (now < cache.expiresAt) return cache.maintenance;

  let maintenance = false;
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      // Next mặc định cache fetch trong middleware; ở đây cần số liệu thật,
      // việc nhớ tạm đã do biến `cache` phía trên lo với thời hạn tự đặt.
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    const json = await res.json();
    maintenance = (json?.data?.maintenance_mode ?? json?.maintenance_mode) === 'true';
  } catch {
    // Backend chết hoặc quá hạn 2 giây thì KHÔNG đóng site. Nếu backend chết
    // thật thì các trang sẽ tự báo lỗi tải dữ liệu, còn đá mọi người sang
    // "đang bảo trì" là nói sai nguyên nhân — và tệ hơn, nó che mất sự cố.
    maintenance = cache.maintenance;
  }

  cache = { maintenance, expiresAt: now + 15_000 };
  return maintenance;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (ALLOW_EXACT.includes(pathname)) return NextResponse.next();
  if (ALLOW_PREFIX.some((p) => pathname.startsWith(p))) return NextResponse.next();

  if (!(await isMaintenanceOn())) return NextResponse.next();

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
