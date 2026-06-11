/**
 * Öğretmen değerlendirme hook'u.
 * Öğretmenin danışman olduğu öğrencileri, seçimlerini ve karar verme
 * sürecinin tüm iş mantığını yönetir.
 * ReviewPage bu hook'tan dönen veri ve fonksiyonları kullanır.
 */

import { useState, useEffect, useCallback } from 'react';
import type { PendingStudent, Decision, TeacherAction } from '../types/teacher';
import type { CourseSelection } from '../types/course';
import type { SnackbarState } from '../types/ui';
import * as teacherService from '../services/teacherService';


export const useTeacherReview = () => {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentSelections, setStudentSelections] = useState<CourseSelection[]>([]);
  const [selectionsLoading, setSelectionsLoading] = useState<boolean>(false);
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Snackbar'ı kapatır */
  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  /** Öğrenci listesini API'den çeker */
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAssignedStudents();
      if (response.data) {
        setStudents(response.data);
      }
    } catch {
      setSnackbar({ open: true, message: 'Öğrenci listesi yüklenemedi.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /** Seçili öğrencinin ders seçimlerini yükler */
  const selectStudent = useCallback(async (studentId: number) => {
    setSelectedStudentId(studentId);
    setDecisions({});

    try {
      setSelectionsLoading(true);
      const response = await teacherService.getStudentSelections(studentId);
      if (response.data) {
        setStudentSelections(response.data);

        // Sadece PENDING_APPROVAL olanlar için karar alanı oluştur
        const pendingSelections = response.data.filter(
          (s) => s.status === 'PENDING_APPROVAL'
        );
        const initialDecisions: Record<number, Decision> = {};
        pendingSelections.forEach((s) => {
          initialDecisions[s.id] = {
            selection_id: s.id,
            action: '' as TeacherAction,
            teacher_note: null,
          };
        });
        setDecisions(initialDecisions);
      }
    } catch {
      setSnackbar({ open: true, message: 'Öğrenci seçimleri yüklenemedi.', severity: 'error' });
    } finally {
      setSelectionsLoading(false);
    }
  }, []);

  /** Bir ders için karar (action) değişikliğini hafızaya yazar */
  const updateAction = useCallback((selectionId: number, action: TeacherAction) => {
    setDecisions((prev) => ({
      ...prev,
      [selectionId]: {
        ...prev[selectionId],
        action,
        // APPROVED seçildiğinde notu temizle
        teacher_note: action === 'APPROVED' ? null : prev[selectionId]?.teacher_note || null,
      },
    }));
  }, []);

  /** Bir ders için öğretmen notunu hafızaya yazar */
  const updateNote = useCallback((selectionId: number, note: string) => {
    setDecisions((prev) => ({
      ...prev,
      [selectionId]: {
        ...prev[selectionId],
        teacher_note: note || null,
      },
    }));
  }, []);

  // Tüm kararlar verilmiş mi kontrol et
  const allDecided = Object.values(decisions).every((d) => d.action !== '');

  // REVISION/REJECTED kararlarında not zorunlu mu kontrol et
  const allNotesProvided = Object.values(decisions).every((d) => {
    if (d.action === 'REVISION' || d.action === 'REJECTED') {
      return d.teacher_note && d.teacher_note.trim().length > 0;
    }
    return true;
  });

  const canFinalize = allDecided && allNotesProvided && Object.keys(decisions).length > 0;

  // Bekleyen ve geçmiş seçimler
  const pendingSelections = studentSelections.filter((s) => s.status === 'PENDING_APPROVAL');
  const pastSelections = studentSelections.filter((s) => s.status !== 'PENDING_APPROVAL');

  /** Değerlendirmeyi tamamlar ve API'ye gönderir */
  const finalize = useCallback(async () => {
    if (!selectedStudentId || !canFinalize) return;

    try {
      setSubmitting(true);
      await teacherService.finalizeDecisions(selectedStudentId, {
        decisions: Object.values(decisions),
      });
      setSnackbar({ open: true, message: 'Değerlendirme başarıyla tamamlandı!', severity: 'success' });

      // Listeyi yenile ve seçimi temizle
      setSelectedStudentId(null);
      setStudentSelections([]);
      setDecisions({});
      fetchStudents();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setSnackbar({
        open: true,
        message: axiosErr.response?.data?.error || 'Değerlendirme kaydedilemedi.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedStudentId, canFinalize, decisions, fetchStudents]);

  return {
    // Veri (Data)
    students,
    loading,
    selectedStudentId,
    studentSelections,
    selectionsLoading,
    decisions,
    submitting,
    snackbar,
    pendingSelections,
    pastSelections,
    // Durum (Flags)
    allDecided,
    allNotesProvided,
    canFinalize,
    // Eylemler (Actions)
    closeSnackbar,
    selectStudent,
    updateAction,
    updateNote,
    finalize,
  };
};
