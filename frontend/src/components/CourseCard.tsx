/**
 * CourseCard bileşeni.
 * Tek bir dersi kart şeklinde gösterir.
 * Ders havuzunda veya sepette kullanılır.
 */

import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusChip from './StatusChip';
import type { Course, CourseSelection } from '../types/course';

interface CourseCardProps {
  course: Course;
  /** Eğer bu ders seçilmişse, seçim bilgisi */
  selection?: CourseSelection;
  /** Sepete ekleme modu */
  onAdd?: (courseId: number) => void;
  /** Sepetten çıkarma modu */
  onRemove?: (selectionId: number) => void;
  /** Kart devre dışı mı? */
  disabled?: boolean;
}

const CourseCard = ({
  course,
  selection,
  onAdd,
  onRemove,
  disabled = false,
}: CourseCardProps) => {
  const isRejected = selection?.status === 'REJECTED';

  return (
    <Card
      sx={{
        opacity: disabled || isRejected ? 0.6 : 1,
        border: isRejected ? '2px solid' : '1px solid',
        borderColor: isRejected ? 'error.main' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: disabled || isRejected ? 'none' : 'translateY(-2px)',
          boxShadow: disabled || isRejected ? undefined : '0 4px 20px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip label={course.code} size="small" variant="outlined" color="primary" />
              <Chip label={`${course.credits} Kredi`} size="small" variant="filled" color="secondary" />
            </Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
              {course.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.instructor}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Durum chip'i — sadece seçim varsa */}
            {selection && <StatusChip status={selection.status} />}

            {/* Sepete ekle butonu */}
            {onAdd && !isRejected && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => onAdd(course.id)}
                disabled={disabled}
              >
                Ekle
              </Button>
            )}

            {/* Sepetten çıkar butonu — sadece DRAFT veya REVISION */}
            {onRemove && selection && ['DRAFT', 'REVISION'].includes(selection.status) && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onRemove(selection.id)}
                disabled={disabled}
              >
                Çıkar
              </Button>
            )}
          </Box>
        </Box>

        {/* Öğretmen notu — REVISION */}
        {selection?.teacher_note && selection.status === 'REVISION' && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Öğretmen Notu:</strong> {selection.teacher_note}
            </Typography>
          </Alert>
        )}

        {/* Reddedilme notu — REJECTED */}
        {selection?.teacher_note && selection.status === 'REJECTED' && (
          <Alert severity="error" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Red Nedeni:</strong> {selection.teacher_note}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
