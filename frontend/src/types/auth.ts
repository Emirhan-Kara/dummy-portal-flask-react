/**
 * Kimlik doğrulama ile ilgili TypeScript tipleri.
 */

/** Kullanıcı rolleri */
export type UserRole = 'STUDENT' | 'TEACHER';

/** Kullanıcı bilgisi — API'den dönen yapı */
export interface User {
  id: number;
  username: string;
  role: UserRole;
  full_name: string;
  guide_teacher_id: number | null;
}

/** Giriş formu değerleri */
export interface LoginFormValues {
  username: string;
  password: string;
}

/** API yanıt sarmalayıcısı */
export interface ApiResponse<T = undefined> {
  message: string;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

/** Global kimlik doğrulama hafızası (Context) tipi */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  logout: () => Promise<void>;
}

/** AuthProvider bileşeni propları */
export interface AuthProviderProps {
  children: import('react').ReactNode;
}
