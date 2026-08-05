import type { ChipProps } from '@mui/material/Chip'
import type { CandidateStage, HiringRequestStatus } from './types'

// `StatusChip`in bu modüle özgü durum→{etiket,renk} eşlemeleri (bkz.
// leave/statusLabels.ts'teki AYNI desen: eşleme HER MODÜLE ÖZGÜ tutulur).
export const CANDIDATE_STAGE_LABELS: Record<CandidateStage, { label: string; color: ChipProps['color'] }> = {
  APPLICATION: { label: 'Başvuru', color: 'default' },
  INTERVIEW: { label: 'Mülakat', color: 'info' },
  OFFER: { label: 'Teklif', color: 'warning' },
  HIRED: { label: 'İşe Alındı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
}

export const HIRING_REQUEST_STATUS_LABELS: Record<HiringRequestStatus, { label: string; color: ChipProps['color'] }> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  MANAGER_APPROVED: { label: 'Yönetici Onayladı', color: 'info' },
  APPROVED: { label: 'Onaylandı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
}
