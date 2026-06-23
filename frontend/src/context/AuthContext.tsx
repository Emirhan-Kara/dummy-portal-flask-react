/**
 * Kimlik doğrulama Context'i.
 * Uygulama genelinde kullanıcı oturumu, giriş ve çıkış işlemlerini yönetir.
 * JWT token frontend tarafından cookie'de saklanır.
 */

import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Cookies from 'js-cookie';
import type { User, LoginFormValues, AuthContextType, AuthProviderProps } from '../types/auth';
import * as authService from '../services/authService';
import { TOKEN_COOKIE_NAME } from '../services/api';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { },
  logout: async () => { },
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sayfa yüklendiğinde mevcut oturumu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      // Cookie yoksa API'ye istek atmaya gerek yok
      const token = Cookies.get(TOKEN_COOKIE_NAME);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data) {
          setUser(response.data);
        }
      } catch {
        // 401 dönerse token geçersiz. cookie'yi temizle
        Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // login işlemi
  const login = useCallback(async (values: LoginFormValues) => {
    const response = await authService.login(values);
    if (response.data) {
      setUser(response.data);
    }
  }, []);

  // logout işlemi
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // API hatası olsa bile cookie'yi temizle
      Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
