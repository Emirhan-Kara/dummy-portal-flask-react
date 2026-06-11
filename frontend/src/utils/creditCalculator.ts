/**
 * Kredi hesaplama yardımcı fonksiyonları.
 * Frontend tarafında hızlı kredi kontrolü için kullanılır.
 */

import type { CourseSelection } from '../types/course';

/** Kredi tüketen durumlar — REJECTED hariç */
const CREDIT_CONSUMING_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REVISION'];

/**
 * Seçimlerin toplam tüketilen kredisini hesapla.
 * REJECTED durumundaki seçimler kredi tüketmez.
 */
export const calculateConsumedCredits = (selections: CourseSelection[]): number => {
  return selections
    .filter((s) => CREDIT_CONSUMING_STATUSES.includes(s.status))
    .reduce((sum, s) => sum + s.course.credits, 0);
};

/**
 * Yeni bir ders eklendiğinde kredi limitini aşıp aşmayacağını kontrol et.
 */
export const wouldExceedLimit = (
  selections: CourseSelection[],
  newCredits: number,
  maxCredits: number = 40
): boolean => {
  const consumed = calculateConsumedCredits(selections);
  return consumed + newCredits > maxCredits;
};
