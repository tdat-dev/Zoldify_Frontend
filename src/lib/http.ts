import axios from 'axios';
import { API_URL } from './config';
import { clearSession, readToken } from './session';

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
  (error) => {
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
