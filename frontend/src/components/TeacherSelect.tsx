/**
 * TeacherSelect bileşeni.
 * Öğrencinin danışman öğretmen seçmesi için dropdown.
 * Danışman atanmamışsa bu bileşen zorunlu olarak gösterilir.
 *
 * Bu bileşen hiçbir API çağrısı yapmaz.
 * Tüm veri ve işlemler useTeachers hook'undan gelir.
 */

import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  CircularProgress,
  type SelectChangeEvent,
} from '@mui/material';
import { useTeachers } from '../hooks/useTeachers';

interface TeacherSelectProps {
  currentTeacherId: number | null;
  onTeacherSet: () => void;
}

const TeacherSelect = ({ currentTeacherId, onTeacherSet }: TeacherSelectProps) => {
  const { teachers, loading, saving, error, setGuideTeacher } = useTeachers();
  const [selectedId, setSelectedId] = useState<string>('');

  // Mevcut danışman varsa seçili göster
  useEffect(() => {
    if (currentTeacherId) {
      setSelectedId(String(currentTeacherId));
    }
  }, [currentTeacherId]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedId(event.target.value);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    try {
      await setGuideTeacher(Number(selectedId));
      onTeacherSet();
    } catch {
      // Hata useTeachers hook'u tarafından yönetilir
    }
  };

  if (loading) {
    return <CircularProgress size={24} />;
  }

  // Eğer danışman atanmışsa, sadece adını göster ve seçimi kilitle
  if (currentTeacherId) {
    const teacher = teachers.find((t) => t.id === currentTeacherId);
    return (
      <Box sx={{ mb: 3 }}>
        <Alert severity="info" sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <strong>Danışman Öğretmen:</strong> {teacher?.full_name || 'Yükleniyor...'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Ders seçimi yapabilmek için önce bir danışman öğretmen seçmelisiniz.
      </Alert>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel id="teacher-select-label">Danışman Öğretmen</InputLabel>
          <Select
            labelId="teacher-select-label"
            id="teacher-select"
            value={selectedId}
            label="Danışman Öğretmen"
            onChange={handleChange}
          >
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={String(teacher.id)}>
                {teacher.full_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!selectedId || saving}
          size="small"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </Box>
    </Box>
  );
};

export default TeacherSelect;
