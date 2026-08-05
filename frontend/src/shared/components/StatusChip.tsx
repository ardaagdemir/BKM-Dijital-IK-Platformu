import Chip from '@mui/material/Chip'
import type { ChipProps } from '@mui/material/Chip'

type StatusChipProps = {
  label: string
  color: ChipProps['color']
}

// Bölüm 9'da önceden onaylanmış ortak bileşen ("Durum gösterge — izin/aday
// aşaması vb."), ilk gerçek ihtiyacında (14.3, izin talebi durumu) inşa
// edildi. BİLİNÇLİ OLARAK ince bir sarmalayıcı: durum→{label,color}
// eşlemesi HER MODÜLE ÖZGÜ (bkz. leave/statusLabels.ts) — burası yalnızca
// TEK bir görsel stili (boyut/variant) merkezi tutar.
export function StatusChip({ label, color }: StatusChipProps) {
  return <Chip label={label} color={color} size="small" variant="filled" />
}
