import axios from 'axios';
import { API_URL } from './config';
import { clearSession, readToken } from './session';
import { refreshAccessToken } from './token-refresh';

const http = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

http.interceptors.request.use(
  (config) => {
    // readToken xét cả sessionStorage lẫn localStorage. Đọc thẳng localStorage
    // như bản cũ thì ai đăng nhập mà KHÔNG tick "ghi nhớ" sẽ gửi request không
    // kèm token — đăng nhập xong vẫn bị coi là khách.
    const token = readToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    // 401 ở request thường: thử làm mới token MỘT lần rồi gửi lại. Bỏ qua
    // /auth/login (sai mật khẩu cũng là 401, làm mới chẳng giúp gì) và request
    // đã gửi lại rồi (token mới vẫn 401 thì phiên đã chết thật).
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !String(original.url ?? '').includes('/auth/login')
    ) {
      original._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      }
    }
    if (error.response?.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default http;
