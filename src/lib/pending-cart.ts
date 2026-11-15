/**
 * Ý định thêm giỏ của KHÁCH CHƯA ĐĂNG NHẬP — giữ lại qua bước đăng nhập.
 *
 * Lỗi cũ (M-01): khách bấm "Thêm vào giỏ", bị đá sang /login, đăng nhập Google
 * xong thì về trang chủ và món biến mất. Không có gì hỏng trong giỏ — chỉ là
 * KHÔNG AI GỌI API THÊM GIỎ. Cú bấm đầu tiên bị vứt bỏ ngay lúc chuyển trang:
 * `handleAddToCart` chỉ `router.push('/login')` rồi `return`, không lưu lại
 * món/số lượng, còn GoogleButton thì cứng `window.location.href = '/'`.
 *
 * Nay cú bấm được GHI LẠI trước khi rời trang, tài khoản đăng nhập xong thì
 * đọc lại và thực hiện nốt. Hai điểm cố ý:
 *
 * - `sessionStorage` chứ không `localStorage`: ý định thuộc về TAB đang mở.
 *   Đăng nhập Google là popup nên vẫn đúng tab đó và ý định sống sót qua cả
 *   `window.location.href` (điều hướng cứng vẫn giữ sessionStorage); tab khác
 *   không được thừa hưởng món người khác vừa chọn.
 * - ĐỌC LÀ XOÁ (`take`), ngay trước khi gọi API, không phải sau. Nếu để lại
 *   tới lúc API trả lời, một lần đăng nhập bị bấm hai lần (hoặc F5 giữa chừng)
 *   sẽ thêm món hai lần.
 *
 * Có hạn 30 phút: khách bấm giỏ rồi bỏ đi, tuần sau đăng nhập lại không nên bị
 * nhét món cũ vào giỏ mà không hiểu vì sao.
 */
import { cartService } from '@/services/cart.service';

const KEY = 'zoldify.pending_cart_add';
const TTL_MS = 30 * 60 * 1000;

/** `add` ở lại giỏ hàng, `buy` đi thẳng sang thanh toán — giống hai nút gốc. */
export type CartAddMode = 'add' | 'buy';

export interface PendingCartAdd {
  productId: number;
  quantity: number;
  mode: CartAddMode;
  /** Trang khách đứng lúc bấm, để quay lại nếu thêm giỏ thất bại. */
  returnTo: string;
  stagedAt: number;
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    // Trình duyệt chặn storage (chế độ riêng tư của một số bản cũ) — mất ý
    // định còn hơn ném lỗi làm nút "Thêm vào giỏ" chết hẳn.
    return null;
  }
}

/** Đường dẫn nội bộ hợp lệ. `/login?next=https://...` là lỗ hổng open-redirect. */
function isInternalPath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

/** Lưu ý định trước khi đá khách sang /login. */
export function stageCartAdd(input: {
  productId: number;
  quantity: number;
  mode: CartAddMode;
  returnTo: string;
}): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(KEY, JSON.stringify({ ...input, stagedAt: Date.now() }));
  } catch {
    // Hết quota / bị chặn: không lưu được thì đành thôi, không chặn việc đăng nhập.
  }
}

function read(): PendingCartAdd | null {
  const store = storage();
  if (!store) return null;

  let raw: string | null = null;
  try {
    raw = store.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<PendingCartAdd>;
    const { productId, quantity, mode, returnTo, stagedAt } = value;

    // Kiểm từng trường: giá trị này nằm trong storage, tức là người dùng sửa
    // được, và nó đi thẳng vào một request POST /cart.
    if (!Number.isInteger(productId) || (productId as number) <= 0) return null;
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 99)
      return null;
    if (mode !== 'add' && mode !== 'buy') return null;
    if (!isInternalPath(returnTo)) return null;
    if (typeof stagedAt !== 'number' || !Number.isFinite(stagedAt)) return null;
    if (Date.now() - stagedAt > TTL_MS) return null;

    return {
      productId: productId as number,
      quantity: quantity as number,
      mode,
      returnTo,
      stagedAt,
    };
  } catch {
    return null;
  }
}

/** Đọc VÀ xoá. Chỉ gọi một lần trong luồng đăng nhập. */
export function takeCartAdd(): PendingCartAdd | null {
  const pending = read();
  const store = storage();
  if (store) {
    try {
      store.removeItem(KEY);
    } catch {
      // Không xoá được thì TTL dọn hộ.
    }
  }
  return pending;
}

/**
 * Chạy nốt cú bấm còn treo sau khi đã có phiên. Trả về đường dẫn cần đi tiếp.
 *
 * Gọi ở CẢ HAI đường đăng nhập (email/mật khẩu và Google) — đây chính là chỗ
 * bản cũ lệch nhau: form thì về `/`, Google cũng về `/`, không ai thêm giỏ.
 */
export async function resumeCartAddAfterLogin(): Promise<string> {
  const pending = takeCartAdd();
  if (!pending) return '/';

  try {
    const res = await cartService.add(pending.productId, pending.quantity);
    const cartId = Number(res.data?.data?.id);

    if (pending.mode === 'buy') {
      return Number.isFinite(cartId) && cartId > 0 ? `/checkout?ids=${cartId}` : '/cart';
    }
    // Sang thẳng giỏ: món vừa thêm nằm ngay đó, khách thấy kết quả của cú bấm
    // chứ không phải một cú nhảy về trang chủ rồi tự đoán xem đã thêm chưa.
    return '/cart';
  } catch {
    // Hết hàng, món đã bị gỡ, hay tự mua đồ của chính mình: trả về đúng trang
    // sản phẩm, nơi trạng thái tồn kho hiện rõ — tốt hơn một giỏ trống không
    // giải thích, và tốt hơn nuốt lỗi rồi về trang chủ.
    return pending.returnTo;
  }
}
