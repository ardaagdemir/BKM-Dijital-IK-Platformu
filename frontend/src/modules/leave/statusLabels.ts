import type { ChipProps } from '@mui/material/Chip'
import type { LeaveRequestStatus } from './types'

// `StatusChip`in bu modüle özgü durum→{etiket,renk} eşlemesi (bkz.
// shared/components/StatusChip.tsx'teki not: eşleme HER MODÜLE ÖZGÜ tutulur).
export const LEAVE_STATUS_LABELS: Record<LeaveRequestStatus, { label: string; color: ChipProps['color'] }> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
}
