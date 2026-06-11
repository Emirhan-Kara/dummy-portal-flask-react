/**
 * Layout bileşeni.
 * Uygulama kabuğu — üst navbar, çıkış butonu ve sayfa içeriği.
 */

import { AppBar, Toolbar, Typography, Button, Box, Container, Chip } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Çıkış hatası — sessizce yoksay
    }
  };

  // Rol etiketini Türkçe göster
  const roleLabel = user?.role === 'STUDENT' ? 'Öğrenci' : 'Öğretmen';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#93dba2ff',
          borderBottom: '1px solid rgba(155,186,162,0.3)',
        }}
      >
        <Toolbar>
          <SchoolIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Ders Seçim Portalı
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">{user.full_name}</Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  fontWeight: 600,
                }}
              />
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                size="small"
              >
                Çıkış
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, px: '10%', flex: 1, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
