/**
 * Öğretmen paneli ile ilgili TypeScript tipleri.
 */

import type { User } from './auth';
import type { CourseSelection } from './course';

/** Öğretmene atanmış öğrenci ve bekleyen seçimleri */
export interface PendingStudent {
  student: User;
  pending_selections: CourseSelection[];
}

/** Öğretmen aksiyonları */
export type TeacherAction = 'APPROVED' | 'REVISION' | 'REJECTED';

/** Tek bir ders için öğretmen kararı */
export interface Decision {
  selection_id: number;
  action: TeacherAction;
  teacher_note: string | null;
}

/** Toplu değerlendirme payload'ı */
export interface FinalizePayload {
  decisions: Decision[];
}

/** Seçilebilir öğretmen bilgisi (dropdown için) */
export interface TeacherOption {
  id: number;
  full_name: string;
}
