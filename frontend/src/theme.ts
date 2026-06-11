/**
 * MUI tema konfigürasyonu.
 * Uygulamanın genel renk şeması ve tipografi ayarları.
 */

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9bbaa2',   // Pastel Sage Green
      light: '#c0dec5',
      dark: '#6e8f75',
    },
    secondary: {
      main: '#8fbc8f',   // Monochromatic dark sea green
      light: '#bfe3bf',
      dark: '#628a62',
    },
    background: {
      default: '#f4f9f5', // Very faint green tint
      paper: '#ffffff',
    },
    success: {
      main: '#81c784',
    },
    warning: {
      main: '#ffb74d',
    },
    error: {
      main: '#e57373',
    },
    info: {
      main: '#64b5f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
