/**
 * Kimlik doğrulama Context'i.
 * Uygulama genelinde kullanıcı oturumu, giriş ve çıkış işlemlerini yönetir.
 * JWT token httpOnly cookie'de saklanır — frontend doğrudan erişemez.
 */

import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { User, LoginFormValues, AuthContextType, AuthProviderProps } from '../types/auth';
import * as authService from '../services/authService';

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
      try {
        const response = await authService.getMe();
        if (response.data) {
          setUser(response.data);
        }
      } catch {
        // 401 dönerse kullanıcı giriş yapmamış — normal durum
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
      // API hatası olsa bile session'ı temizle
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
