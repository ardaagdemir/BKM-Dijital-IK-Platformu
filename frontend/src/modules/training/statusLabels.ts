import type { ChipProps } from '@mui/material/Chip'
import type { TrainingEnrollmentStatus } from './types'

// `leave.statusLabels.ts`'teki AYNI desen.
export const TRAINING_ENROLLMENT_STATUS_LABELS: Record<
  TrainingEnrollmentStatus,
  { label: string; color: ChipProps['color'] }
> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
  COMPLETED: { label: 'Tamamlandı', color: 'info' },
}
