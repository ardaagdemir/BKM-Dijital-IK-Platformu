import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { RejectionReasonDialog, type RejectionReasonFormValues } from '../../../shared/components/RejectionReasonDialog'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useClubs } from '../api/useClubs'
import { useDecideMembershipRequest } from '../api/useDecideMembershipRequest'
import { useMembershipRequests } from '../api/useMembershipRequests'
import type { ClubMembershipRequest } from '../types'

// US-08G.1.1 kabul kriteri: "Talep İK onayına gider." — `employeeId`
// VERİLMEDEN çağrılır, TÜM talepler döner (bkz. ClubMembershipRequestService.list).
// Onaylayan rolü (İK) backend'de kısıtlı DEĞİL (`travel.ExpenseItemService.decide`'daki
// AYNI karar) — frontend'de ADMIN/IK'ya GÖRSEL olarak kısıtlanır.
export function ClubMembershipRequestsPage() {
  const { showToast } = useToast()
  const { data: requests, isPending, isError, refetch } = useMembershipRequests()
  const { data: clubs } = useClubs()
  const clubNameById = useMemo(() => new Map((clubs ?? []).map((c) => [c.id, c.name])), [clubs])
  const pendingRequests = useMemo(() => (requests ?? []).filter((r) => r.status === 'PENDING'), [requests])

  const decide = useDecideMembershipRequest()
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ClubMembershipRequest | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)

  async function handleApprove(request: ClubMembershipRequest) {
    setActionError(null)
    try {
      await decide.mutateAsync({ id: request.id, status: 'APPROVED', rejectionReason: null })
      showToast('Talep onaylandı')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  async function handleRejectSubmit(values: RejectionReasonFormValues) {
    if (!rejectTarget) {
      return
    }
    setRejectError(null)
    try {
      await decide.mutateAsync({ id: rejectTarget.id, status: 'REJECTED', rejectionReason: values.rejectionReason })
      showToast('Talep reddedildi')
      setRejectTarget(null)
    } catch (error) {
      setRejectError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<ClubMembershipRequest>[] = [
    { key: 'club', header: 'Kulüp', primary: true, render: (row) => clubNameById.get(row.clubId) ?? '—' },
    { key: 'employee', header: 'Çalışan', render: (row) => `#${row.employeeId}` },
  ]

  return (
    <>
      <PageHeader title="Kulüp Üyelik Talepleri" />
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Talepler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && pendingRequests.length === 0 && (
        <EmptyState message="Onay bekleyen üyelik talebi yok." />
      )}
      {!isPending && !isError && pendingRequests.length > 0 && (
        <ResponsiveTable
          columns={columns}
          rows={pendingRequests}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" loading={decide.isPending} onClick={() => handleApprove(row)}>
                Onayla
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => {
                  setRejectError(null)
                  setRejectTarget(row)
                }}
              >
                Reddet
              </Button>
            </Stack>
          )}
        />
      )}

      <RejectionReasonDialog
        open={!!rejectTarget}
        title="Üyelik Talebini Reddet"
        employeeLabel={rejectTarget ? `${clubNameById.get(rejectTarget.clubId) ?? ''} — #${rejectTarget.employeeId}` : ''}
        submitting={decide.isPending}
        errorMessage={rejectError}
        onSubmit={handleRejectSubmit}
        onCancel={() => setRejectTarget(null)}
      />
    </>
  )
}
