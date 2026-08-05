import { useQueries, useQuery } from '@tanstack/react-query'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import * as organizationApi from '../../organization/api/organizationApi'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import * as leaveApi from '../api/leaveApi'
import { useDecideLeaveRequest } from '../api/useDecideLeaveRequest'
import { useLeaveTypes } from '../api/useLeaveTypes'
import { leaveKeys } from '../queryKeys'
import { RejectLeaveRequestDialog } from '../components/RejectLeaveRequestDialog'
import type { RejectionReasonFormValues } from '../schema'
import type { LeaveRequest } from '../types'

// US-04.2.2: "ekibimin bekleyen talepleri." `leave` modülü `organization`'a
// bağımlı OLMADIĞINDAN backend'de "benim ekibim" diye bir uç YOK (bkz.
// LeaveRequestAccessGuard) — bu sayfa ekibi TAMAMEN istemci tarafında
// birleştirir: 1) `useMyEmployee` ile KENDİ organizationUnitId'imi bul,
// 2) AYNI birimdeki diğer çalışanları listele, 3) her biri için AYRI bir
// izin talebi sorgusu çalıştır (toplu/N+1 önleyen bir uç YOK) ve PENDING
// olanları birleştir, 4) karar (decide) çağrısında ekip listesini
// `teamEmployeeIds` olarak GERİ gönder (backend'in @PreAuthorize'ının
// GÜVEN SINIRI — bkz. LeaveRequestAccessGuard javadoc'u).
export function LeaveApprovalsPage() {
  const { showToast } = useToast()
  const {
    data: myEmployee,
    isPending: isMyEmployeePending,
    isError: isMyEmployeeError,
    error: myEmployeeError,
  } = useMyEmployee()
  const employeeMissing = isMyEmployeeError && myEmployeeError instanceof ApiError && myEmployeeError.status === 404

  const organizationUnitId = myEmployee?.organizationUnitId ?? undefined

  const {
    data: teamPage,
    isPending: isTeamPending,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['leave', 'approvals', 'team', organizationUnitId],
    queryFn: () => organizationApi.searchEmployees({ organizationUnitId, page: 0, size: 100 }),
    enabled: !!organizationUnitId,
  })

  const teamMembers = useMemo(
    () => (teamPage?.content ?? []).filter((member) => member.id !== myEmployee?.id),
    [teamPage, myEmployee],
  )
  const teamEmployeeIds = useMemo(() => teamMembers.map((member) => member.id), [teamMembers])
  const employeeLabelById = useMemo(
    () => new Map(teamMembers.map((member) => [member.id, `${member.firstName} ${member.lastName}`])),
    [teamMembers],
  )

  const requestQueries = useQueries({
    queries: teamMembers.map((member) => ({
      queryKey: leaveKeys.requests.byEmployee(member.id),
      queryFn: () => leaveApi.listLeaveRequests(member.id),
    })),
  })
  const isRequestsPending = requestQueries.some((query) => query.isPending)
  const isRequestsError = requestQueries.some((query) => query.isError)
  const pendingRequests = useMemo(
    () =>
      requestQueries
        .flatMap((query) => query.data ?? [])
        .filter((request) => request.status === 'PENDING')
        .sort((a, b) => (a.startDate < b.startDate ? -1 : 1)),
    [requestQueries],
  )

  const { data: leaveTypes } = useLeaveTypes()
  const leaveTypeNameById = useMemo(() => new Map((leaveTypes ?? []).map((type) => [type.id, type.name])), [leaveTypes])

  const decideLeaveRequest = useDecideLeaveRequest()
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)

  async function handleApprove(request: LeaveRequest) {
    setActionError(null)
    try {
      await decideLeaveRequest.mutateAsync({
        id: request.id,
        request: { decision: 'APPROVED', rejectionReason: null },
        teamEmployeeIds,
      })
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
      await decideLeaveRequest.mutateAsync({
        id: rejectTarget.id,
        request: { decision: 'REJECTED', rejectionReason: values.rejectionReason },
        teamEmployeeIds,
      })
      showToast('Talep reddedildi')
      setRejectTarget(null)
    } catch (error) {
      setRejectError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  if (isMyEmployeePending) {
    return (
      <>
        <PageHeader title="Onay Bekleyenler" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Onay Bekleyenler" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isMyEmployeeError || !myEmployee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (!organizationUnitId) {
    return (
      <>
        <PageHeader title="Onay Bekleyenler" />
        <EmptyState message="Bir organizasyon birimine atanmadığınızdan ekibiniz belirlenemiyor." />
      </>
    )
  }

  if (isTeamPending || isRequestsPending) {
    return (
      <>
        <PageHeader title="Onay Bekleyenler" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isTeamError) {
    return <ErrorState message="Ekip bilgisi yüklenemedi." onRetry={() => refetchTeam()} />
  }

  if (isRequestsError) {
    return <ErrorState message="İzin talepleri yüklenemedi." onRetry={() => requestQueries.forEach((query) => query.refetch())} />
  }

  const columns: ResponsiveTableColumn<LeaveRequest>[] = [
    { key: 'employee', header: 'Çalışan', primary: true, render: (row) => employeeLabelById.get(row.employeeId) ?? '—' },
    { key: 'leaveType', header: 'İzin Türü', render: (row) => leaveTypeNameById.get(row.leaveTypeId) ?? '—' },
    { key: 'startDate', header: 'Başlangıç', render: (row) => row.startDate },
    { key: 'endDate', header: 'Bitiş', render: (row) => row.endDate },
    { key: 'requestedDays', header: 'Gün Sayısı', render: (row) => String(row.requestedDays) },
  ]

  return (
    <>
      <PageHeader title="Onay Bekleyenler" />
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}
      {teamMembers.length === 0 && <EmptyState message="Biriminizde başka bir çalışan yok." />}
      {teamMembers.length > 0 && pendingRequests.length === 0 && (
        <EmptyState message="Onay bekleyen izin talebi yok." />
      )}
      {pendingRequests.length > 0 && (
        <ResponsiveTable
          columns={columns}
          rows={pendingRequests}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" loading={decideLeaveRequest.isPending} onClick={() => handleApprove(row)}>
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

      <RejectLeaveRequestDialog
        open={!!rejectTarget}
        employeeLabel={rejectTarget ? (employeeLabelById.get(rejectTarget.employeeId) ?? '') : ''}
        submitting={decideLeaveRequest.isPending}
        errorMessage={rejectError}
        onSubmit={handleRejectSubmit}
        onCancel={() => setRejectTarget(null)}
      />
    </>
  )
}
