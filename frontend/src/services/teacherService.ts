/**
 * Öğretmen değerlendirme API çağrıları.
 */

import api from './api';
import type { PendingStudent, FinalizePayload } from '../types/teacher';
import type { CourseSelection } from '../types/course';
import type { ApiResponse } from '../types/auth';

/** Öğretmene atanmış öğrencileri ve bekleyen seçimlerini getir */
export const getAssignedStudents = async (): Promise<ApiResponse<PendingStudent[]>> => {
  const response = await api.get<ApiResponse<PendingStudent[]>>('/teacher/students');
  return response.data;
};

/** Belirli bir öğrencinin seçimlerini getir */
export const getStudentSelections = async (
  studentId: number
): Promise<ApiResponse<CourseSelection[]>> => {
  const response = await api.get<ApiResponse<CourseSelection[]>>(
    `/teacher/students/${studentId}`
  );
  return response.data;
};

/** Öğretmen kararlarını kaydet (toplu finalize) */
export const finalizeDecisions = async (
  studentId: number,
  payload: FinalizePayload
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>(
    `/teacher/students/${studentId}/finalize`,
    payload
  );
  return response.data;
};
