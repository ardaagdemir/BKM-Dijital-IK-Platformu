import type { ChipProps } from '@mui/material/Chip'
import type { SuggestionStatus } from './types'

// `training.TRAINING_ENROLLMENT_STATUS_LABELS`'teki AYNI desen.
export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, { label: string; color: ChipProps['color'] }> = {
  PENDING: { label: 'Değerlendirmede', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'info' },
  COMPLETED: { label: 'Tamamlandı', color: 'success' },
}
