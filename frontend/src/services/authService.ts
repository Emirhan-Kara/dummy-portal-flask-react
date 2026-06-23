/**
 * Kimlik doğrulama API çağrıları.
 */

import api, { TOKEN_COOKIE_NAME } from './api';
import Cookies from 'js-cookie';
import type { User, LoginFormValues, ApiResponse } from '../types/auth';

/** Login yanıtında hem user hem token döner */
interface LoginResponseData {
  user: User;
  token: string;
}

/** Giriş yap — Token'ı cookie'ye yaz, user bilgisini döndür */
export const login = async (values: LoginFormValues): Promise<ApiResponse<User>> => {
  const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', values);
  const { token, user } = response.data.data!;

  // Token'ı cookie'ye yaz
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: 1 / 24, // 1 saat
    path: '/',
    sameSite: 'Lax',
  });

  return { message: response.data.message, data: user };
};

/** Çıkış yap — Cookie'yi temizle */
export const logout = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/logout');
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
  return response.data;
};

/** Mevcut kullanıcı bilgisini getir */
export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data;
};
