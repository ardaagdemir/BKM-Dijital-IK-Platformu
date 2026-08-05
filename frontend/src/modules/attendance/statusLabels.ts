import type { ChipProps } from '@mui/material/Chip'
import type { TimesheetDayStatus } from './types'

// `leave.statusLabels.ts`'teki AYNI desen — eşleme HER MODÜLE ÖZGÜ tutulur.
export const TIMESHEET_STATUS_LABELS: Record<TimesheetDayStatus, { label: string; color: ChipProps['color'] }> = {
  NORMAL: { label: 'Normal', color: 'success' },
  EKSIK: { label: 'Eksik', color: 'warning' },
  FAZLA_MESAI: { label: 'Fazla Mesai', color: 'info' },
  IZINLI: { label: 'İzinli', color: 'default' },
}
