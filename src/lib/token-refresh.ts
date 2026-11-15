import axios from 'axios';
import { API_URL } from './config';
import { readRefreshToken, readToken, updateStoredToken } from './session';

/**
 * Xin access token mới bằng refresh token (test staging 12/11, TK-06: web không
 * lưu refresh token nên access token hết hạn sau 24 giờ là bị đá ra /login).
 *
 * MỘT lần làm mới cho mọi request cùng gặp 401. Backend xoay refresh token mỗi
 * lần dùng và coi token đã dùng mà bị gửi lại là bị đánh cắp: nó thu hồi MỌI
 * phiên của người đó. Năm request song song tự làm mới riêng thì bốn cái gửi
 * token cũ, và người dùng bị đăng xuất khỏi mọi máy.
 *
 * Dùng axios trần, không qua `http`: interceptor 401 của `http` gọi lại hàm
 * này, đi qua nó thì một refresh token hỏng sẽ vòng mãi.
 *
 * Trả về access token mới, hoặc null khi không làm mới được (chưa có refresh
 * token, phiên đã bị thu hồi, hết hạn): nơi gọi khi đó xoá phiên như cũ.
 */
let inFlight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) return null;
  const tokenBefore = readToken();
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 15000 });
    const { access_token, refresh_token } = res.data?.data ?? {};
    if (!access_token) return null;
    updateStoredToken(access_token, refresh_token);
    return access_token;
  } catch (err: any) {
    // 409: tab khác vừa làm mới bằng chính token này (backend cho một khoảng
    // ân hạn). Tab đó đã ghi token mới vào kho chung, đọc lại mà dùng.
    if (err?.response?.status === 409) {
      const tokenNow = readToken();
      if (tokenNow && tokenNow !== tokenBefore) return tokenNow;
    }
    return null;
  }
}
