/**
 * Öğretmen listesi hook'u.
 * Danışman öğretmen seçimi için öğretmen listesini API'den çeker
 * ve danışman atama işlemini yönetir.
 * TeacherSelect bileşeni bu hook'tan dönen veriyi kullanır.
 */

import { useState, useEffect, useCallback } from 'react';
import type { TeacherOption } from '../types/teacher';
import * as selectionService from '../services/selectionService';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Öğretmen listesini API'den çeker */
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await selectionService.getTeachers();
        if (response.data) {
          setTeachers(response.data);
        }
      } catch {
        setError('Öğretmen listesi yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  /** Danışman öğretmeni atar */
  const setGuideTeacher = useCallback(async (teacherId: number) => {
    try {
      setSaving(true);
      setError(null);
      await selectionService.setGuideTeacher(teacherId);
    } catch {
      setError('Danışman öğretmen atanamadı.');
      throw new Error('Danışman öğretmen atanamadı.');
    } finally {
      setSaving(false);
    }
  }, []);

  return { teachers, loading, saving, error, setGuideTeacher };
};
