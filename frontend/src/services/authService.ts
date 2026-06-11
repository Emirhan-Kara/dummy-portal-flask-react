/**
 * Kimlik doğrulama API çağrıları.
 */

import api from './api';
import type { User, LoginFormValues, ApiResponse } from '../types/auth';

/** Giriş yap — JWT cookie olarak ayarlanır */
export const login = async (values: LoginFormValues): Promise<ApiResponse<User>> => {
  const response = await api.post<ApiResponse<User>>('/auth/login', values);
  return response.data;
};

/** Çıkış yap — JWT cookie temizlenir */
export const logout = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/auth/logout');
  return response.data;
};

/** Mevcut kullanıcı bilgisini getir */
export const getMe = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data;
};
