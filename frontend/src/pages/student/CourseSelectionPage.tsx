/**
 * Öğrenci Ders Seçim Sayfası.
 * Sol panel: Ders havuzu (seçilebilir dersler)
 * Orta panel: Sepet (seçilmiş ama henüz onaylanmamış dersler)
 * Sağ panel: Kayıtlı Derslerim (onaylanmış dersler)
 * Üst: Kredi çubuğu ve danışman öğretmen seçimi
 *
 * Bu sayfa hiçbir API çağrısı yapmaz.
 * Tüm iş mantığı useSelections ve useAuth hook'larından gelir.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Button,
  CircularProgress,
  Snackbar,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Layout from '../../components/Layout';
import CourseCard from '../../components/CourseCard';
import CreditBar from '../../components/CreditBar';
import TeacherSelect from '../../components/TeacherSelect';
import { useAuth } from '../../hooks/useAuth';
import { useCourses } from '../../hooks/useCourses';
import { useSelections } from '../../hooks/useSelections';
import { getMe } from '../../services/authService';

const CourseSelectionPage = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses();
  const {
    selections,
    credits,
    loading: selectionsLoading,
    isCartLocked,
    submitting,
    snackbar,
    closeSnackbar,
    addSelection,
    removeSelection,
    submitSelections,
  } = useSelections();

  const [guideTeacherId, setGuideTeacherId] = useState<number | null>(user?.guide_teacher_id ?? null);

  // Seçilmiş ders ID'leri — havuzda zaten seçilmiş dersleri filtrelemek için
  const selectedCourseIds = new Set(selections.map((s) => s.course_id));

  // Reddedilmiş seçimler — havuzda kırmızı gösterilir
  const rejectedSelections = selections.filter((s) => s.status === 'REJECTED');
  const rejectedCourseIds = new Set(rejectedSelections.map((s) => s.course_id));

  // Havuzdaki dersler — seçilmemiş olanlar + reddedilmişler (devre dışı gösterilir)
  const poolCourses = courses.filter(
    (c) => !selectedCourseIds.has(c.id) || rejectedCourseIds.has(c.id)
  );

  // Sepetteki seçimler — APPROVED ve REJECTED hariç (DRAFT, REVISION, PENDING_APPROVAL)
  const cartSelections = selections.filter(
    (s) => s.status !== 'REJECTED' && s.status !== 'APPROVED'
  );

  // Onaylanmış (kayıtlı) dersler
  const approvedSelections = selections.filter((s) => s.status === 'APPROVED');

  // Gönderilecek seçim var mı? (DRAFT veya REVISION)
  const hasSubmittable = selections.some((s) => s.status === 'DRAFT' || s.status === 'REVISION');

  // Danışman öğretmen atandıktan sonra
  const handleTeacherSet = async () => {
    try {
      const response = await getMe();
      if (response.data) {
        setGuideTeacherId(response.data.guide_teacher_id);
      }
    } catch {
    }
  };

  const loading = coursesLoading || selectionsLoading;

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
        Ders Seçimi
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Almak istediğiniz dersleri seçin ve onaya gönderin.
      </Typography>

      {/* Danışman Öğretmen Seçimi */}
      <TeacherSelect
        currentTeacherId={guideTeacherId}
        onTeacherSet={handleTeacherSet}
      />

      {/* Kredi Çubuğu */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <CreditBar credits={credits} />
      </Paper>

      {/* Sepet Kilidi Uyarısı */}
      {isCartLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3 }}>
          Seçimleriniz onay bekliyor. Onay sürecinde sepetinizde değişiklik yapamazsınız.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sol Panel — Ders Havuzu */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📚 Ders Havuzu
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {poolCourses.length === 0 ? (
              <Alert severity="info">Tüm dersler sepetinizde.</Alert>
            ) : (
              poolCourses.map((course) => {
                const isRejected = rejectedCourseIds.has(course.id);
                const rejectedSelection = rejectedSelections.find(
                  (s) => s.course_id === course.id
                );

                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    selection={rejectedSelection}
                    onAdd={!isRejected ? addSelection : undefined}
                    disabled={isCartLocked || !guideTeacherId}
                  />
                );
              })
            )}
          </Box>
        </Grid>

        {/* Orta Panel — Sepet */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🛒 Sepetim
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {cartSelections.length === 0 ? (
              <Alert severity="info">Sepetinizde ders yok. Sol panelden ders ekleyin.</Alert>
            ) : (
              cartSelections.map((selection) => (
                <CourseCard
                  key={selection.id}
                  course={selection.course}
                  selection={selection}
                  onRemove={removeSelection}
                  disabled={isCartLocked}
                />
              ))
            )}
          </Box>

          {/* Gönder Butonu */}
          {cartSelections.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={submitSelections}
                disabled={isCartLocked || !hasSubmittable || !guideTeacherId || submitting}
                sx={{ py: 1.5 }}
              >
                {submitting ? 'Gönderiliyor...' : 'Onaya Gönder'}
              </Button>
            </>
          )}
        </Grid>

        {/* Sağ Panel — Kayıtlı Derslerim (Onaylananlar) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6">
              ✅ Kayıtlı Derslerim
            </Typography>
            {approvedSelections.length > 0 && (
              <Chip
                label={`${approvedSelections.length} ders`}
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {approvedSelections.length === 0 ? (
              <Alert severity="info" icon={<CheckCircleOutlinedIcon />}>
                Henüz onaylanmış dersiniz yok. Derslerinizi seçip onaya gönderin.
              </Alert>
            ) : (
              approvedSelections.map((selection) => (
                <CourseCard
                  key={selection.id}
                  course={selection.course}
                  selection={selection}
                  disabled
                />
              ))
            )}
          </Box>

          {/* Onaylanan derslerin toplam kredisi */}
          {approvedSelections.length > 0 && (
            <Paper
              sx={{
                p: 2,
                mt: 2,
                bgcolor: 'rgba(129,199,132,0.08)',
                border: '1px solid',
                borderColor: 'success.light',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Toplam Kayıtlı Kredi
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight={700}>
                {approvedSelections.reduce((sum, s) => sum + s.course.credits, 0)} Kredi
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Snackbar — işlem bildirimleri */}
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

export default CourseSelectionPage;
