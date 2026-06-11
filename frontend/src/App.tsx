/**
 * Ana uygulama bileşeni — rota yapılandırması ve global provider'lar.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CourseSelectionPage from './pages/student/CourseSelectionPage';
import ReviewPage from './pages/teacher/ReviewPage';

/**
 * GuestRoute — giriş yapmış kullanıcıyı otomatik yönlendirir, giriş yapmamışsa sayfayı (login) gösterir.
 */
const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <RoleBasedRedirect />;
  return children;
};

/**
 * RoleBasedRedirect — giriş yapmış kullanıcıyı rolüne göre yönlendirir.
 */
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'STUDENT') return <Navigate to="/student/courses" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher/review" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Giriş sayfası — Misafir koruması altında */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

            {/* Öğrenci sayfası */}
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRole="STUDENT">
                  <CourseSelectionPage />
                </ProtectedRoute>
              }
            />

            {/* Öğretmen sayfası */}
            <Route
              path="/teacher/review"
              element={
                <ProtectedRoute allowedRole="TEACHER">
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            {/* Kök rota — role göre yönlendirme */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Bilinmeyen rotalar → login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
