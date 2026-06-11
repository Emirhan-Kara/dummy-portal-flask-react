/**
 * StatusChip bileşeni.
 * Ders seçim durumunu renkli bir Chip olarak gösterir.
 */

import { Chip } from '@mui/material';
import type { SelectionStatus } from '../types/course';
import { STATUS_CONFIG } from '../utils/statusColors';

interface StatusChipProps {
  status: SelectionStatus;
}

const StatusChip = ({ status }: StatusChipProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

export default StatusChip;
