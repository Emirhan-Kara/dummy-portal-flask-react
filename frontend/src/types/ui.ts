/**
 * Ortak UI (Arayüz) tipleri.
 */

/** Snackbar (bildirim) state tipi */
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}
