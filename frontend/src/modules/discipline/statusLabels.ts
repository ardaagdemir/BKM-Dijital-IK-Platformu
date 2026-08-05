import type { ChipProps } from '@mui/material/Chip'
import type { DisciplinaryCaseStatus } from './types'

// `leave.statusLabels.ts`'teki AYNI desen.
export const DISCIPLINARY_CASE_STATUS_LABELS: Record<DisciplinaryCaseStatus, { label: string; color: ChipProps['color'] }> = {
  OPEN: { label: 'Açık', color: 'warning' },
  CLOSED: { label: 'Kapalı', color: 'success' },
}
