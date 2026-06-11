/**
 * Ders listeleme API çağrıları.
 */

import api from './api';
import type { Course } from '../types/course';
import type { ApiResponse } from '../types/auth';

/** Tüm dersleri getir */
export const getAllCourses = async (): Promise<ApiResponse<Course[]>> => {
  const response = await api.get<ApiResponse<Course[]>>('/courses/');
  return response.data;
};
