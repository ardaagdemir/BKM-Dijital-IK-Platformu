import Button from '@mui/material/Button'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useClubs } from '../api/useClubs'
import { useCreateMembershipRequest } from '../api/useCreateMembershipRequest'
import { useMembershipRequests } from '../api/useMembershipRequests'
import { CLUB_MEMBERSHIP_STATUS_LABELS } from '../statusLabels'
import type { Club, ClubMembershipRequest } from '../types'

// US-08G.1.1: Kulüpleri görüntüleme + üyelik talebi — `training.MyTrainingsPage`'deki
// AYNI "kendi employeeId'ni çöz, talep et, durumu göster" deseni.
export function ClubsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const {
    data: employee,
    isPending: isEmployeePending,
    isError: isEmployeeError,
    error: employeeError,
  } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const { data: clubs, isPending: isClubsPending, isError: isClubsError, refetch } = useClubs()
  const { data: myRequests } = useMembershipRequests(employee?.id)
  const latestStatusByClubId = useMemo(() => {
    const map = new Map<number, ClubMembershipRequest>()
    for (const request of myRequests ?? []) {
      const existing = map.get(request.clubId)
      if (!existing || request.id > existing.id) {
        map.set(request.clubId, request)
      }
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRequests])

  const createRequest = useCreateMembershipRequest()
  const [actionError, setActionError] = useState<string | null>(null)

  if (isEmployeePending) {
    return (
      <>
        <PageHeader title="Kulüpler" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Kulüpler" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  async function handleJoin(club: Club) {
    setActionError(null)
    try {
      await createRequest.mutateAsync({ clubId: club.id, employeeId: employee!.id })
      showToast('Üyelik talebi gönderildi')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Club>[] = [
    { key: 'name', header: 'Kulüp', primary: true, render: (row) => row.name },
    { key: 'leader', header: 'Lider', render: (row) => (row.leaderId ? `#${row.leaderId}` : '—') },
    {
      key: 'status',
      header: 'Üyelik Durumum',
      render: (row) => {
        const status = latestStatusByClubId.get(row.id)?.status
        return status ? <StatusChip {...CLUB_MEMBERSHIP_STATUS_LABELS[status]} /> : '—'
      },
    },
  ]

  return (
    <>
      <PageHeader title="Kulüpler" />
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}

      {isClubsPending && <LoadingSkeleton rows={4} />}
      {isClubsError && <ErrorState message="Kulüpler yüklenemedi." onRetry={() => refetch()} />}
      {!isClubsPending && !isClubsError && clubs?.length === 0 && <EmptyState message="Henüz bir kulüp tanımlanmadı." />}
      {!isClubsPending && !isClubsError && !!clubs?.length && (
        <ResponsiveTable
          columns={columns}
          rows={clubs}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/clubs/${row.id}`)}
          actions={(row) => {
            const status = latestStatusByClubId.get(row.id)?.status
            const alreadyRequested = status === 'PENDING' || status === 'APPROVED'
            return (
              <Button
                size="small"
                variant="outlined"
                disabled={alreadyRequested}
                loading={createRequest.isPending}
                onClick={(event) => {
                  event.stopPropagation()
                  handleJoin(row)
                }}
              >
                Üyelik Talep Et
              </Button>
            )
          }}
        />
      )}
    </>
  )
}
