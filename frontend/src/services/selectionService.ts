/**
 * Ders seçimi (sepet) API çağrıları.
 */

import api from './api';
import type { CourseSelection, CreditInfo } from '../types/course';
import type { TeacherOption } from '../types/teacher';
import type { ApiResponse } from '../types/auth';

/** Öğrencinin tüm seçimlerini getir */
export const getSelections = async (): Promise<ApiResponse<CourseSelection[]>> => {
  const response = await api.get<ApiResponse<CourseSelection[]>>('/selections/');
  return response.data;
};

/** Sepete ders ekle */
export const addSelection = async (courseId: number): Promise<ApiResponse<CourseSelection>> => {
  const response = await api.post<ApiResponse<CourseSelection>>('/selections/', {
    course_id: courseId,
  });
  return response.data;
};

/** Sepetten ders çıkar */
export const removeSelection = async (selectionId: number): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/selections/${selectionId}`);
  return response.data;
};

/** Seçimleri onaya gönder */
export const submitSelections = async (): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/selections/submit');
  return response.data;
};

/** Kredi durumunu getir */
export const getCredits = async (): Promise<ApiResponse<CreditInfo>> => {
  const response = await api.get<ApiResponse<CreditInfo>>('/selections/credits');
  return response.data;
};

/** Seçilebilir öğretmenleri getir */
export const getTeachers = async (): Promise<ApiResponse<TeacherOption[]>> => {
  const response = await api.get<ApiResponse<TeacherOption[]>>('/students/teachers');
  return response.data;
};

/** Danışman öğretmen ata */
export const setGuideTeacher = async (teacherId: number): Promise<ApiResponse> => {
  const response = await api.put<ApiResponse>('/students/guide-teacher', {
    teacher_id: teacherId,
  });
  return response.data;
};
