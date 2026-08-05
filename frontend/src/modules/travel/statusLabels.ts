import type { ChipProps } from '@mui/material/Chip'
import type { ExpenseItemStatus } from './types'

// `leave.statusLabels.ts`'teki AYNI desen.
export const EXPENSE_ITEM_STATUS_LABELS: Record<ExpenseItemStatus, { label: string; color: ChipProps['color'] }> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
}
