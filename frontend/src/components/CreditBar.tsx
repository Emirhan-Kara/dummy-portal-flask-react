/**
 * CreditBar bileşeni.
 * Öğrencinin kredi kullanım durumunu görsel bir ilerleme çubuğu ile gösterir.
 */

import { Box, LinearProgress, Typography } from '@mui/material';
import type { CreditInfo } from '../types/course';

interface CreditBarProps {
  credits: CreditInfo;
}

const CreditBar = ({ credits }: CreditBarProps) => {
  // Yüzde hesapla (0-100 arası)
  const percentage = Math.min((credits.consumed / credits.max) * 100, 100);

  // Renk belirleme — %80 üstü uyarı, %100 kırmızı
  const getColor = (): 'success' | 'warning' | 'error' => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Kredi Durumu
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {credits.consumed} / {credits.max} kredi
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getColor()}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: 'rgba(0,0,0,0.08)',
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Kalan: {credits.remaining} kredi
      </Typography>
    </Box>
  );
};

export default CreditBar;
