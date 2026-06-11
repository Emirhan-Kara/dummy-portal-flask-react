/**
 * ProtectedRoute bileşeni.
 * Rol tabanlı erişim kontrolü — yetkisiz kullanıcıları giriş sayfasına yönlendirir.
 */

import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Yükleniyor — oturum kontrolü henüz tamamlanmadı
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Giriş yapmamış — login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Yetkisiz rol — login sayfasına yönlendir
  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
