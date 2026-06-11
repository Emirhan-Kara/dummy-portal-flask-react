/**
 * Ders ve ders seçimi ile ilgili TypeScript tipleri.
 */

/** Ders seçim durumları */
export type SelectionStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REVISION'
  | 'REJECTED';

/** Ders bilgisi — API'den dönen yapı */
export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  instructor: string;
}

/** Ders seçimi — junction table kaydı */
export interface CourseSelection {
  id: number;
  student_id: number;
  course_id: number;
  status: SelectionStatus;
  teacher_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  course: Course;
}

/** Kredi bilgisi */
export interface CreditInfo {
  consumed: number;
  remaining: number;
  max: number;
}

/** MUI Chip statü konfigürasyonu */
export interface StatusConfig {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}
