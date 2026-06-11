/**
 * Öğretmen Değerlendirme Sayfası.
 * Sol panel: Danışman olunan öğrenciler listesi
 * Sağ panel: Seçili öğrencinin bekleyen dersleri + karar formu
 *
 * Bu sayfa hiçbir API çağrısı yapmaz.
 * Tüm iş mantığı useTeacherReview hook'undan gelir.
 */

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import Layout from '../../components/Layout';
import StatusChip from '../../components/StatusChip';
import type { TeacherAction } from '../../types/teacher';
import { useTeacherReview } from '../../hooks/useTeacherReview';

const ReviewPage = () => {
  const {
    students,
    loading,
    selectedStudentId,
    selectionsLoading,
    decisions,
    submitting,
    snackbar,
    pendingSelections,
    pastSelections,
    allDecided,
    allNotesProvided,
    canFinalize,
    closeSnackbar,
    selectStudent,
    updateAction,
    updateNote,
    finalize,
  } = useTeacherReview();

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Ders Değerlendirme
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Danışmanı olduğunuz öğrencilerin ders seçimlerini değerlendirin.
      </Typography>

      {students.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Şu anda onay bekleyen ders seçimi olan öğrenciniz bulunmamaktadır.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sol Panel — Öğrenci Listesi */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            👨‍🎓 Öğrenciler
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {students.map((ps) => (
              <Card
                key={ps.student.id}
                sx={{
                  border: selectedStudentId === ps.student.id ? '2px solid' : '1px solid',
                  borderColor: selectedStudentId === ps.student.id ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                }}
              >
                <CardActionArea onClick={() => selectStudent(ps.student.id)}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {ps.student.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{ps.student.username}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${ps.pending_selections.length} ders`}
                        size="small"
                        color="warning"
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Sağ Panel — Ders Değerlendirme Formu */}
        <Grid size={{ xs: 12, md: 8 }}>
          {!selectedStudentId ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Değerlendirmek için sol panelden bir öğrenci seçin.
              </Typography>
            </Paper>
          ) : selectionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Bekleyen Dersler */}
              {pendingSelections.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    ⏳ Onay Bekleyen Dersler
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {pendingSelections.map((selection) => (
                      <Card key={selection.id} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                              <Chip label={selection.course.code} size="small" variant="outlined" color="primary" />
                              <Chip label={`${selection.course.credits} Kredi`} size="small" color="secondary" />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {selection.course.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selection.course.instructor}
                            </Typography>
                          </Box>
                          <StatusChip status={selection.status} />
                        </Box>

                        {/* Karar Seçimi */}
                        <FormControl sx={{ width: '100%' }}>
                          <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Kararınız</FormLabel>
                          <RadioGroup
                            row
                            value={decisions[selection.id]?.action || ''}
                            onChange={(e) =>
                              updateAction(selection.id, e.target.value as TeacherAction)
                            }
                          >
                            <FormControlLabel
                              value="APPROVED"
                              control={<Radio color="success" />}
                              label="Onayla"
                            />
                            <FormControlLabel
                              value="REVISION"
                              control={<Radio color="info" />}
                              label="Revizyon"
                            />
                            <FormControlLabel
                              value="REJECTED"
                              control={<Radio color="error" />}
                              label="Reddet"
                            />
                          </RadioGroup>
                        </FormControl>

                        {/* Dinamik Not Alanı — sadece REVISION veya REJECTED seçildiğinde */}
                        {decisions[selection.id]?.action &&
                          decisions[selection.id].action !== 'APPROVED' && (
                            <TextField
                              label="Öğretmen Notu (zorunlu)"
                              multiline
                              rows={2}
                              fullWidth
                              size="small"
                              sx={{ mt: 1.5 }}
                              value={decisions[selection.id]?.teacher_note || ''}
                              onChange={(e) => updateNote(selection.id, e.target.value)}
                              error={
                                !decisions[selection.id]?.teacher_note?.trim()
                              }
                              helperText={
                                !decisions[selection.id]?.teacher_note?.trim()
                                  ? 'Bu karar için not yazmanız zorunludur.'
                                  : ''
                              }
                            />
                          )}
                      </Card>
                    ))}
                  </Box>

                  {/* Finalize Butonu */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    color="primary"
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <GavelIcon />}
                    onClick={finalize}
                    disabled={!canFinalize || submitting}
                    sx={{ py: 1.5 }}
                  >
                    {submitting ? 'Kaydediliyor...' : 'Değerlendirmeyi Tamamla'}
                  </Button>

                  {!allDecided && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Tüm dersler için karar vermelisiniz. Kısmi değerlendirme yapılamaz.
                    </Alert>
                  )}
                  {allDecided && !allNotesProvided && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Revizyon ve red kararları için öğretmen notu zorunludur.
                    </Alert>
                  )}
                </>
              )}

              {/* Geçmiş Kararlar */}
              {pastSelections.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Geçmiş Kararlar
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {pastSelections.map((selection) => (
                      <Card key={selection.id} sx={{ p: 2, opacity: 0.7 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {selection.course.code} — {selection.course.name}
                            </Typography>
                            {selection.teacher_note && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Not: {selection.teacher_note}
                              </Typography>
                            )}
                          </Box>
                          <StatusChip status={selection.status} />
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ReviewPage;
