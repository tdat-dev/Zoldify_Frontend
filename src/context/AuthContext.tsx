'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import http from '@/lib/http';

export interface IUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
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
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await http.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const register = async (full_name: string, email: string, password: string) => {
    await http.post('/auth/register', { full_name, email, password });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (userData: IUser) => {
  setUser(userData);
  localStorage.setItem('user', JSON.stringify(userData));
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
