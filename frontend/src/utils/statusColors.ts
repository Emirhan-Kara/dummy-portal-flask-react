/**
 * Durum renklerini ve etiketlerini tanımlayan yardımcı modül.
 * StatusChip bileşeni bu değerleri kullanır.
 */

import type { SelectionStatus, StatusConfig } from '../types/course';

/** Her durum için renk ve Türkçe etiket eşleştirmesi */
export const STATUS_CONFIG: Record<SelectionStatus, StatusConfig> = {
  DRAFT: {
    label: 'Taslak',
    color: 'default',
  },
  PENDING_APPROVAL: {
    label: 'Onay Bekliyor',
    color: 'warning',
  },
  APPROVED: {
    label: 'Onaylandı',
    color: 'success',
  },
  REVISION: {
    label: 'Revizyon',
    color: 'info',
  },
  REJECTED: {
    label: 'Reddedildi',
    color: 'error',
  },
};
