'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import http from '@/lib/http';
import {
  clearSession,
  readSession,
  updateStoredUser,
  writeSession,
  type StoredUser,
} from '@/lib/session';

export type IUser = StoredUser;

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  /**
   * `remember` mặc định true để mọi nơi gọi cũ giữ nguyên hành vi. Chỉ trang
   * đăng nhập truyền false, khi người dùng bỏ tick "ghi nhớ đăng nhập".
   */
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: IUser) => void;
  isAuthenticated: boolean;
  /**
   * false cho tới khi đã đọc xong localStorage.
   *
   * PHẢI kiểm cờ này trước khi kết luận "chưa đăng nhập". Trên server và ở lần
   * render đầu phía client, token luôn là null vì localStorage chưa đọc được —
   * ai đá người dùng về /login dựa vào isAuthenticated lúc đó là đá nhầm người
   * đang đăng nhập.
   */
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token: storedToken, user: storedUser } = readSession();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    const res = await http.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data.data;
    writeSession(access_token, userData, remember);
    setToken(access_token);
    setUser(userData);
  };

  const register = async (full_name: string, email: string, password: string) => {
    await http.post('/auth/register', { full_name, email, password });
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (userData: IUser) => {
    setUser(userData);
    // Ghi lại đúng kho đang giữ phiên. Ghi cứng vào localStorage như bản cũ thì
    // ai đăng nhập không-ghi-nhớ, sau khi sửa hồ sơ, sẽ để lại dấu vết tài khoản
    // trên máy — đúng thứ họ vừa từ chối.
    updateStoredUser(userData);
  };

  // KHÔNG `if (loading) return null`.
  //
  // Dòng đó từng làm CẢ SITE không server-render lấy một thẻ nào: trên server
  // `loading` luôn true (effect không chạy), nên provider trả về null và toàn
  // bộ cây component bên dưới biến mất khỏi HTML. Đo được: mọi trang trả về
  // tài liệu chỉ có <script>, đếm được 0 thẻ <div>. Hậu quả là trang sản phẩm
  // không index được, và người dùng nhìn màn trắng cho tới khi JS tải xong.
  //
  // Nay luôn render children; nơi nào cần biết đã đọc xong localStorage chưa
  // thì đọc `authReady`.
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token,
        authReady: !loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
