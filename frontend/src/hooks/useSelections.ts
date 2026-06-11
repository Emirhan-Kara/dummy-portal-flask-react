/**
 * Ders seçimi hook'u.
 * Öğrencinin seçimlerini, kredi bilgisini ve sepet işlemlerini yönetir.
 * Tüm API çağrıları ve iş mantığı bu hook içinde kapsüllenmiştir.
 * Sayfa (Page) katmanı sadece bu hook'tan dönen fonksiyonları çağırır.
 */

import { useState, useEffect, useCallback } from 'react';
import type { CourseSelection, CreditInfo } from '../types/course';
import type { SnackbarState } from '../types/ui';
import * as selectionService from '../services/selectionService';


export const useSelections = () => {
  const [selections, setSelections] = useState<CourseSelection[]>([]);
  const [credits, setCredits] = useState<CreditInfo>({ consumed: 0, remaining: 40, max: 40 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Seçimleri ve kredi bilgisini API'den çeker */
  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      // Seçimleri ve kredi bilgisini paralel getir
      const [selectionsRes, creditsRes] = await Promise.all([
        selectionService.getSelections(),
        selectionService.getCredits(),
      ]);

      if (selectionsRes.data) {
        setSelections(selectionsRes.data);
      }
      if (creditsRes.data) {
        setCredits(creditsRes.data);
      }
    } catch {
      setError('Seçimler yüklenirken hata oluştu.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Snackbar'ı kapatır */
  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  /** Axios hatasından mesaj çıkarır */
  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      return axiosErr.response?.data?.error || fallback;
    }
    return fallback;
  };

  /** Sepete ders ekler */
  const addSelection = useCallback(async (courseId: number) => {
    try {
      await selectionService.addSelection(courseId);
      setSnackbar({ open: true, message: 'Ders sepete eklendi.', severity: 'success' });
      fetchAll(true);
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: extractErrorMessage(err, 'Ders eklenemedi.'),
        severity: 'error',
      });
    }
  }, [fetchAll]);

  /** Sepetten ders çıkarır */
  const removeSelection = useCallback(async (selectionId: number) => {
    try {
      await selectionService.removeSelection(selectionId);
      setSnackbar({ open: true, message: 'Ders sepetten çıkarıldı.', severity: 'success' });
      fetchAll(true);
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: extractErrorMessage(err, 'Ders çıkarılamadı.'),
        severity: 'error',
      });
    }
  }, [fetchAll]);

  /** Seçimleri onaya gönderir */
  const submitSelections = useCallback(async () => {
    try {
      setSubmitting(true);
      await selectionService.submitSelections();
      setSnackbar({ open: true, message: 'Ders seçimleri onaya gönderildi!', severity: 'success' });
      fetchAll(true);
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: extractErrorMessage(err, 'Gönderim başarısız.'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [fetchAll]);

  // Sepet kilitli mi? — PENDING_APPROVAL durumunda olan seçim varsa
  const isCartLocked = selections.some((s) => s.status === 'PENDING_APPROVAL');

  return {
    selections,
    credits,
    loading,
    error,
    isCartLocked,
    submitting,
    snackbar,
    closeSnackbar,
    refetch: fetchAll,
    addSelection,
    removeSelection,
    submitSelections,
  };
};
