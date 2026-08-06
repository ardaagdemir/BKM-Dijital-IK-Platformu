import type { ChipProps } from '@mui/material/Chip'
import type { ClubMembershipRequestStatus } from './types'

// `leave.statusLabels.ts`'teki AYNI desen.
export const CLUB_MEMBERSHIP_STATUS_LABELS: Record<
  ClubMembershipRequestStatus,
  { label: string; color: ChipProps['color'] }
> = {
  PENDING: { label: 'Bekliyor', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'success' },
  REJECTED: { label: 'Reddedildi', color: 'error' },
}
