/**
 * Giriş sayfası.
 * Formik + Yup ile form validasyonu.
 * Başarılı girişte App.tsx'teki GuestRoute otomatik yönlendirme yapar.
 */

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../hooks/useAuth';
import type { LoginFormValues } from '../types/auth';

// Yup şema
const loginSchema = Yup.object().shape({
  username: Yup.string().required('Kullanıcı adı zorunludur.'),
  password: Yup.string().required('Şifre zorunludur.'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        await login(values);

      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setError(axiosErr.response?.data?.error || 'Giriş başarısız.');
        } else {
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f4f9f5',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,186,162,0.25) 0%, transparent 70%)',
          top: -100,
          right: -80,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(143,188,143,0.20) 0%, transparent 70%)',
          bottom: -60,
          left: -60,
        }}
      />

      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(110,143,117,0.12)',
          border: '1px solid',
          borderColor: 'rgba(155,186,162,0.3)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Üst alan — İkon ve Başlık */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '14px',
                bgcolor: 'rgba(155,186,162,0.15)',
                mb: 1.5,
              }}
            >
              <SchoolIcon sx={{ fontSize: 32, color: 'primary.dark' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Ders Seçim Portalı
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              id="username"
              name="username"
              label="Kullanıcı Adı"
              fullWidth
              margin="normal"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              autoFocus
            />
            <TextField
              id="password"
              name="password"
              label="Şifre"
              type="password"
              fullWidth
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={formik.isSubmitting}
              sx={{ mt: 2, py: 1.5 }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
