import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TOPBAR_HEIGHT } from './layout.constants'

// Görev: "Masaüstü sidebar'ın üstüne ürün adı ekle: 'Dijital İK', altına
// küçük şekilde 'İnsan Kaynakları Platformu' yaz." — `compact` (rail/ikon-only)
// modda alt başlık HİÇ gösterilmez, yalnızca ikon (yer yok); genişletilmiş
// modda ürün adı + alt başlık İKİ satır olarak gösterilir.
export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        minHeight: TOPBAR_HEIGHT,
        px: compact ? 0 : 2.5,
        py: compact ? 0 : 1,
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'flex-start',
      }}
    >
      <BusinessCenterOutlinedIcon color="primary" />
      {!compact && (
        <Stack spacing={0} sx={{ lineHeight: 1.1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }} noWrap>
            Dijital İK
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }} noWrap>
            İnsan Kaynakları Platformu
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
