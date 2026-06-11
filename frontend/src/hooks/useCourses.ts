/**
 * Ders listesi hook'u.
 * Tüm dersleri API'den çeker ve state'te tutar.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Course } from '../types/course';
import * as courseService from '../services/courseService';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getAllCourses();
      if (response.data) {
        setCourses(response.data);
      }
    } catch {
      setError('Dersler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* useEffectin içinde dıştan bir fonksiyon çağırıyoruz. 
   * Bu fonksiyonun ref'i her renderda değişir. 
   * useEffectin dependency arrayine fetchCourses'i ekleyerek 
   * sonsuz döngüyü engelliyoruz.
   */
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};
