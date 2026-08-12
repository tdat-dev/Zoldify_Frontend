/**
 * Phiên đăng nhập — nguồn DUY NHẤT để đọc, ghi và xoá.
 *
 * Trước đây bốn chỗ tự gọi localStorage: AuthContext (đọc/ghi/xoá), GoogleButton
 * (ghi), http.ts (đọc ở request, xoá ở 401). GoogleButton từng ghi thiếu một
 * khoá và tạo ra phiên nửa vời — có token mà không có người dùng. Cùng một kiểu
 * hỏng với bản đồ trạng thái đơn hàng bị chép năm lần: chép tay thì sớm muộn
 * cũng có bản lệch.
 *
 * VÌ SAO CÓ HAI KHO
 *
 * "Ghi nhớ đăng nhập" chỉ có nghĩa khi nó thật sự đổi được điều gì. Ở đây:
 *
 *   - Có tick  -> localStorage:   đóng trình duyệt mở lại vẫn còn đăng nhập.
 *   - Không    -> sessionStorage: đóng tab là mất phiên.
 *
 * Đó là khác biệt người dùng đo được, và là lý do duy nhất chính đáng để đặt
 * cái ô đó lên màn hình. Một checkbox chỉ để cho đẹp thì thà đừng có: người
 * dùng máy chung bỏ tick vì tin rằng nó bảo vệ họ.
 *
 * Đọc thì xét sessionStorage TRƯỚC. Ai vừa đăng nhập không-ghi-nhớ trên một
 * máy đã từng ghi nhớ tài khoản khác mà đọc nhầm thứ tự sẽ thấy mình là người
 * kia. Ghi cũng luôn dọn kho còn lại vì cùng lý do.
 */
export interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar?: string;
}

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

/** Cả hai kho, đúng thứ tự ưu tiên khi đọc. */
function stores(): Storage[] {
  if (typeof window === 'undefined') return [];
  return [window.sessionStorage, window.localStorage];
}

export function readSession(): { token: string | null; user: StoredUser | null } {
  for (const store of stores()) {
    const token = store.getItem(TOKEN_KEY);
    const raw = store.getItem(USER_KEY);
    if (!token || !raw) continue;
    try {
      return { token, user: JSON.parse(raw) as StoredUser };
    } catch {
      // JSON hỏng (người dùng tự sửa, hoặc bản cũ ghi khác định dạng) thì coi
      // như không có phiên và dọn luôn, đừng để nó ném lỗi ở mỗi lần tải trang.
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
    }
  }
  return { token: null, user: null };
}

/** Chỉ token, cho interceptor — nơi không cần dựng lại đối tượng người dùng. */
export function readToken(): string | null {
  for (const store of stores()) {
    const token = store.getItem(TOKEN_KEY);
    if (token) return token;
  }
  return null;
}

export function writeSession(token: string, user: StoredUser, remember: boolean) {
  if (typeof window === 'undefined') return;
  const dung = remember ? window.localStorage : window.sessionStorage;
  const bo = remember ? window.sessionStorage : window.localStorage;
  bo.removeItem(TOKEN_KEY);
  bo.removeItem(USER_KEY);
  dung.setItem(TOKEN_KEY, token);
  dung.setItem(USER_KEY, JSON.stringify(user));
}

/** Cập nhật hồ sơ mà KHÔNG đổi chỗ lưu — người dùng đã chọn nhớ hay không. */
export function updateStoredUser(user: StoredUser) {
  if (typeof window === 'undefined') return;
  for (const store of stores()) {
    if (store.getItem(TOKEN_KEY)) {
      store.setItem(USER_KEY, JSON.stringify(user));
      return;
    }
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  for (const store of stores()) {
    store.removeItem(TOKEN_KEY);
    store.removeItem(USER_KEY);
  }
}
